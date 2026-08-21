import * as StellarSdk from "@stellar/stellar-sdk";

import { stellarConfig } from "./config";
import { StellarActionError, toStellarError } from "./errors";
import {
  fundWithFriendbot,
  getAccountSummary,
  horizon,
  rpc,
  submitClassic,
  submitSoroban,
} from "./client";
import { toStroops } from "./format";
import {
  STEP_SIGNERS,
  planIssuance,
  type IssuanceParams,
  type IssuanceResult,
  type IssuanceStep,
  type IssuanceStepId,
} from "./plan";

export type SignWithWallet = (xdr: string) => Promise<string>;

export interface IssuanceDeps {
  signWithWallet: SignWithWallet;
  onProgress: (steps: IssuanceStep[]) => void;
}

/**
 * Runs the on-chain issuance one step at a time and reports progress after each
 * transition. Calling `run()` again after a failure resumes from the step that
 * failed, so a rejected wallet prompt or a flaky RPC does not restart the flow
 * (and never re-creates the issuer account).
 */
export class IssuanceRunner {
  readonly params: IssuanceParams;
  private readonly deps: IssuanceDeps;
  private steps: IssuanceStep[];

  private issuerKeypair: StellarSdk.Keypair | null = null;
  private contractId: string | undefined;

  constructor(params: IssuanceParams, deps: IssuanceDeps) {
    this.params = params;
    this.deps = deps;
    this.steps = planIssuance(params).map((id) => ({
      id,
      status: "pending",
      signer: STEP_SIGNERS[id],
    }));
  }

  getSteps(): IssuanceStep[] {
    return this.steps;
  }

  private update(id: IssuanceStepId, patch: Partial<IssuanceStep>) {
    this.steps = this.steps.map((step) =>
      step.id === id ? { ...step, ...patch } : step,
    );
    this.deps.onProgress(this.steps);
  }

  private get asset(): StellarSdk.Asset {
    if (!this.issuerKeypair) throw new StellarActionError("unknown", "Issuer not created");
    return new StellarSdk.Asset(this.params.code, this.issuerKeypair.publicKey());
  }

  private buildIssuerTx(
    // Horizon returns an `AccountResponse`; RPC returns an `Account`. Both
    // satisfy what TransactionBuilder needs.
    account: StellarSdk.Horizon.AccountResponse | StellarSdk.Account,
    operation: StellarSdk.xdr.Operation,
  ): StellarSdk.Transaction {
    return new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: stellarConfig.networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(180)
      .build();
  }

  private async loadIssuerAccount() {
    if (!this.issuerKeypair) throw new StellarActionError("unknown", "Issuer not created");
    return horizon().loadAccount(this.issuerKeypair.publicKey());
  }

  private async signAndSubmitAsIssuer(
    operation: StellarSdk.xdr.Operation,
  ): Promise<string> {
    const account = await this.loadIssuerAccount();
    const tx = this.buildIssuerTx(account, operation);
    tx.sign(this.issuerKeypair!);
    const { hash } = await submitClassic(tx);
    return hash;
  }

  private async signAndSubmitSorobanAsIssuer(
    operation: StellarSdk.xdr.Operation,
  ): Promise<string> {
    const server = rpc();
    const account = await server.getAccount(this.issuerKeypair!.publicKey());
    const raw = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: stellarConfig.networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(180)
      .build();

    const prepared = await server.prepareTransaction(raw);
    prepared.sign(this.issuerKeypair!);
    const { hash } = await submitSoroban(prepared);
    return hash;
  }

  async run(): Promise<IssuanceResult> {
    for (const step of this.steps) {
      if (step.status === "done") continue;

      this.update(step.id, {
        status: step.signer === "wallet" ? "awaitingSignature" : "running",
        errorCode: undefined,
        errorDetail: undefined,
      });

      try {
        const hash = await this.execute(step.id);
        this.update(step.id, { status: "done", hash });
      } catch (error) {
        const mapped = toStellarError(error);
        this.update(step.id, {
          status: "failed",
          errorCode: mapped.code,
          errorDetail: mapped.detail,
        });
        throw mapped;
      }
    }

    return {
      mode: this.params.mode,
      code: this.params.code,
      name: this.params.name,
      supply: this.params.supply,
      recipient: this.params.recipient,
      issuerPublicKey: this.issuerKeypair!.publicKey(),
      issuerSecret: this.issuerKeypair!.secret(),
      contractId: this.contractId,
      locked: this.params.lockIssuer,
      hashes: Object.fromEntries(
        this.steps.filter((s) => s.hash).map((s) => [s.id, s.hash!]),
      ),
    };
  }

  private async execute(id: IssuanceStepId): Promise<string | undefined> {
    switch (id) {
      case "createIssuer":
        return this.createIssuer();
      case "fundIssuer":
        return this.fundIssuer();
      case "configureIssuer":
        return this.configureIssuer();
      case "deploySac":
        return this.deploySac();
      case "createTrustline":
        return this.createTrustline();
      case "authorizeTrustline":
        return this.authorizeTrustline();
      case "mint":
        return this.mint();
      case "lockIssuer":
        return this.lockIssuer();
    }
  }

  // ---------------------------------------------------------------- steps ---

  private async createIssuer(): Promise<undefined> {
    // A real project keeps the issuer key in an HSM or a multisig setup. On
    // testnet a throwaway key is what lets the token land in the student's own
    // wallet instead of in an account they cannot see.
    this.issuerKeypair ??= StellarSdk.Keypair.random();
    return undefined;
  }

  private async fundIssuer(): Promise<undefined> {
    await fundWithFriendbot(this.issuerKeypair!.publicKey());
    return undefined;
  }

  private async configureIssuer(): Promise<string> {
    let setFlags = 0;
    if (this.params.authRequired) setFlags |= StellarSdk.AuthRequiredFlag;
    if (this.params.authRevocable) setFlags |= StellarSdk.AuthRevocableFlag;
    if (this.params.clawbackEnabled) setFlags |= StellarSdk.AuthClawbackEnabledFlag;

    return this.signAndSubmitAsIssuer(
      StellarSdk.Operation.setOptions({
        ...(setFlags ? { setFlags } : {}),
        ...(this.params.homeDomain ? { homeDomain: this.params.homeDomain } : {}),
      }),
    );
  }

  private async deploySac(): Promise<string> {
    const asset = this.asset;
    // The SAC address is derived from (asset, network), so it is known before
    // the deploy transaction is even submitted.
    this.contractId = asset.contractId(stellarConfig.networkPassphrase);
    return this.signAndSubmitSorobanAsIssuer(
      StellarSdk.Operation.createStellarAssetContract({ asset }),
    );
  }

  private async createTrustline(): Promise<string> {
    const asset = this.asset;
    const account = await horizon().loadAccount(this.params.recipient);

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: stellarConfig.networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset,
          limit: this.params.trustLimit ?? this.params.supply,
        }),
      )
      .setTimeout(180)
      .build();

    // stellar-sdk v17 renamed toXDR/fromXDR to toXdr/fromXdr.
    const signedXdr = await this.deps.signWithWallet(tx.toXdr());
    const signed = StellarSdk.TransactionBuilder.fromXdr(
      signedXdr,
      stellarConfig.networkPassphrase,
    ) as StellarSdk.Transaction;

    const { hash } = await submitClassic(signed);
    return hash;
  }

  private async authorizeTrustline(): Promise<string> {
    return this.signAndSubmitAsIssuer(
      StellarSdk.Operation.setTrustLineFlags({
        trustor: this.params.recipient,
        asset: this.asset,
        flags: { authorized: true },
      }),
    );
  }

  private async mint(): Promise<string> {
    if (this.params.mode === "classic") {
      // On Stellar, "minting" a classic asset is just a payment from the issuer:
      // the asset comes into existence as it leaves the issuing account.
      return this.signAndSubmitAsIssuer(
        StellarSdk.Operation.payment({
          destination: this.params.recipient,
          asset: this.asset,
          amount: this.params.supply,
        }),
      );
    }

    // SAC path: the contract's admin is the issuing account, so `mint` is
    // authorised by the issuer signing the invocation as the source account.
    const contract = new StellarSdk.Contract(this.contractId!);
    const operation = contract.call(
      "mint",
      StellarSdk.Address.fromString(this.params.recipient).toScVal(),
      StellarSdk.nativeToScVal(toStroops(this.params.supply), { type: "i128" }),
    );
    return this.signAndSubmitSorobanAsIssuer(operation);
  }

  private async lockIssuer(): Promise<string> {
    return this.signAndSubmitAsIssuer(
      StellarSdk.Operation.setOptions({ masterWeight: 0 }),
    );
  }
}

/** Pre-flight the wallet account so the wizard can offer friendbot funding. */
export async function checkRecipientReady(address: string) {
  const summary = await getAccountSummary(address);
  return {
    ...summary,
    // 1 XLM base reserve + 0.5 XLM per subentry; a new trustline adds one.
    hasReserveHeadroom: Number(summary.xlmBalance) >= 1.6,
  };
}
