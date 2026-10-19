/**
 * The two demo dapps students use in module 4. They live in their own repo and
 * deploy separately, so the links are configurable: set the env vars once the
 * apps are live and the cards turn into real links.
 */
export interface DappLink {
  id: "sharebill" | "escrow";
  url: string;
  repo: string;
}

export const DAPPS: DappLink[] = [
  {
    id: "sharebill",
    url: process.env.NEXT_PUBLIC_SHAREBILL_URL ?? "",
    repo: "https://github.com/minhbear/stellar-vku-dapp/tree/main/apps/sharebill",
  },
  {
    id: "escrow",
    url: process.env.NEXT_PUBLIC_ESCROW_URL ?? "",
    repo: "https://github.com/minhbear/stellar-vku-dapp/tree/main/apps/escrow",
  },
];

export const DAPP_REPO = "https://github.com/minhbear/stellar-vku-dapp";
