/**
 * The two demo dapps students use in module 4. They live in their own repo and
 * deploy separately, so each url defaults to the deployed app and the env var
 * is only an override: point it elsewhere to demo a local or staging build.
 */
export interface DappLink {
  id: "sharebill" | "escrow";
  url: string;
  repo: string;
}

export const DAPPS: DappLink[] = [
  {
    id: "sharebill",
    url:
      process.env.NEXT_PUBLIC_SHAREBILL_URL ??
      "https://sharebill-production.up.railway.app",
    repo: "https://github.com/minhbear/stellar-vku-dapp/tree/main/apps/sharebill",
  },
  {
    id: "escrow",
    url:
      process.env.NEXT_PUBLIC_ESCROW_URL ??
      "https://escrow-production-6fd3.up.railway.app",
    repo: "https://github.com/minhbear/stellar-vku-dapp/tree/main/apps/escrow",
  },
];

export const DAPP_REPO = "https://github.com/minhbear/stellar-vku-dapp";
