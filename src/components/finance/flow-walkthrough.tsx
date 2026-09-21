"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Clock3, RotateCcw } from "lucide-react";

import { FlowGraph } from "@/components/diagram/flow-graph";
import type { FlowScene, FlowStep, MeterDef } from "@/components/finance/scenes";
import { Callout, type CalloutKind } from "@/components/learn/lesson-shell";
import { RollingNumber } from "@/components/stablecoin/rolling-number";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  short: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  /** Where the running example is in time, e.g. "Friday, 16:30". */
  clock: string;
  callout?: { kind: CalloutKind; title: string; body: string };
}

const TONE_TEXT: Record<MeterDef["tone"], string> = {
  fiat: "text-fiat",
  chain: "text-chain",
  warning: "text-warning",
  success: "text-success",
};

/**
 * Step-through diagram for the finance module: the flow on top, a strip of
 * running numbers and a clock under it, then a short explanation. Same rhythm
 * as the stablecoin walkthrough, generic over the scene.
 */
export function FlowWalkthrough({
  scene,
  namespace,
}: {
  scene: FlowScene;
  /** e.g. `finance.payments.wire`: `steps` and `diagram` hang off it. */
  namespace: string;
}) {
  const t = useTranslations(namespace);
  const tCommon = useTranslations("common");
  const steps = t.raw("steps") as Step[];

  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = steps.length;
  const step = steps[index];
  const sceneStep = scene.steps[index] ?? scene.steps[0];
  const atEnd = index === total - 1;

  const go = useCallback(
    (next: number) => setIndex(Math.min(Math.max(next, 0), total - 1)),
    [total],
  );

  // Arrow keys drive the walkthrough, but only while it has focus, otherwise
  // they would hijack scrolling for the whole page.
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
                // The label is hidden below `lg`, so the button needs its own name.
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
        <FlowGraph
          scene={scene}
          step={sceneStep}
          namespace={`${namespace}.diagram`}
          title={t("diagram.title")}
        />
      </div>

      <MeterStrip
        meters={scene.meters}
        step={sceneStep}
        clock={step.clock}
        namespace={`${namespace}.diagram.meters`}
      />

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

          <div
            className={cn(
              "mt-4 grid gap-6",
              step.callout && "lg:grid-cols-[1.15fr_1fr]",
            )}
          >
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
            </div>

            {step.callout ? (
              <Callout kind={step.callout.kind} title={step.callout.title} className="h-fit">
                {step.callout.body}
              </Callout>
            ) : null}
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

function MeterStrip({
  meters,
  step,
  clock,
  namespace,
}: {
  meters: MeterDef[];
  step: FlowStep;
  clock: string;
  namespace: string;
}) {
  const t = useTranslations(namespace);
  const tUi = useTranslations("finance.ui");

  return (
    <dl
      className={cn(
        "mt-4 grid gap-px overflow-hidden rounded-2xl border border-border bg-border",
        meters.length > 2 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3",
      )}
    >
      <div className="bg-card px-4 py-3">
        <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {tUi("clock")}
        </dt>
        {/* Keyed so the clock re-enters on every step: time passing is the point. */}
        <dd key={clock} className="mt-1 animate-rise text-sm font-semibold text-balance">
          {clock}
        </dd>
      </div>

      {meters.map((meter) => {
        const value = step.values[meter.id];
        const unit = t.has(`${meter.id}.unit`) ? t(`${meter.id}.unit`) : "";
        return (
          <div key={meter.id} className="bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">{t(`${meter.id}.label`)}</dt>
            <dd
              className={cn(
                "mt-1 font-onchain text-base font-semibold",
                value === undefined ? "text-muted-foreground" : meterColour(meter, value),
              )}
            >
              {value === undefined ? (
                <span className="text-sm font-normal">{tUi("none")}</span>
              ) : meter.format === "ratio" ? (
                value.toFixed(2)
              ) : (
                <>
                  <RollingNumber value={value} /> {unit}
                </>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function meterColour(meter: MeterDef, value: number) {
  if (meter.dangerBelow !== undefined && value < meter.dangerBelow) return "text-destructive";
  if (meter.warnBelow !== undefined && value < meter.warnBelow) return "text-warning";
  return TONE_TEXT[meter.tone];
}
