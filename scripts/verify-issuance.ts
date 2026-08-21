/**
 * End-to-end check of the issuance engine against the real Stellar testnet.
 *
 * It drives the exact `IssuanceRunner` the wizard uses, but substitutes a local
 * keypair for the Freighter signature so the whole classic and SAC paths can be
 * verified without a browser wallet.
 *
 *   npx tsx scripts/verify-issuance.ts
 */
import * as StellarSdk from "@stellar/stellar-sdk";

import { IssuanceRunner } from "../src/lib/stellar/issue";
import { fundWithFriendbot, getAccountSummary, horizon } from "../src/lib/stellar/client";
import { stellarConfig } from "../src/lib/stellar/config";
import type { IssuanceParams } from "../src/lib/stellar/plan";

function log(...args: unknown[]) {
  console.log(...args);
}

async function runCase(label: string, overrides: Partial<IssuanceParams>) {
  log(`\n===== ${label} =====`);

  const holder = StellarSdk.Keypair.random();
  log("holder:", holder.publicKey());
  await fundWithFriendbot(holder.publicKey());

  const params: IssuanceParams = {
    mode: "classic",
    code: "VKUT01",
    name: "VKU Test Token",
    supply: "1000000",
    authRequired: false,
    authRevocable: false,
    clawbackEnabled: false,
    lockIssuer: false,
    recipient: holder.publicKey(),
    trustLimit: "1000000",
    ...overrides,
  };

  const runner = new IssuanceRunner(params, {
    // Stands in for the wallet: sign the trustline with the holder's own key.
    signWithWallet: async (xdr) => {
      const tx = StellarSdk.TransactionBuilder.fromXdr(
        xdr,
        stellarConfig.networkPassphrase,
      ) as StellarSdk.Transaction;
      tx.sign(holder);
      return tx.toXdr();
    },
    onProgress: (steps) => {
      const current = steps.find((s) => s.status === "running" || s.status === "awaitingSignature");
      if (current) log(`  → ${current.id} …`);
    },
  });

  const result = await runner.run();

  log("  issuer:      ", result.issuerPublicKey);
  log("  contract id: ", result.contractId ?? "(none)");
  log("  transactions:", Object.keys(result.hashes).length);

  const summary = await getAccountSummary(holder.publicKey());
  const line = summary.trustlines.find(
    (t) => t.code === params.code && t.issuer === result.issuerPublicKey,
  );
  log("  holder balance:", line ? `${line.balance} ${line.code}` : "NOT FOUND");
  log("  authorized:    ", line?.authorized);

  if (!line || Number(line.balance) !== Number(params.supply)) {
    throw new Error(`${label}: holder balance does not match the minted supply`);
  }

  // Horizon indexes new assets with a short delay, so this is reported rather
  // than asserted — the holder balance above is the real check.
  const assets = await horizon()
    .assets()
    .forCode(params.code)
    .forIssuer(result.issuerPublicKey)
    .call();
  log("  horizon asset records:", assets.records.length);

  if (result.contractId) {
    const derived = new StellarSdk.Asset(params.code, result.issuerPublicKey).contractId(
      stellarConfig.networkPassphrase,
    );
    if (derived !== result.contractId) {
      throw new Error(`${label}: SAC address mismatch`);
    }
    log("  SAC address matches the deterministic derivation ✓");
  }

  return result;
}

async function main() {
  log("network:", stellarConfig.network, "|", stellarConfig.networkPassphrase);

  await runCase("classic — plain asset", {
    mode: "classic",
    code: "VKUCLS",
  });

  await runCase("classic — flags + home domain + locked issuer", {
    mode: "classic",
    code: "VKUREG",
    homeDomain: "vku.udn.vn",
    authRequired: true,
    authRevocable: true,
    clawbackEnabled: true,
    lockIssuer: true,
  });

  await runCase("SAC — Stellar Asset Contract", {
    mode: "sac",
    code: "VKUSAC",
    supply: "250000.5",
    trustLimit: "250000.5",
  });

  log("\nAll issuance paths verified.");
}

main().catch((error) => {
  console.error("\nFAILED:", error);
  console.error(JSON.stringify(error, Object.getOwnPropertyNames(error ?? {}), 2).slice(0, 2000));
  process.exit(1);
});
