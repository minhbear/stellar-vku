import { env } from "@/lib/env";

export type StellarNetwork = "testnet" | "mainnet";

export interface StellarNetworkConfig {
  network: StellarNetwork;
  /** Value Freighter reports from `getNetwork()`. */
  freighterNetwork: "TESTNET" | "PUBLIC";
  networkPassphrase: string;
  horizonUrl: string;
  rpcUrl: string;
  friendbotUrl: string | null;
  explorer: {
    account: (address: string) => string;
    tx: (hash: string) => string;
    asset: (code: string, issuer: string) => string;
    contract: (contractId: string) => string;
  };
  labUrl: string;
}

// Passphrases are inlined instead of read from the SDK so this module stays free
// of the (large) stellar-sdk bundle — it is imported by server components too.
const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
const PUBLIC_PASSPHRASE = "Public Global Stellar Network ; September 2015";

function explorerFor(segment: "testnet" | "public") {
  const base = `https://stellar.expert/explorer/${segment}`;
  return {
    account: (address: string) => `${base}/account/${address}`,
    tx: (hash: string) => `${base}/tx/${hash}`,
    asset: (code: string, issuer: string) => `${base}/asset/${code}-${issuer}`,
    contract: (contractId: string) => `${base}/contract/${contractId}`,
  };
}

const CONFIGS: Record<StellarNetwork, StellarNetworkConfig> = {
  testnet: {
    network: "testnet",
    freighterNetwork: "TESTNET",
    networkPassphrase: TESTNET_PASSPHRASE,
    horizonUrl:
      env.NEXT_PUBLIC_STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org",
    rpcUrl: env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org",
    friendbotUrl: "https://friendbot.stellar.org",
    explorer: explorerFor("testnet"),
    labUrl: "https://lab.stellar.org",
  },
  mainnet: {
    network: "mainnet",
    freighterNetwork: "PUBLIC",
    networkPassphrase: PUBLIC_PASSPHRASE,
    horizonUrl: env.NEXT_PUBLIC_STELLAR_HORIZON_URL ?? "https://horizon.stellar.org",
    // No public default: mainnet RPC needs a provider-specific URL.
    rpcUrl: env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "",
    friendbotUrl: null,
    explorer: explorerFor("public"),
    labUrl: "https://lab.stellar.org",
  },
};

export const stellarConfig = CONFIGS[env.NEXT_PUBLIC_STELLAR_NETWORK];

export const isTestnet = stellarConfig.network === "testnet";

/** Well-known assets students can look up in the explorer during the lesson. */
export const KNOWN_ASSETS = [
  {
    code: "USDC",
    name: "Circle USD Coin",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    issuerName: "Circle",
    kind: "stablecoin",
  },
  {
    code: "EURC",
    name: "Circle Euro Coin",
    issuer: "GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2",
    issuerName: "Circle",
    kind: "stablecoin",
  },
  {
    code: "yXLM",
    name: "Ultra Stellar yieldXLM",
    issuer: "GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55",
    issuerName: "Ultra Stellar",
    kind: "wrapped",
  },
  {
    code: "AQUA",
    name: "Aquarius governance token",
    issuer: "GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA",
    issuerName: "Aquarius",
    kind: "utility",
  },
] as const;
