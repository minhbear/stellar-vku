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
| `/[locale]/learn/forensics` | Mission 01: read one wallet in Stellar Expert (creator, holdings, history, what it claims about itself) |
| `/[locale]/learn/forensics/airdrop` | Mission 02: trace a token airdrop from a bare token address to every holder |
| `/[locale]/learn/forensics/frozen-wallet` | Mission 03 (homework): a frozen customer wallet and an issuer that kept approval, freezing and clawback |
| `/[locale]/learn/finance` | Cross-border payments: 500 USD through banks and SWIFT, then through MoneyGram and USDC on Stellar, plus the life of a transaction |
| `/[locale]/learn/finance/lending` | Lending: a secured loan at a Vietnamese bank next to a Blend lending pool, and how to borrow on Blend testnet |

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

## The explorer missions

Module 2 is a workshop, not a reading: each lesson hands the student one address,
asks questions whose answers are only findable by clicking around Stellar Expert,
and unlocks a step-through walkthrough once every question is answered. A
lecturer can open the walkthrough early with a button.

Missions 01 and 02 are taught in the room. Mission 03 is the homework: same
shape, eight questions, and `homework` on `CaseWorkspace` changes the locked
panel to say so.

The audience is non-technical, so **the lessons never mention an API, an
endpoint or a query**. Hints name boxes and tabs in the explorer UI ("Summary
box", "Account Signers", "History tab") and link straight to the page where the
answer is visible. Copy carries no em dashes.

The data is **real, seeded testnet data**, not fixtures:

```bash
npm run seed:forensics   # builds both cases on testnet, rewrites the case data
```

`scripts/seed-forensics.ts` creates the accounts, assets, trustlines, payments,
the Stellar Asset Contract, the batched airdrop, a second-hop
transfer, a locked issuer, a same-code look-alike asset, and for mission 03 a
regulated stablecoin whose issuer approves every holder, freezes one of them and
claws tokens back from another — one airdrop
recipient deliberately holds both, so the explorer shows it two identical token
codes side by side — then writes everything to `src/lib/forensics/case-data.json`.

SDF wipes testnet every few months, so **re-run the seed before the workshop**
and commit the regenerated JSON. Nothing else needs touching: no lesson copy
contains an address, `src/lib/forensics/cases.ts` derives every answer and every
explorer link from that file, and the walkthrough diagrams label their nodes
from it.

Answers are checked in the browser (normalised: case-folded addresses,
`1,000,000` = `1000000.0000000`). A student who opens devtools can read them —
this is a self-check during a workshop, not an exam.

## The finance module

Module 3 compares a banking service with its on-chain version, twice
(remittance vs MoneyGram on Stellar, bank loan vs Blend). Each comparison is a
`FlowWalkthrough`: the shared `FlowGraph` diagram (also used by the explorer
debriefs, `src/components/diagram/`), a strip of running numbers and a clock,
then two or three lines of text per step. Scenes live in
`src/components/finance/scenes.ts`; the numbers there are one illustrative
example per walkthrough, not market data. Same audience as Module 2: no
contract internals, no API vocabulary.

## Conventions

Documented in `.agents/skills/`:

- `nextjs-app-router` — Server Components by default, `"use client"` at the
  leaves, explicit caching, `loading`/`error` boundaries
- `design-system` / `ui-components` — semantic tokens only, no hardcoded colours
- `stellar-ui-patterns` — address and amount display, wallet states, transaction
  lifecycle, human-readable errors
- `forms-and-validation` — react-hook-form + zod, string amounts, full addresses
  on confirmation screens

Three project-specific rules worth repeating:

- **Amounts stay strings.** `src/lib/stellar/format.ts` converts through
  `bigint`; `Number()` on a token supply loses precision.
- **No address is ever written in a message file.** Copy is translated, ledger
  data is generated. Everything the explorer missions point at comes from
  `case-data.json` through `cases.ts`.
- **Entrance animations are CSS, not JS.** Chrome pauses `requestAnimationFrame`
  in background tabs, which leaves a framer-motion entrance frozen at
  `opacity: 0`. The `.animate-rise` utility in `globals.css` uses
  `animation-fill-mode: both`, so content is readable no matter what. Interactive
  motion (diagram particles, status ticks) still uses framer-motion.

## Environment

Only `NEXT_PUBLIC_STELLAR_NETWORK` is required, and it defaults to `testnet`.
See `.env.example`. Pointing this at mainnet also needs a provider-specific
`NEXT_PUBLIC_STELLAR_RPC_URL` — and is not something to do during class.
