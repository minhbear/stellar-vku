/**
 * Scenes for the three mission debriefs. The geometry helpers and types are
 * shared with the finance module and live in `@/components/diagram/graph`.
 * No user-visible text lives here: labels come from the message files,
 * sublabels from the seeded case data.
 */

import type { Scene } from "@/components/diagram/graph";

/* ── case 01 — one wallet under the microscope ───────────────────────────── */

export const CASE_1_SCENE: Scene = {
  nodes: [
    { id: "core", x: 140, y: 62, icon: "database", tone: "fiat" },
    { id: "ledger", x: 440, y: 62, icon: "ledger", tone: "brand" },
    { id: "expert", x: 740, y: 62, icon: "explorer", tone: "brand" },
    { id: "account", x: 440, y: 270, icon: "wallet", tone: "chain" },
    { id: "trust", x: 150, y: 190, icon: "trustline", tone: "chain" },
    { id: "meta", x: 150, y: 375, icon: "metadata", tone: "chain" },
    { id: "payments", x: 730, y: 375, icon: "payments", tone: "chain" },
    { id: "ops", x: 730, y: 190, icon: "history", tone: "chain" },
  ],
  edges: [
    { id: "ingest", from: "core", to: "ledger", curve: -30, tone: "fiat" },
    { id: "serve", from: "ledger", to: "expert", curve: -30, tone: "brand" },
    { id: "query", from: "ledger", to: "account", curve: 0, tone: "brand", labelAt: 0.5, labelOffset: { x: 52, y: 0 } },
    { id: "entry", from: "account", to: "trust", curve: 0, tone: "chain" },
    { id: "metadata", from: "account", to: "meta", curve: 0, tone: "chain" },
    { id: "history", from: "account", to: "ops", curve: 0, tone: "chain" },
    { id: "flow", from: "account", to: "payments", curve: 0, tone: "chain" },
  ],
  steps: [
    { id: "pipeline", highlight: ["core", "ledger", "expert"], active: ["ingest", "serve"] },
    { id: "identity", highlight: ["ledger", "account"], active: ["query"] },
    { id: "trustlines", highlight: ["account", "trust"], active: ["entry"] },
    { id: "history", highlight: ["account", "ops", "payments"], active: ["history", "flow"] },
    { id: "metadata", highlight: ["account", "meta"], active: ["metadata"] },
  ],
};

/* ── case 02 — following an airdrop ──────────────────────────────────────── */

export const CASE_2_SCENE: Scene = {
  nodes: [
    { id: "contract", x: 120, y: 70, icon: "contract", tone: "chain" },
    { id: "asset", x: 440, y: 70, icon: "asset", tone: "brand" },
    { id: "decoy", x: 760, y: 70, icon: "decoy", tone: "warning" },
    { id: "issuer", x: 120, y: 235, icon: "issuer", tone: "chain" },
    { id: "treasury", x: 440, y: 235, icon: "treasury", tone: "chain" },
    { id: "holders", x: 760, y: 235, icon: "holders", tone: "success" },
    { id: "keys", x: 120, y: 400, icon: "lock", tone: "fiat" },
    { id: "mule", x: 760, y: 400, icon: "wallet", tone: "warning" },
  ],
  edges: [
    { id: "resolve", from: "contract", to: "asset", curve: 0, tone: "chain" },
    { id: "identify", from: "asset", to: "issuer", curve: 0, tone: "brand", labelAt: 0.45 },
    { id: "lookalike", from: "asset", to: "decoy", curve: -28, tone: "warning" },
    { id: "mint", from: "issuer", to: "treasury", curve: -28, tone: "chain" },
    { id: "airdrop", from: "treasury", to: "holders", curve: -28, tone: "chain" },
    {
      id: "trustline",
      from: "holders",
      to: "treasury",
      curve: -28,
      tone: "fiat",
      // Shares the corridor with the airdrop edge — push its label clear of it.
      labelOffset: { x: 0, y: 14 },
    },
    { id: "forward", from: "holders", to: "mule", curve: 0, tone: "warning", labelOffset: { x: 62, y: 0 } },
    { id: "lock", from: "issuer", to: "keys", curve: 0, tone: "fiat", labelOffset: { x: 60, y: 0 } },
  ],
  steps: [
    { id: "address", highlight: ["contract", "asset"], active: ["resolve"] },
    { id: "identity", highlight: ["asset", "issuer", "decoy"], active: ["identify", "lookalike"] },
    { id: "mint", highlight: ["issuer", "treasury"], active: ["mint"] },
    { id: "fanout", highlight: ["treasury", "holders"], active: ["trustline", "airdrop"] },
    { id: "secondary", highlight: ["holders", "mule"], active: ["forward"] },
    { id: "lock", highlight: ["issuer", "keys"], active: ["lock"] },
    {
      id: "checklist",
      highlight: ["contract", "asset", "issuer", "treasury", "holders", "mule"],
      active: ["mint", "airdrop", "forward"],
    },
  ],
};

/* ── case 03 — homework: a stablecoin issuer that keeps its powers ───────── */

export const CASE_3_SCENE: Scene = {
  nodes: [
    { id: "rules", x: 120, y: 80, icon: "rules", tone: "warning" },
    { id: "issuer", x: 120, y: 245, icon: "issuer", tone: "chain" },
    { id: "treasury", x: 400, y: 245, icon: "treasury", tone: "chain" },
    { id: "subject", x: 700, y: 140, icon: "frozen", tone: "warning" },
    { id: "victim", x: 700, y: 350, icon: "wallet", tone: "warning" },
    { id: "burner", x: 280, y: 420, icon: "payments", tone: "fiat" },
  ],
  edges: [
    { id: "flags", from: "issuer", to: "rules", curve: 0, tone: "warning", labelOffset: { x: 58, y: 0 } },
    { id: "mint", from: "issuer", to: "treasury", curve: -26, tone: "chain" },
    { id: "payout", from: "treasury", to: "subject", curve: -22, tone: "chain" },
    { id: "payout2", from: "treasury", to: "victim", curve: 22, tone: "chain" },
    // Arched clear of the payout edges: these two are the issuer reaching past
    // the distributor and straight into a customer's balance.
    { id: "freeze", from: "issuer", to: "subject", curve: -90, tone: "warning", labelAt: 0.55 },
    { id: "claw", from: "issuer", to: "victim", curve: 90, tone: "warning", labelAt: 0.55 },
    { id: "burn", from: "burner", to: "issuer", curve: 0, tone: "fiat" },
  ],
  steps: [
    { id: "wallet", highlight: ["subject", "treasury"], active: ["payout"] },
    { id: "token", highlight: ["issuer", "treasury"], active: ["mint"] },
    { id: "permission", highlight: ["issuer", "rules"], active: ["flags"] },
    { id: "freeze", highlight: ["issuer", "subject"], active: ["freeze"] },
    { id: "clawback", highlight: ["issuer", "victim"], active: ["payout2", "claw"] },
    { id: "supply", highlight: ["issuer", "treasury", "burner"], active: ["mint", "burn"] },
    {
      id: "verdict",
      highlight: ["issuer", "rules", "treasury", "subject", "victim", "burner"],
      active: ["mint", "payout", "freeze", "claw"],
    },
  ],
};
