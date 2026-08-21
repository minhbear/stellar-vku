# Stellar × VKU — Tokenization

Teaching site for the Stellar module of the VKU fintech course. Frontend only
(Next.js App Router), no backend: everything that touches the chain happens in
the browser against the Stellar **testnet**.

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000 → redirects to /en
```

## What is in it

| Route | What it does |
|---|---|
| `/[locale]` | Onboarding: what the course covers, what to install before the last lesson |
| `/[locale]/learn/tokenization` | Concepts recap — fungibility, metadata, Stellar asset types, trustlines, explorers, plus a five-question self-check |
| `/[locale]/learn/tokenization/stablecoin` | Step-through visualisation of Circle's USDC issuance loop |
| `/[locale]/learn/tokenization/issue-token` | Wizard that issues a real token on testnet from the student's own wallet |

Locales are `en` (source of truth) and `vi`. Messages live in
`src/messages/*.json`; the course structure lives in `src/lib/curriculum.ts`.

## The issuance wizard

The student connects Freighter and gets the whole supply of a token they named.
To make that possible without handing anyone a secret key, the app generates a
**throwaway issuer keypair in the browser tab**, funds it from Friendbot, and
uses it to sign the issuer-side operations. The student signs exactly one
transaction — the trustline — which is also the point of the lesson.

Two modes, both producing a real asset on the ledger:

- **Classic asset** — `changeTrust` from the wallet, then a `payment` from the
  issuer. This is how USDC and nearly every Stellar asset works.
- **Stellar Asset Contract** — the same asset, plus
  `createStellarAssetContract` and a `mint()` invocation through the contract,
  so the token is reachable from Soroban.

Optional issuer flags (`AUTH_REQUIRED`, `AUTH_REVOCABLE`, clawback) and locking
the issuer are exposed as switches so students can see the extra transactions
they add.

The step plan is in `src/lib/stellar/plan.ts` (SDK-free, so the review screen can
show it without pulling in `@stellar/stellar-sdk`); the executor is
`src/lib/stellar/issue.ts`.

### Verifying the chain code

`npm run verify:issuance` drives the real `IssuanceRunner` against testnet,
substituting a local keypair for the wallet signature. It covers the plain
classic path, the regulated path (flags + home domain + locked issuer), and the
SAC path, and asserts the minted balance and the derived contract address.

## Conventions

Documented in `.agents/skills/`:

- `nextjs-app-router` — Server Components by default, `"use client"` at the
  leaves, explicit caching, `loading`/`error` boundaries
- `design-system` / `ui-components` — semantic tokens only, no hardcoded colours
- `stellar-ui-patterns` — address and amount display, wallet states, transaction
  lifecycle, human-readable errors
- `forms-and-validation` — react-hook-form + zod, string amounts, full addresses
  on confirmation screens

Two project-specific rules worth repeating:

- **Amounts stay strings.** `src/lib/stellar/format.ts` converts through
  `bigint`; `Number()` on a token supply loses precision.
- **Entrance animations are CSS, not JS.** Chrome pauses `requestAnimationFrame`
  in background tabs, which leaves a framer-motion entrance frozen at
  `opacity: 0`. The `.animate-rise` utility in `globals.css` uses
  `animation-fill-mode: both`, so content is readable no matter what. Interactive
  motion (diagram particles, status ticks) still uses framer-motion.

## Environment

Only `NEXT_PUBLIC_STELLAR_NETWORK` is required, and it defaults to `testnet`.
See `.env.example`. Pointing this at mainnet also needs a provider-specific
`NEXT_PUBLIC_STELLAR_RPC_URL` — and is not something to do during class.
