"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  Coins,
  Landmark,
  Layers3,
  ScrollText,
  Store,
  Wallet,
} from "lucide-react";

import { RollingNumber } from "@/components/stablecoin/rolling-number";
import {
  EDGES,
  EDGE_BY_ID,
  NODES,
  VIEWBOX,
  edgeLabelPoint,
  edgePath,
  type EdgeId,
  type NodeId,
  type SceneNode,
  type StepScene,
} from "@/components/stablecoin/scene";
import { cn } from "@/lib/utils";

const ICONS: Record<SceneNode["icon"], typeof Building2> = {
  bank: Building2,
  mint: Landmark,
  vault: Coins,
  audit: ScrollText,
  chain: Layers3,
  wallet: Wallet,
  market: Store,
};

const TONE_COLOR: Record<"fiat" | "chain" | "brand", string> = {
  fiat: "var(--fiat)",
  chain: "var(--chain)",
  brand: "var(--brand)",
};

function percent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

export function IssuanceDiagram({
  scene,
  maxAmount,
}: {
  scene: StepScene;
  maxAmount: number;
}) {
  const t = useTranslations("stablecoin.diagram");
  const reduce = useReducedMotion();

  const activeSet = new Set<EdgeId>(scene.active);
  const highlightSet = new Set<NodeId>(scene.highlight);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-border bg-card p-3 sm:p-4">
        <div
          className="relative mx-auto aspect-[880/470] min-w-[680px]"
          role="img"
          aria-label={t("title")}
        >
          <svg
            viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
            className="absolute inset-0 size-full"
            aria-hidden="true"
          >
            <defs>
              {EDGES.map((edge) => (
                <path key={edge.id} id={`edge-${edge.id}`} d={edgePath(edge)} fill="none" />
              ))}
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
              </marker>
            </defs>

            {/* Divider between the off-chain and on-chain halves. */}
            <line
              x1="24"
              y1="232"
              x2={VIEWBOX.width - 24}
              y2="232"
              stroke="var(--border)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            <text x="28" y="222" fill="var(--muted-foreground)" fontSize="11">
              {t("fiatWorld")}
            </text>
            <text x="28" y="250" fill="var(--muted-foreground)" fontSize="11">
              {t("chainWorld")}
            </text>

            {EDGES.map((edge) => {
              const active = activeSet.has(edge.id);
              return (
                <use
                  key={edge.id}
                  href={`#edge-${edge.id}`}
                  stroke={active ? TONE_COLOR[edge.tone] : "var(--border)"}
                  strokeWidth={active ? 2.25 : 1.25}
                  strokeLinecap="round"
                  markerEnd={active ? "url(#arrow)" : undefined}
                  opacity={active ? 1 : 0.45}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Coins travelling along the active edges. */}
            {scene.active.map((edgeId) => {
              const edge = EDGE_BY_ID[edgeId];
              if (reduce) {
                const point = edgeLabelPoint(edge, 0.5);
                return (
                  <circle
                    key={`dot-${edgeId}`}
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill={TONE_COLOR[edge.tone]}
                  />
                );
              }
              return (
                <circle key={`dot-${edgeId}`} r="5.5" fill={TONE_COLOR[edge.tone]}>
                  <animateMotion dur="2.4s" repeatCount="indefinite" rotate="auto">
                    <mpath href={`#edge-${edgeId}`} />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.12;0.88;1"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </circle>
              );
            })}

            {scene.active.map((edgeId) => {
              const edge = EDGE_BY_ID[edgeId];
              const point = edgeLabelPoint(edge, edge.labelAt ?? 0.5);
              const offset = edge.curve >= 0 ? 16 : -10;
              return (
                <text
                  key={`label-${edgeId}`}
                  x={point.x + (edge.labelOffset?.x ?? 0)}
                  y={point.y + offset + (edge.labelOffset?.y ?? 0)}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="500"
                  fill={TONE_COLOR[edge.tone]}
                >
                  {t(`edges.${edgeId}`)}
                </text>
              );
            })}
          </svg>

          {NODES.map((node) => {
            const Icon = ICONS[node.icon];
            const active = highlightSet.has(node.id);
            const color = node.world === "fiat" ? "var(--fiat)" : "var(--chain)";

            return (
              <div
                key={node.id}
                className="absolute w-32 -translate-x-1/2 -translate-y-1/2 text-center"
                style={{
                  left: percent(node.x, VIEWBOX.width),
                  top: percent(node.y, VIEWBOX.height),
                }}
              >
                <motion.span
                  animate={
                    reduce ? undefined : { scale: active ? 1.06 : 1 }
                  }
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  className={cn(
                    "mx-auto flex size-14 items-center justify-center rounded-2xl border-2 bg-card transition-colors duration-300",
                    active ? "shadow-md" : "opacity-60",
                  )}
                  style={{
                    borderColor: active ? color : "var(--border)",
                    color: active ? color : "var(--muted-foreground)",
                  }}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </motion.span>
                <span
                  className={cn(
                    "mt-1.5 block text-xs leading-tight font-semibold transition-opacity duration-300",
                    !active && "opacity-60",
                  )}
                >
                  {t(`nodes.${node.id}.label`)}
                </span>
                <span
                  className={cn(
                    "block text-[10px] leading-tight text-muted-foreground transition-opacity duration-300",
                    !active && "opacity-50",
                  )}
                >
                  {t(`nodes.${node.id}.sub`)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <BalanceMeter scene={scene} maxAmount={maxAmount} />
    </div>
  );
}

function BalanceMeter({ scene, maxAmount }: { scene: StepScene; maxAmount: number }) {
  const t = useTranslations("stablecoin.diagram.meter");
  const reduce = useReducedMotion();

  const bars = [
    {
      key: "reserves",
      label: t("reserves"),
      value: scene.reserves,
      unit: "USD",
      color: "var(--fiat)",
    },
    {
      key: "supply",
      label: t("supply"),
      value: scene.supply,
      unit: "USDC",
      color: "var(--chain)",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="space-y-3">
        {bars.map((bar) => (
          <div key={bar.key} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="text-muted-foreground">{bar.label}</span>
              <span className="font-onchain font-medium">
                <RollingNumber value={bar.value} /> {bar.unit}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full origin-left rounded-full"
                style={{ backgroundColor: bar.color }}
                initial={false}
                animate={{ scaleX: maxAmount ? bar.value / maxAmount : 0 }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
                }
              />
            </div>
          </div>
        ))}
      </div>

      <p
        className={cn(
          "mt-3 text-xs font-medium",
          scene.balanced ? "text-success" : "text-warning",
        )}
      >
        {scene.balanced ? t("balanced") : t("unbalanced")}
      </p>
    </div>
  );
}
