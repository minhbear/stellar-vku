/**
 * Geometry and per-step choreography for the two case debriefs.
 *
 * Same idea as the stablecoin scene: a step names the nodes it highlights and
 * the edges that carry something, and the renderer draws that. No user-visible
 * text lives here — labels come from the message files, sublabels from the
 * seeded case data.
 */

export const VIEWBOX = { width: 880, height: 470 };

/** Radius used to pull edge endpoints off the node circles. */
export const NODE_RADIUS = 46;

export type Tone = "chain" | "fiat" | "brand" | "warning" | "success";

export type GraphIcon =
  | "database"
  | "ledger"
  | "explorer"
  | "wallet"
  | "trustline"
  | "history"
  | "payments"
  | "metadata"
  | "contract"
  | "asset"
  | "decoy"
  | "issuer"
  | "treasury"
  | "holders"
  | "lock"
  | "rules"
  | "frozen";

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  icon: GraphIcon;
  tone: Tone;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  /** Perpendicular bow, in user units. 0 draws a straight line. */
  curve: number;
  tone: Tone;
  /** Where along the path the label sits, 0–1. */
  labelAt?: number;
  labelOffset?: { x: number; y: number };
}

export interface GraphStep {
  id: string;
  highlight: string[];
  active: string[];
}

export interface Scene {
  nodes: GraphNode[];
  edges: GraphEdge[];
  steps: GraphStep[];
}

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

function endpoints(scene: Scene, edge: GraphEdge) {
  const byId = Object.fromEntries(scene.nodes.map((node) => [node.id, node]));
  const from = byId[edge.from];
  const to = byId[edge.to];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;

  return {
    startX: from.x + ux * NODE_RADIUS,
    startY: from.y + uy * NODE_RADIUS,
    endX: to.x - ux * NODE_RADIUS,
    endY: to.y - uy * NODE_RADIUS,
    ux,
    uy,
  };
}

/** Quadratic path, trimmed so it starts and ends outside the node circles. */
export function edgePath(scene: Scene, edge: GraphEdge): string {
  const { startX, startY, endX, endY, ux, uy } = endpoints(scene, edge);
  if (edge.curve === 0) return `M ${startX} ${startY} L ${endX} ${endY}`;

  const controlX = (startX + endX) / 2 + -uy * edge.curve;
  const controlY = (startY + endY) / 2 + ux * edge.curve;
  return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
}

/** Approximate point on the curve, used to place edge labels. */
export function edgeLabelPoint(scene: Scene, edge: GraphEdge, at = 0.5) {
  const { startX, startY, endX, endY, ux, uy } = endpoints(scene, edge);
  const controlX = (startX + endX) / 2 + -uy * edge.curve;
  const controlY = (startY + endY) / 2 + ux * edge.curve;
  const inverse = 1 - at;

  return {
    x: inverse * inverse * startX + 2 * inverse * at * controlX + at * at * endX,
    y: inverse * inverse * startY + 2 * inverse * at * controlY + at * at * endY,
  };
}

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
