/**
 * Types and the step plan for a token issuance. Deliberately free of any
 * `@stellar/stellar-sdk` import so the review screen can show what will happen
 * without pulling the SDK into the page bundle.
 */
import type { IssueMode } from "@/lib/schemas/token";

export type IssuanceStepId =
  | "createIssuer"
  | "fundIssuer"
  | "configureIssuer"
  | "deploySac"
  | "createTrustline"
  | "authorizeTrustline"
  | "mint"
  | "lockIssuer";

export type StepStatus =
  | "pending"
  | "running"
  | "awaitingSignature"
  | "done"
  | "failed";

export type StepSigner = "issuer" | "wallet" | "none";

export interface IssuanceStep {
  id: IssuanceStepId;
  status: StepStatus;
  /** Who signs this step — drives the "check your wallet" hint in the UI. */
  signer: StepSigner;
  hash?: string;
  errorCode?: string;
  errorDetail?: string;
}

export interface IssuanceParams {
  mode: IssueMode;
  code: string;
  name: string;
  description?: string;
  supply: string;
  homeDomain?: string;
  authRequired: boolean;
  authRevocable: boolean;
  clawbackEnabled: boolean;
  lockIssuer: boolean;
  /** The connected wallet — it receives the whole supply. */
  recipient: string;
  /** Trustline cap the recipient sets; defaults to the full supply. */
  trustLimit?: string;
}

export interface IssuanceResult {
  mode: IssueMode;
  code: string;
  name: string;
  supply: string;
  recipient: string;
  issuerPublicKey: string;
  /** Throwaway testnet key, kept in memory only so students can inspect it. */
  issuerSecret: string;
  contractId?: string;
  locked: boolean;
  hashes: Partial<Record<IssuanceStepId, string>>;
}

export const STEP_SIGNERS: Record<IssuanceStepId, StepSigner> = {
  createIssuer: "none",
  fundIssuer: "none",
  configureIssuer: "issuer",
  deploySac: "issuer",
  createTrustline: "wallet",
  authorizeTrustline: "issuer",
  mint: "issuer",
  lockIssuer: "issuer",
};

export function planIssuance(params: IssuanceParams): IssuanceStepId[] {
  const needsConfigure =
    params.authRequired ||
    params.authRevocable ||
    params.clawbackEnabled ||
    Boolean(params.homeDomain);

  return [
    "createIssuer",
    "fundIssuer",
    ...(needsConfigure ? (["configureIssuer"] as const) : []),
    // The SAC has to exist before it can mint, and deploying it does not depend
    // on the trustline — so it slots in right after the issuer is configured.
    ...(params.mode === "sac" ? (["deploySac"] as const) : []),
    "createTrustline",
    ...(params.authRequired ? (["authorizeTrustline"] as const) : []),
    "mint",
    ...(params.lockIssuer ? (["lockIssuer"] as const) : []),
  ];
}

/** Message key for a step's label/body, accounting for the SAC mint variant. */
export function stepMessageKey(id: IssuanceStepId, mode: IssueMode): string {
  if (id === "mint" && mode === "sac") return "mintSac";
  return id;
}
