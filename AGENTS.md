<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project — Stellar × VKU

Teaching site for the VKU Stellar course. Next.js App Router, frontend only,
Stellar **testnet**. See `README.md` for the routes and the issuance flow.

Conventions live in `.agents/skills/` — read the one that matches the file you
are touching (`nextjs-app-router`, `ui-components`, `design-system`,
`stellar-ui-patterns`, `forms-and-validation`, `ui-motion`, `frontend-perf`).
Stellar SDK usage: `.claude/skills/` (`assets`, `dapp`, `data`, `standards`).

Non-obvious rules:

- **English is the source of truth** for copy. Every key added to
  `src/messages/en.json` must be added to `vi.json` in the same change.
- **Amounts are strings end to end.** Convert through `bigint` with
  `src/lib/stellar/format.ts`. Never `Number()` a supply or balance.
- **Entrance animations are CSS** (`.animate-rise`), not framer-motion.
  Background tabs pause `requestAnimationFrame`, which freezes a JS entrance at
  `opacity: 0` and hides the lesson. Interactive motion may still use
  framer-motion because the tab is by definition in the foreground.
- **`@stellar/stellar-sdk` must stay out of the initial bundle.** Reach it
  through `await import(...)` from a client component. `src/lib/stellar/plan.ts`
  exists so the review screen can describe the transactions without it.
- `stellar-sdk` v17 renamed `toXDR`/`fromXDR` to `toXdr`/`fromXdr`.
- After changing anything under `src/lib/stellar/`, run
  `npm run verify:issuance` — it exercises all three issuance paths on testnet.
