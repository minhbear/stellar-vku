"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, ExternalLink, RotateCcw } from "lucide-react";

import { TraceGraph } from "@/components/forensics/trace-graph";
import type { Scene } from "@/components/forensics/scene";
import { Callout, type CalloutKind } from "@/components/learn/lesson-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  short: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  callout: { kind: CalloutKind; title: string; body: string };
}

/**
 * The "how it actually worked" replay students get after the hunt: one step per
 * idea, the mission graph on top, and the explorer page that proves each claim.
 */
export function Debrief({
  scene,
  namespace,
  values,
  links = {},
}: {
  scene: Scene;
  /** e.g. `forensics.case1` — steps and diagram labels hang off it. */
  namespace: string;
  values?: Record<string, string>;
  /** Step id → the explorer page that step is about. */
  links?: Record<string, string>;
}) {
  const t = useTranslations(`${namespace}.debrief`);
  const tCommon = useTranslations("common");
  const tUi = useTranslations("forensics.ui");
  const steps = t.raw("steps") as Step[];

  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = steps.length;
  const step = steps[index];
  const sceneStep = scene.steps[index] ?? scene.steps[0];
  const atEnd = index === total - 1;
  const link = links[step.id];

  const go = useCallback(
    (next: number) => setIndex(Math.min(Math.max(next, 0), total - 1)),
    [total],
  );

  // Arrow keys drive the replay, but only while it has focus — otherwise they
  // would hijack scrolling for the whole page.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(index + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(index - 1);
      }
    };

    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, [go, index]);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="rounded-2xl border border-border bg-muted/25 p-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-5"
    >
      <ol className="flex gap-1.5 overflow-x-auto pb-1">
        {steps.map((entry, stepIndex) => {
          const done = stepIndex < index;
          const active = stepIndex === index;
          return (
            <li key={entry.id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => go(stepIndex)}
                aria-current={active ? "step" : undefined}
                aria-label={`${stepIndex + 1}. ${entry.short}`}
                title={entry.short}
                className="group block w-full text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "block h-1 rounded-full transition-colors duration-300",
                    active ? "bg-primary" : done ? "bg-primary/40" : "bg-border",
                  )}
                />
                <span
                  className={cn(
                    "mt-1.5 hidden truncate text-[10px] transition-colors lg:block",
                    active ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {entry.short}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-4">
        <TraceGraph
          scene={scene}
          step={sceneStep}
          namespace={`${namespace}.diagram`}
          values={values}
          title={t("diagramTitle")}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        {/* CSS entrance keyed on the step: a JS cross-fade would stall halfway
            if the tab is in the background and hide the whole explanation. */}
        <div key={step.id} className="animate-rise">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            {step.eyebrow}
          </p>
          <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
            {step.title}
          </h3>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
            <div className="space-y-4">
              <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground text-pretty">
                {step.body}
              </p>
              <ul className="space-y-2.5">
                {step.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm leading-relaxed">
                    <span
                      className="mt-2 size-1 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <span className="text-pretty text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>

              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {tUi("openPage")}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              ) : null}
            </div>

            <Callout kind={step.callout.kind} title={step.callout.title} className="h-fit">
              {step.callout.body}
            </Callout>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="gap-2"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {tCommon("previous")}
        </Button>

        <span className="font-onchain text-xs text-muted-foreground">
          {tCommon("stepOf", { current: index + 1, total })}
        </span>

        {atEnd ? (
          <Button type="button" variant="outline" onClick={() => go(0)} className="gap-2">
            <RotateCcw className="size-4" aria-hidden="true" />
            {tCommon("restart")}
          </Button>
        ) : (
          <Button type="button" onClick={() => go(index + 1)} className="gap-2">
            {tCommon("next")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
