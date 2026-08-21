import { z } from "zod";

/**
 * Single place where `process.env` is read. Everything else imports from here so
 * a missing or malformed variable fails loudly at startup instead of at the
 * moment a student clicks "Issue token".
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_STELLAR_NETWORK: z.enum(["testnet", "mainnet"]).default("testnet"),
  NEXT_PUBLIC_STELLAR_HORIZON_URL: z.url().optional(),
  NEXT_PUBLIC_STELLAR_RPC_URL: z.url().optional(),
});

// Next inlines `process.env.NEXT_PUBLIC_*` only for statically written accesses,
// so they are listed one by one rather than spreading `process.env`.
const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
  NEXT_PUBLIC_STELLAR_HORIZON_URL: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL,
  NEXT_PUBLIC_STELLAR_RPC_URL: process.env.NEXT_PUBLIC_STELLAR_RPC_URL,
});

if (!parsed.success) {
  throw new Error(
    `Invalid public environment variables:\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = parsed.data;
