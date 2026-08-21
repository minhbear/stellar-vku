/**
 * Geometry and per-step choreography for the USDC issuance diagram.
 *
 * Kept out of the React tree so the drawing stays declarative: a step names the
 * nodes it highlights and the edges that carry money, and the component renders
 * that. Labels live in the message files — nothing here is user-visible text.
 */

export const VIEWBOX = { width: 880, height: 470 };

export type NodeId = "bank" | "mint" | "reserve" | "auditor" | "chain" | "wallet" | "market";

export interface SceneNode {
  id: NodeId;
  x: number;
  y: number;
  /** Which half of the diagram it belongs to — drives colour and the divider. */
  world: "fiat" | "chain";
  icon: "bank" | "mint" | "vault" | "audit" | "chain" | "wallet" | "market";
}

export const NODES: SceneNode[] = [
  { id: "bank", x: 96, y: 96, world: "fiat", icon: "bank" },
  { id: "mint", x: 440, y: 96, world: "fiat", icon: "mint" },
  { id: "reserve", x: 784, y: 96, world: "fiat", icon: "vault" },
  { id: "auditor", x: 784, y: 232, world: "fiat", icon: "audit" },
  { id: "chain", x: 440, y: 368, world: "chain", icon: "chain" },
  { id: "wallet", x: 96, y: 368, world: "chain", icon: "wallet" },
  { id: "market", x: 784, y: 368, world: "chain", icon: "market" },
];

export const NODE_BY_ID = Object.fromEntries(
  NODES.map((node) => [node.id, node]),
) as Record<NodeId, SceneNode>;

export type EdgeId =
  | "wireIn"
  | "toReserve"
  | "mintOrder"
  | "deliver"
  | "trade"
  | "tradeBack"
  | "sendBack"
  | "burn"
  | "release"
  | "wireOut"
  | "attest"
  | "interest";

export interface SceneEdge {
  id: EdgeId;
  from: NodeId;
  to: NodeId;
  /** Perpendicular bow, in user units. 0 draws a straight line. */
  curve: number;
  tone: "fiat" | "chain" | "brand";
  /** Where along the path the label sits, 0–1. */
  labelAt?: number;
  /**
   * Nudge for the label, in user units. The vertical edges cross the fiat /
   * on-chain divider exactly at their midpoint, so their labels have to move
   * off it.
   */
  labelOffset?: { x: number; y: number };
}

export const EDGES: SceneEdge[] = [
  { id: "wireIn", from: "bank", to: "mint", curve: -34, tone: "fiat" },
  { id: "wireOut", from: "mint", to: "bank", curve: -34, tone: "fiat" },
  { id: "toReserve", from: "mint", to: "reserve", curve: -34, tone: "fiat" },
  { id: "release", from: "reserve", to: "mint", curve: -34, tone: "fiat" },
  { id: "interest", from: "reserve", to: "mint", curve: 30, tone: "brand" },
  { id: "attest", from: "auditor", to: "reserve", curve: 0, tone: "fiat" },
  {
    id: "mintOrder",
    from: "mint",
    to: "chain",
    curve: 0,
    tone: "chain",
    labelAt: 0.32,
    labelOffset: { x: 46, y: 0 },
  },
  {
    id: "burn",
    from: "chain",
    to: "mint",
    curve: 0,
    tone: "chain",
    labelAt: 0.32,
    labelOffset: { x: -38, y: 0 },
  },
  { id: "deliver", from: "chain", to: "wallet", curve: 30, tone: "chain" },
  { id: "sendBack", from: "wallet", to: "chain", curve: 30, tone: "chain" },
  { id: "trade", from: "wallet", to: "market", curve: 46, tone: "chain" },
  { id: "tradeBack", from: "market", to: "wallet", curve: 46, tone: "chain" },
];

export const EDGE_BY_ID = Object.fromEntries(
  EDGES.map((edge) => [edge.id, edge]),
) as Record<EdgeId, SceneEdge>;

/** Radius used to pull edge endpoints off the node circles. */
export const NODE_RADIUS = 46;

export interface StepScene {
  id: string;
  highlight: NodeId[];
  /** Edges that animate a token/coin along them for this step. */
  active: EdgeId[];
  /** Bar values in whole units of the running example. */
  reserves: number;
  supply: number;
  /** Rendered as the meter caption when reserves and supply disagree. */
  balanced: boolean;
}

/**
 * One running example carried through the whole walkthrough: a business
 * depositing 1,000,000 USD and redeeming it again at the end.
 */
const EXAMPLE = 1_000_000;

export const STEP_SCENES: StepScene[] = [
  {
    id: "peg",
    highlight: ["wallet", "reserve"],
    active: [],
    reserves: 0,
    supply: 0,
    balanced: true,
  },
  {
    id: "onboard",
    highlight: ["bank", "mint"],
    active: [],
    reserves: 0,
    supply: 0,
    balanced: true,
  },
  {
    id: "deposit",
    highlight: ["bank", "mint"],
    active: ["wireIn"],
    reserves: EXAMPLE,
    supply: 0,
    balanced: false,
  },
  {
    id: "mint",
    highlight: ["mint", "chain", "wallet"],
    active: ["mintOrder", "deliver"],
    reserves: EXAMPLE,
    supply: EXAMPLE,
    balanced: true,
  },
  {
    id: "reserves",
    highlight: ["mint", "reserve", "auditor"],
    active: ["toReserve", "attest"],
    reserves: EXAMPLE,
    supply: EXAMPLE,
    balanced: true,
  },
  {
    id: "yield",
    highlight: ["reserve", "mint"],
    active: ["interest"],
    reserves: EXAMPLE,
    supply: EXAMPLE,
    balanced: true,
  },
  {
    id: "circulate",
    highlight: ["wallet", "market"],
    active: ["trade", "tradeBack"],
    reserves: EXAMPLE,
    supply: EXAMPLE,
    balanced: true,
  },
  {
    id: "redeem",
    highlight: ["wallet", "chain", "mint", "bank"],
    active: ["sendBack", "burn", "release", "wireOut"],
    reserves: 0,
    supply: 0,
    balanced: true,
  },
  {
    id: "stellar",
    highlight: ["chain", "wallet", "mint"],
    active: ["mintOrder", "deliver"],
    reserves: EXAMPLE,
    supply: EXAMPLE,
    balanced: true,
  },
];

export const EXAMPLE_AMOUNT = EXAMPLE;

/**
 * Quadratic path between two nodes, trimmed so it starts and ends outside the
 * node circles rather than under them.
 */
export function edgePath(edge: SceneEdge): string {
  const from = NODE_BY_ID[edge.from];
  const to = NODE_BY_ID[edge.to];

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;

  const startX = from.x + ux * NODE_RADIUS;
  const startY = from.y + uy * NODE_RADIUS;
  const endX = to.x - ux * NODE_RADIUS;
  const endY = to.y - uy * NODE_RADIUS;

  if (edge.curve === 0) {
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  // Control point offset along the normal of the segment.
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const controlX = midX + -uy * edge.curve;
  const controlY = midY + ux * edge.curve;

  return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
}

/** Approximate point on the quadratic curve, used to place edge labels. */
export function edgeLabelPoint(edge: SceneEdge, at = 0.5) {
  const from = NODE_BY_ID[edge.from];
  const to = NODE_BY_ID[edge.to];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;

  const startX = from.x + ux * NODE_RADIUS;
  const startY = from.y + uy * NODE_RADIUS;
  const endX = to.x - ux * NODE_RADIUS;
  const endY = to.y - uy * NODE_RADIUS;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const controlX = midX + -uy * edge.curve;
  const controlY = midY + ux * edge.curve;

  const t = at;
  const inverse = 1 - t;
  return {
    x: inverse * inverse * startX + 2 * inverse * t * controlX + t * t * endX,
    y: inverse * inverse * startY + 2 * inverse * t * controlY + t * t * endY,
  };
}
