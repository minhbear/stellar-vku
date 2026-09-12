/**
 * Builds the two "detective" cases of the explorer workshop on the real Stellar
 * testnet and writes what it created to `src/lib/forensics/case-data.json`.
 *
 *   npx tsx scripts/seed-forensics.ts
 *
 * Testnet is wiped by SDF every few months, so re-run this before the workshop
 * and commit the regenerated JSON — the lesson copy never hard-codes an address,
 * every value the students hunt for comes from that file.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import * as StellarSdk from "@stellar/stellar-sdk";

import {
  fundWithFriendbot,
  getAccountSummary,
  horizon,
  submitClassic,
  submitSoroban,
} from "../src/lib/stellar/client";
import { stellarConfig } from "../src/lib/stellar/config";

const OUT = resolve(import.meta.dirname, "../src/lib/forensics/case-data.json");
const PASSPHRASE = stellarConfig.networkPassphrase;

function log(...args: unknown[]) {
  console.log(...args);
}

/** One transaction, however many operations, signed by whoever is needed. */
async function send(
  source: StellarSdk.Keypair,
  ops: StellarSdk.xdr.Operation[],
  signers: StellarSdk.Keypair[] = [],
): Promise<string> {
  const account = await horizon().loadAccount(source.publicKey());
  const builder = new StellarSdk.TransactionBuilder(account, {
    fee: String(Number(StellarSdk.BASE_FEE) * Math.max(ops.length, 1)),
    networkPassphrase: PASSPHRASE,
  });
  for (const op of ops) builder.addOperation(op);
  const tx = builder.setTimeout(180).build();
  tx.sign(source, ...signers);
  const { hash } = await submitClassic(tx);
  return hash;
}

/** Soroban path — only the SAC deploy needs it. */
async function sendSoroban(
  source: StellarSdk.Keypair,
  operation: StellarSdk.xdr.Operation,
): Promise<string> {
  const { rpc } = await import("../src/lib/stellar/client");
  const server = rpc();
  const account = await server.getAccount(source.publicKey());
  const raw = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(180)
    .build();
  const prepared = await server.prepareTransaction(raw);
  prepared.sign(source);
  const { hash } = await submitSoroban(prepared);
  return hash;
}

/** Picks an asset code nobody else on testnet has issued yet. */
async function freeAssetCode(base: string): Promise<string> {
  for (let suffix = 1; suffix <= 99; suffix += 1) {
    const code = `${base}${String(suffix).padStart(2, "0")}`;
    const response = await fetch(
      `${stellarConfig.horizonUrl}/assets?asset_code=${code}&limit=1`,
    );
    const body = (await response.json()) as { _embedded?: { records?: unknown[] } };
    if ((body._embedded?.records ?? []).length === 0) return code;
    log(`  code ${code} is taken, trying the next one`);
  }
  throw new Error(`No free asset code for ${base}`);
}

const CREATE_BALANCE = "30";

function createAccount(destination: StellarSdk.Keypair, startingBalance = CREATE_BALANCE) {
  return StellarSdk.Operation.createAccount({
    destination: destination.publicKey(),
    startingBalance,
  });
}

async function main() {
  log(`network: ${stellarConfig.network} — ${stellarConfig.horizonUrl}`);

  // ── one funded account pays for every other one ────────────────────────────
  const bank = StellarSdk.Keypair.random();
  log("\nfunding the seeding account with friendbot…");
  await fundWithFriendbot(bank.publicKey());
  log("bank:", bank.publicKey());

  // ── case 01 — read one wallet ──────────────────────────────────────────────
  const payroll = StellarSdk.Keypair.random(); // "VKU bursary" — creates the subject
  const usdIssuer = StellarSdk.Keypair.random();
  const pointsIssuer = StellarSdk.Keypair.random();
  const canteen = StellarSdk.Keypair.random();
  const friend = StellarSdk.Keypair.random();
  const subject = StellarSdk.Keypair.random(); // the wallet under investigation

  const usdCode = await freeAssetCode("VKUSD");
  const pointsCode = await freeAssetCode("VKUPT");
  const usd = new StellarSdk.Asset(usdCode, usdIssuer.publicKey());
  const points = new StellarSdk.Asset(pointsCode, pointsIssuer.publicKey());
  log(`\ncase 01 assets: ${usdCode}, ${pointsCode}`);

  log("creating case 01 accounts…");
  await send(bank, [
    createAccount(payroll, "200"),
    createAccount(usdIssuer, "60"),
    createAccount(pointsIssuer, "60"),
    createAccount(canteen),
    createAccount(friend),
  ]);

  log("payroll creates the subject wallet…");
  const birthTx = await send(payroll, [createAccount(subject, "120")]);

  log("subject sets a home domain and a data entry…");
  await send(subject, [
    StellarSdk.Operation.setOptions({ homeDomain: "case01.vku.stellar" }),
    StellarSdk.Operation.manageData({ name: "vku:case", value: "01" }),
  ]);

  log("trustlines…");
  await send(
    bank,
    [
      StellarSdk.Operation.changeTrust({ asset: usd, limit: "10000", source: subject.publicKey() }),
      StellarSdk.Operation.changeTrust({ asset: points, limit: "100000", source: subject.publicKey() }),
      StellarSdk.Operation.changeTrust({ asset: usd, limit: "100000", source: canteen.publicKey() }),
    ],
    [subject, canteen],
  );

  log("scholarship payments in…");
  await send(usdIssuer, [
    StellarSdk.Operation.payment({ destination: subject.publicKey(), asset: usd, amount: "2500" }),
  ]);
  await send(usdIssuer, [
    StellarSdk.Operation.payment({ destination: subject.publicKey(), asset: usd, amount: "1200" }),
  ]);
  await send(pointsIssuer, [
    StellarSdk.Operation.payment({ destination: subject.publicKey(), asset: points, amount: "8000" }),
  ]);

  log("subject spends…");
  await send(subject, [
    StellarSdk.Operation.payment({ destination: canteen.publicKey(), asset: usd, amount: "450" }),
  ]);
  await send(subject, [
    StellarSdk.Operation.payment({
      destination: friend.publicKey(),
      asset: StellarSdk.Asset.native(),
      amount: "25",
    }),
  ]);

  // ── case 02 — trace an airdrop ─────────────────────────────────────────────
  const issuer = StellarSdk.Keypair.random();
  const treasury = StellarSdk.Keypair.random();
  const recipients = Array.from({ length: 6 }, () => StellarSdk.Keypair.random());
  const mule = StellarSdk.Keypair.random(); // gets a forwarded slice, no airdrop
  const decoyIssuer = StellarSdk.Keypair.random();
  const decoyHolder = StellarSdk.Keypair.random();

  const airCode = await freeAssetCode("VKUAIR");
  const air = new StellarSdk.Asset(airCode, issuer.publicKey());
  const decoy = new StellarSdk.Asset(airCode, decoyIssuer.publicKey());
  log(`\ncase 02 asset: ${airCode}`);

  log("creating case 02 accounts…");
  await send(bank, [
    createAccount(issuer, "60"),
    createAccount(treasury, "60"),
    ...recipients.map((kp) => createAccount(kp)),
    createAccount(mule),
    createAccount(decoyIssuer, "60"),
    createAccount(decoyHolder),
  ]);

  const AMOUNTS = ["50000", "35000", "25000", "12500", "7500", "2500"];
  const SUPPLY = "1000000";
  const FORWARD = "10000";

  log("trustlines for the whole distribution…");
  await send(
    bank,
    [
      StellarSdk.Operation.changeTrust({ asset: air, limit: SUPPLY, source: treasury.publicKey() }),
      ...recipients.map((kp) =>
        StellarSdk.Operation.changeTrust({ asset: air, limit: "100000", source: kp.publicKey() }),
      ),
      StellarSdk.Operation.changeTrust({ asset: air, limit: "100000", source: mule.publicKey() }),
      StellarSdk.Operation.changeTrust({ asset: decoy, limit: SUPPLY, source: decoyHolder.publicKey() }),
      // One airdrop recipient also trusts the look-alike, so its account page
      // shows two balances with the identical code — that is the whole lesson,
      // and it is visible without leaving the explorer.
      StellarSdk.Operation.changeTrust({
        asset: decoy,
        limit: "100000",
        source: recipients[3].publicKey(),
      }),
    ],
    [treasury, ...recipients, mule, decoyHolder],
  );

  log("issuer mints the whole supply into the treasury…");
  const mintTx = await send(issuer, [
    StellarSdk.Operation.payment({ destination: treasury.publicKey(), asset: air, amount: SUPPLY }),
  ]);

  log("deploying the Stellar Asset Contract for the asset…");
  const contractId = air.contractId(PASSPHRASE);
  const sacTx = await sendSoroban(
    issuer,
    StellarSdk.Operation.createStellarAssetContract({ asset: air }),
  );
  log("contract:", contractId);

  // Two batches on purpose: a student who stops at the first transaction only
  // finds four of the six recipients.
  log("airdrop batch 1/2…");
  const airdropTx1 = await send(
    treasury,
    recipients.slice(0, 4).map((kp, index) =>
      StellarSdk.Operation.payment({
        destination: kp.publicKey(),
        asset: air,
        amount: AMOUNTS[index],
      }),
    ),
  );
  log("airdrop batch 2/2…");
  const airdropTx2 = await send(
    treasury,
    recipients.slice(4).map((kp, index) =>
      StellarSdk.Operation.payment({
        destination: kp.publicKey(),
        asset: air,
        amount: AMOUNTS[index + 4],
      }),
    ),
  );

  log("one recipient forwards part of the airdrop…");
  const forwardTx = await send(recipients[2], [
    StellarSdk.Operation.payment({ destination: mule.publicKey(), asset: air, amount: FORWARD }),
  ]);

  log("issuer publishes a home domain and locks its master key…");
  const lockTx = await send(issuer, [
    StellarSdk.Operation.setOptions({ homeDomain: "vku-airdrop.stellar" }),
    StellarSdk.Operation.setOptions({ masterWeight: 0 }),
  ]);

  const DECOY_CONFUSED = "40000";
  log("the look-alike asset…");
  await send(decoyIssuer, [
    StellarSdk.Operation.setOptions({ homeDomain: "vku-airdrop-official.io" }),
    StellarSdk.Operation.payment({
      destination: decoyHolder.publicKey(),
      asset: decoy,
      amount: "960000",
    }),
    StellarSdk.Operation.payment({
      destination: recipients[3].publicKey(),
      asset: decoy,
      amount: DECOY_CONFUSED,
    }),
  ]);

  // ── case 03 — homework: a regulated stablecoin that keeps its powers ──────
  const bankIssuer = StellarSdk.Keypair.random();
  const bankTreasury = StellarSdk.Keypair.random();
  const customers = Array.from({ length: 4 }, () => StellarSdk.Keypair.random());

  const vndCode = await freeAssetCode("VKUVND");
  const vnd = new StellarSdk.Asset(vndCode, bankIssuer.publicKey());
  log(`\ncase 03 asset: ${vndCode}`);

  log("creating case 03 accounts…");
  await send(bank, [
    createAccount(bankIssuer, "60"),
    createAccount(bankTreasury, "60"),
    ...customers.map((kp) => createAccount(kp)),
  ]);

  // The flags have to exist before any trustline does: a trustline only carries
  // the clawback flag if the issuer had it enabled when the line was created.
  log("issuer turns on the compliance flags…");
  const flagsTx = await send(bankIssuer, [
    StellarSdk.Operation.setOptions({
      setFlags:
        StellarSdk.AuthRequiredFlag |
        StellarSdk.AuthRevocableFlag |
        StellarSdk.AuthClawbackEnabledFlag,
      homeDomain: "vku-bank.stellar",
    }),
  ]);

  const MINT_1 = "500000";
  const MINT_2 = "250000";
  const PAYOUTS = ["12000", "8500", "30000", "5000"];
  const SPEND = "2000";
  const BURN = "6000";
  const CLAWBACK = "5000";

  log("trustlines, then the issuer authorises every one of them…");
  await send(
    bank,
    [
      StellarSdk.Operation.changeTrust({
        asset: vnd,
        limit: "1000000",
        source: bankTreasury.publicKey(),
      }),
      ...customers.map((kp) =>
        StellarSdk.Operation.changeTrust({
          asset: vnd,
          limit: "100000",
          source: kp.publicKey(),
        }),
      ),
    ],
    [bankTreasury, ...customers],
  );
  await send(
    bankIssuer,
    [bankTreasury, ...customers].map((kp) =>
      StellarSdk.Operation.setTrustLineFlags({
        trustor: kp.publicKey(),
        asset: vnd,
        flags: { authorized: true },
      }),
    ),
  );

  log("first issuance…");
  const mint1Tx = await send(bankIssuer, [
    StellarSdk.Operation.payment({
      destination: bankTreasury.publicKey(),
      asset: vnd,
      amount: MINT_1,
    }),
  ]);

  log("paying out to four customers…");
  const payoutTx = await send(
    bankTreasury,
    customers.map((kp, index) =>
      StellarSdk.Operation.payment({
        destination: kp.publicKey(),
        asset: vnd,
        amount: PAYOUTS[index],
      }),
    ),
  );

  log("ordinary customer-to-customer payment…");
  await send(customers[0], [
    StellarSdk.Operation.payment({
      destination: customers[1].publicKey(),
      asset: vnd,
      amount: SPEND,
    }),
  ]);

  log("one customer sends tokens back to the issuer…");
  const burnTx = await send(customers[2], [
    StellarSdk.Operation.payment({
      destination: bankIssuer.publicKey(),
      asset: vnd,
      amount: BURN,
    }),
  ]);

  log("issuer claws tokens back from another customer…");
  const clawbackTx = await send(bankIssuer, [
    StellarSdk.Operation.clawback({
      from: customers[3].publicKey(),
      asset: vnd,
      amount: CLAWBACK,
    }),
  ]);

  log("issuer freezes the first customer…");
  const freezeTx = await send(bankIssuer, [
    StellarSdk.Operation.setTrustLineFlags({
      trustor: customers[0].publicKey(),
      asset: vnd,
      flags: { authorized: false },
    }),
  ]);

  log("second issuance, so the supply is visibly not fixed…");
  const mint2Tx = await send(bankIssuer, [
    StellarSdk.Operation.payment({
      destination: bankTreasury.publicKey(),
      asset: vnd,
      amount: MINT_2,
    }),
  ]);

  // ── read the ledger back so the answers are what Horizon really reports ────
  const subjectAccount = await horizon().loadAccount(subject.publicKey());
  const held = subjectAccount.balances.filter((b) => b.asset_type !== "native");
  const usdBalance = held.find(
    (b) => "asset_code" in b && b.asset_code === usdCode,
  ) as { balance: string } | undefined;
  const pointsBalance = held.find(
    (b) => "asset_code" in b && b.asset_code === pointsCode,
  ) as { balance: string } | undefined;

  const vndStats = (await (
    await fetch(
      `${stellarConfig.horizonUrl}/assets?asset_code=${vndCode}&asset_issuer=${bankIssuer.publicKey()}`,
    )
  ).json()) as {
    _embedded: { records: Array<{ balances: Record<string, string> }> };
  };
  const vndBalances = vndStats._embedded.records[0]?.balances ?? {};
  const vndTotal = Object.values(vndBalances).reduce(
    (sum, value) => sum + Number(value),
    0,
  );

  const customerBalances = await Promise.all(
    customers.map(async (kp) => {
      const summary = await getAccountSummary(kp.publicKey());
      const line = summary.trustlines.find((entry) => entry.code === vndCode);
      return {
        address: kp.publicKey(),
        balance: line?.balance ?? "0",
        authorized: line?.authorized ?? false,
      };
    }),
  );

  const data = {
    network: stellarConfig.network,
    generatedAt: new Date().toISOString(),
    case1: {
      subject: subject.publicKey(),
      creator: payroll.publicKey(),
      homeDomain: "case01.vku.stellar",
      dataEntry: { key: "vku:case", value: "01" },
      trustlineCount: held.length,
      birthTx,
      holdings: [
        { code: usdCode, issuer: usdIssuer.publicKey(), balance: usdBalance?.balance ?? "0" },
        { code: pointsCode, issuer: pointsIssuer.publicKey(), balance: pointsBalance?.balance ?? "0" },
      ],
      spend: { code: usdCode, destination: canteen.publicKey(), amount: "450" },
      xlmSpend: { destination: friend.publicKey(), amount: "25" },
    },
    case2: {
      code: airCode,
      issuer: issuer.publicKey(),
      contractId,
      supply: SUPPLY,
      treasury: treasury.publicKey(),
      issuerHomeDomain: "vku-airdrop.stellar",
      issuerLocked: true,
      recipients: recipients.map((kp, index) => ({
        address: kp.publicKey(),
        amount: AMOUNTS[index],
      })),
      forward: { from: recipients[2].publicKey(), to: mule.publicKey(), amount: FORWARD },
      decoy: {
        issuer: decoyIssuer.publicKey(),
        holder: decoyHolder.publicKey(),
        homeDomain: "vku-airdrop-official.io",
        supply: SUPPLY,
        /** Airdrop recipient that also holds the look-alike token. */
        confusedHolder: recipients[3].publicKey(),
        confusedAmount: DECOY_CONFUSED,
      },
      txs: {
        mint: mintTx,
        sac: sacTx,
        airdrop1: airdropTx1,
        airdrop2: airdropTx2,
        forward: forwardTx,
        lock: lockTx,
      },
    },
    case3: {
      code: vndCode,
      issuer: bankIssuer.publicKey(),
      issuerHomeDomain: "vku-bank.stellar",
      treasury: bankTreasury.publicKey(),
      subject: customers[0].publicKey(),
      /** Everything ever issued and not destroyed, unauthorised lines included. */
      supply: String(vndTotal),
      supplyAuthorized: vndBalances.authorized ?? "0",
      mints: [MINT_1, MINT_2],
      customers: customerBalances,
      spend: { to: customers[1].publicKey(), amount: SPEND },
      burn: { address: customers[2].publicKey(), amount: BURN },
      clawback: { address: customers[3].publicKey(), amount: CLAWBACK },
      frozen: { address: customers[0].publicKey(), balance: customerBalances[0].balance },
      txs: {
        flags: flagsTx,
        mint1: mint1Tx,
        payout: payoutTx,
        burn: burnTx,
        clawback: clawbackTx,
        freeze: freezeTx,
        mint2: mint2Tx,
      },
    },
  };

  writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
  log(`\nwrote ${OUT}`);
  log(`case 01 subject:  ${stellarConfig.explorer.account(subject.publicKey())}`);
  log(`case 02 contract: ${stellarConfig.explorer.contract(contractId)}`);
  log(`case 03 subject:  ${stellarConfig.explorer.account(customers[0].publicKey())}`);
  log(`case 03 asset:    ${stellarConfig.explorer.asset(vndCode, bankIssuer.publicKey())}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
