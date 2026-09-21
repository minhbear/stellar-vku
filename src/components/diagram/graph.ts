/**
 * Shared geometry for the step-by-step flow diagrams (explorer missions and the
 * finance module). A step names the nodes it highlights and the edges that
 * carry something; `FlowGraph` draws that. No user-visible text lives here.
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
  | "frozen"
  | "person"
  | "family"
  | "bank"
  | "network"
  | "fees"
  | "cash"
  | "anchor"
  | "stablecoin"
  | "bureau"
  | "house"
  | "pool"
  | "oracle"
  | "backstop"
  | "liquidator";

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
