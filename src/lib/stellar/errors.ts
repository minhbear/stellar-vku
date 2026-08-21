/**
 * Maps raw Stellar / Freighter failures onto a small set of codes the UI can
 * translate. Students should never see `op_underfunded` — but a lecturer
 * debugging a demo should still be able to open "Details" and find it.
 */
export type StellarErrorCode =
  | "walletNotInstalled"
  | "walletRejected"
  | "walletLocked"
  | "wrongNetwork"
  | "accountNotFunded"
  | "insufficientFee"
  | "underfunded"
  | "noDestination"
  | "noTrust"
  | "notAuthorized"
  | "badSequence"
  | "txTooLate"
  | "lowReserve"
  | "trustLimitExceeded"
  | "assetAlreadyExists"
  | "friendbotFailed"
  | "simulationFailed"
  | "network"
  | "unknown";

export class StellarActionError extends Error {
  readonly code: StellarErrorCode;
  /** Raw upstream text, shown only behind a "Details" disclosure. */
  readonly detail?: string;

  constructor(code: StellarErrorCode, detail?: string) {
    super(code);
    this.name = "StellarActionError";
    this.code = code;
    this.detail = detail;
  }
}

const OP_CODE_MAP: Record<string, StellarErrorCode> = {
  op_underfunded: "underfunded",
  op_no_destination: "noDestination",
  op_no_trust: "noTrust",
  op_not_authorized: "notAuthorized",
  op_low_reserve: "lowReserve",
  op_line_full: "trustLimitExceeded",
  op_limit_exceeded: "trustLimitExceeded",
  op_invalid_limit: "trustLimitExceeded",
};

const TX_CODE_MAP: Record<string, StellarErrorCode> = {
  tx_insufficient_fee: "insufficientFee",
  tx_bad_seq: "badSequence",
  tx_too_late: "txTooLate",
  tx_no_source_account: "accountNotFunded",
  tx_insufficient_balance: "underfunded",
};

interface HorizonErrorShape {
  response?: {
    data?: {
      status?: number;
      title?: string;
      detail?: string;
      extras?: {
        result_codes?: { transaction?: string; operations?: string[] };
      };
    };
  };
}

function readResultCodes(error: unknown) {
  const extras = (error as HorizonErrorShape | undefined)?.response?.data?.extras;
  return {
    transaction: extras?.result_codes?.transaction,
    operations: extras?.result_codes?.operations ?? [],
  };
}

export function toStellarError(error: unknown): StellarActionError {
  if (error instanceof StellarActionError) return error;

  const { transaction, operations } = readResultCodes(error);
  const raw =
    (error as HorizonErrorShape)?.response?.data?.detail ??
    (error instanceof Error ? error.message : String(error));
  const detailParts = [transaction, ...operations].filter(Boolean);
  const detail = detailParts.length ? detailParts.join(" · ") : raw;

  for (const op of operations) {
    const mapped = OP_CODE_MAP[op];
    if (mapped) return new StellarActionError(mapped, detail);
  }
  if (transaction && TX_CODE_MAP[transaction]) {
    return new StellarActionError(TX_CODE_MAP[transaction], detail);
  }

  const message = String(raw).toLowerCase();
  if (message.includes("user declined") || message.includes("user rejected")) {
    return new StellarActionError("walletRejected", detail);
  }
  if (message.includes("not found") && message.includes("account")) {
    return new StellarActionError("accountNotFunded", detail);
  }
  if (message.includes("failed to fetch") || message.includes("networkerror")) {
    return new StellarActionError("network", detail);
  }
  if (message.includes("simulation")) {
    return new StellarActionError("simulationFailed", detail);
  }

  return new StellarActionError("unknown", detail);
}
