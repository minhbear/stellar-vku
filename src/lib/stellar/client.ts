import * as StellarSdk from "@stellar/stellar-sdk";

import { stellarConfig } from "./config";
import { StellarActionError, toStellarError } from "./errors";

/**
 * Lazily created SDK servers. This module pulls in the (large) stellar-sdk, so
 * every importer reaches it through `await import(...)` from a client component
 * — it must never end up in the initial page bundle.
 */
let horizonServer: StellarSdk.Horizon.Server | null = null;
let rpcServer: StellarSdk.rpc.Server | null = null;

export function horizon(): StellarSdk.Horizon.Server {
  horizonServer ??= new StellarSdk.Horizon.Server(stellarConfig.horizonUrl);
  return horizonServer;
}

export function rpc(): StellarSdk.rpc.Server {
  if (!stellarConfig.rpcUrl) {
    throw new StellarActionError(
      "network",
      "No Soroban RPC URL configured for this network",
    );
  }
  rpcServer ??= new StellarSdk.rpc.Server(stellarConfig.rpcUrl);
  return rpcServer;
}

export interface AccountSummary {
  exists: boolean;
  address: string;
  xlmBalance: string;
  /** Reserve locked by subentries — students hit this when adding trustlines. */
  subentryCount: number;
  trustlines: Array<{
    code: string;
    issuer: string;
    balance: string;
    limit: string;
    authorized: boolean;
  }>;
}

export async function getAccountSummary(address: string): Promise<AccountSummary> {
  try {
    const account = await horizon().loadAccount(address);
    const native = account.balances.find((b) => b.asset_type === "native");

    return {
      exists: true,
      address,
      xlmBalance: native?.balance ?? "0",
      subentryCount: account.subentry_count,
      trustlines: account.balances
        .filter(
          (b): b is Extract<typeof b, { asset_code: string; asset_issuer: string }> =>
            b.asset_type === "credit_alphanum4" || b.asset_type === "credit_alphanum12",
        )
        .map((b) => ({
          code: b.asset_code,
          issuer: b.asset_issuer,
          balance: b.balance,
          limit: b.limit,
          authorized: b.is_authorized ?? true,
        })),
    };
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      return {
        exists: false,
        address,
        xlmBalance: "0",
        subentryCount: 0,
        trustlines: [],
      };
    }
    throw toStellarError(error);
  }
}

/** Testnet only — creates and funds an account with the SDF friendbot. */
export async function fundWithFriendbot(address: string): Promise<void> {
  const friendbotUrl = stellarConfig.friendbotUrl;
  if (!friendbotUrl) {
    throw new StellarActionError("friendbotFailed", "Friendbot exists on testnet only");
  }

  const response = await fetch(`${friendbotUrl}?addr=${encodeURIComponent(address)}`);
  if (response.ok) return;

  const body = await response.text().catch(() => "");
  // Friendbot answers 400 when the account already exists — that is success here.
  if (body.includes("op_already_exists") || body.includes("createAccountAlreadyExist")) {
    return;
  }
  throw new StellarActionError("friendbotFailed", body.slice(0, 400) || response.statusText);
}

export async function submitClassic(
  transaction: StellarSdk.Transaction,
): Promise<{ hash: string }> {
  try {
    const response = await horizon().submitTransaction(transaction);
    return { hash: response.hash };
  } catch (error) {
    throw toStellarError(error);
  }
}

export async function submitSoroban(
  transaction: StellarSdk.Transaction,
): Promise<{ hash: string; returnValue?: StellarSdk.xdr.ScVal }> {
  const server = rpc();
  try {
    const sent = await server.sendTransaction(transaction);
    if (sent.status === "ERROR") {
      throw new StellarActionError(
        "simulationFailed",
        JSON.stringify(sent.errorResult ?? sent).slice(0, 400),
      );
    }

    const result = await server.pollTransaction(sent.hash, { attempts: 15 });
    if (result.status !== StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new StellarActionError(
        "unknown",
        `Soroban transaction ${sent.hash} ended as ${result.status}`,
      );
    }
    return { hash: sent.hash, returnValue: result.returnValue };
  } catch (error) {
    throw toStellarError(error);
  }
}
