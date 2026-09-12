"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import {
  Banknote,
  BookOpen,
  Coins,
  Copy,
  Database,
  FileCode2,
  Globe,
  Landmark,
  ListTree,
  Lock,
  Search,
  Send,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import {
  VIEWBOX,
  edgeLabelPoint,
  edgePath,
  type GraphIcon,
  type GraphStep,
  type Scene,
  type Tone,
} from "@/components/forensics/scene";
import { cn } from "@/lib/utils";

const ICONS: Record<GraphIcon, typeof Wallet> = {
  database: Database,
  ledger: BookOpen,
  explorer: Search,
  wallet: Wallet,
  trustline: Coins,
  history: ListTree,
  payments: Send,
  metadata: Globe,
  contract: FileCode2,
  asset: Coins,
  decoy: Copy,
  issuer: Landmark,
  treasury: Banknote,
  holders: Users,
  lock: Lock,
  rules: ShieldCheck,
  frozen: Lock,
};

const TONE_COLOR: Record<Tone, string> = {
  chain: "var(--chain)",
  fiat: "var(--fiat)",
  brand: "var(--brand)",
  warning: "var(--warning)",
  success: "var(--success)",
};

function percent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

/**
 * Draws one step of a case scene: the ledger objects involved and the arrows
 * between them. `values` carries the real testnet addresses and amounts so the
 * picture is of the students' own case, not a generic one.
 */
export function TraceGraph({
  scene,
  step,
  namespace,
  values = {},
  title,
}: {
  scene: Scene;
  step: GraphStep;
  namespace: string;
  values?: Record<string, string>;
  title: string;
}) {
  const t = useTranslations(namespace);
  const reduce = useReducedMotion();

  const activeSet = new Set(step.active);
  const highlightSet = new Set(step.highlight);
  const edgeById = Object.fromEntries(scene.edges.map((edge) => [edge.id, edge]));
  // Ids end up in `url(#…)` references, so keep them to a safe alphabet.
  const uid = namespace.replace(/[^a-zA-Z0-9]/g, "-");

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card p-3 sm:p-4">
      <div
        className="relative mx-auto aspect-[880/470] min-w-[680px]"
        role="img"
        aria-label={title}
      >
        <svg
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <defs>
            {scene.edges.map((edge) => (
              <path
                key={edge.id}
                id={`trace-${uid}-${edge.id}`}
                d={edgePath(scene, edge)}
                fill="none"
              />
            ))}
            <marker
              id={`trace-arrow-${uid}`}
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

          {scene.edges.map((edge) => {
            const active = activeSet.has(edge.id);
            return (
              <use
                key={edge.id}
                href={`#trace-${uid}-${edge.id}`}
                stroke={active ? TONE_COLOR[edge.tone] : "var(--border)"}
                strokeWidth={active ? 2.25 : 1.25}
                strokeLinecap="round"
                markerEnd={active ? `url(#trace-arrow-${uid})` : undefined}
                opacity={active ? 1 : 0.4}
                className="transition-all duration-300"
              />
            );
          })}

          {step.active.map((edgeId) => {
            const edge = edgeById[edgeId];
            if (!edge) return null;
            if (reduce) {
              const point = edgeLabelPoint(scene, edge, 0.5);
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
                  <mpath href={`#trace-${uid}-${edgeId}`} />
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

          {step.active.map((edgeId) => {
            const edge = edgeById[edgeId];
            if (!edge) return null;
            const point = edgeLabelPoint(scene, edge, edge.labelAt ?? 0.5);
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
                {t(`edges.${edge.id}`)}
              </text>
            );
          })}
        </svg>

        {scene.nodes.map((node) => {
          const Icon = ICONS[node.icon];
          const active = highlightSet.has(node.id);
          const color = TONE_COLOR[node.tone];
          const value = values[node.id];

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
                animate={reduce ? undefined : { scale: active ? 1.06 : 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className={cn(
                  "mx-auto flex size-14 items-center justify-center rounded-2xl border-2 bg-card transition-colors duration-300",
                  active ? "shadow-md" : "opacity-55",
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
                  value && "font-onchain",
                  !active && "opacity-50",
                )}
              >
                {value ?? t(`nodes.${node.id}.sub`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
