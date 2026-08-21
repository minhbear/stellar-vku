"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react";

import { IssuanceDiagram } from "@/components/stablecoin/issuance-diagram";
import { EXAMPLE_AMOUNT, STEP_SCENES } from "@/components/stablecoin/scene";
import { Callout, type CalloutKind } from "@/components/learn/lesson-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  eyebrow: string;
  /** Rail label — the full title is far too long for a ninth of the width. */
  short: string;
  title: string;
  body: string;
  points: string[];
  callout: { kind: CalloutKind; title: string; body: string };
}

const AUTOPLAY_MS = 9000;

export function StablecoinWalkthrough() {
  const t = useTranslations("stablecoin");
  const steps = t.raw("steps") as Step[];

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = steps.length;
  const step = steps[index];
  const scene = STEP_SCENES[index] ?? STEP_SCENES[0];
  const atEnd = index === total - 1;

  const go = useCallback(
    (next: number) => {
      setIndex(Math.min(Math.max(next, 0), total - 1));
    },
    [total],
  );

  // Arrow keys drive the walkthrough, but only while it has focus — otherwise
  // they would hijack scrolling for the whole page.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPlaying(false);
        go(index + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPlaying(false);
        go(index - 1);
      }
    };

    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, [go, index]);

  useEffect(() => {
    // Nothing is scheduled on the last step, so autoplay simply stops there —
    // no state update from inside the effect is needed.
    if (!playing || atEnd) return;
    const timer = setTimeout(() => {
      go(index + 1);
      if (index + 1 === total - 1) setPlaying(false);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [playing, index, atEnd, total, go]);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="rounded-2xl border border-border bg-muted/25 p-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-5"
    >
      <StepRail steps={steps} index={index} onSelect={(next) => { setPlaying(false); go(next); }} />

      <div className="mt-4">
        <IssuanceDiagram scene={scene} maxAmount={EXAMPLE_AMOUNT} />
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
            </div>

            <Callout kind={step.callout.kind} title={step.callout.title} className="h-fit">
              {step.callout.body}
            </Callout>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <NavButtons
          index={index}
          total={total}
          playing={playing}
          onPrev={() => {
            setPlaying(false);
            go(index - 1);
          }}
          onNext={() => {
            setPlaying(false);
            go(index + 1);
          }}
          onTogglePlay={() => setPlaying((current) => !current)}
          onRestart={() => {
            setPlaying(false);
            go(0);
          }}
        />
      </div>
    </div>
  );
}

function StepRail({
  steps,
  index,
  onSelect,
}: {
  steps: Step[];
  index: number;
  onSelect: (next: number) => void;
}) {
  return (
    <ol className="flex gap-1.5 overflow-x-auto pb-1">
      {steps.map((step, stepIndex) => {
        const done = stepIndex < index;
        const active = stepIndex === index;
        return (
          <li key={step.id} className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onSelect(stepIndex)}
              aria-current={active ? "step" : undefined}
              // The label is hidden below `lg`, so the button needs its own name.
              aria-label={`${stepIndex + 1}. ${step.short}`}
              title={step.short}
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
                {step.short}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function NavButtons({
  index,
  total,
  playing,
  onPrev,
  onNext,
  onTogglePlay,
  onRestart,
}: {
  index: number;
  total: number;
  playing: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onRestart: () => void;
}) {
  const t = useTranslations("common");
  const tStablecoin = useTranslations("stablecoin");
  const atEnd = index === total - 1;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onPrev}
        disabled={index === 0}
        className="gap-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("previous")}
      </Button>

      <span className="font-onchain text-xs text-muted-foreground">
        {t("stepOf", { current: index + 1, total })}
      </span>

      {atEnd ? (
        <Button type="button" variant="outline" onClick={onRestart} className="gap-2">
          <RotateCcw className="size-4" aria-hidden="true" />
          {t("restart")}
        </Button>
      ) : (
        <Button type="button" onClick={onNext} className="gap-2">
          {t("next")}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onTogglePlay}
        disabled={atEnd}
        className="ml-auto gap-1.5 text-muted-foreground"
      >
        {playing ? (
          <Pause className="size-3.5" aria-hidden="true" />
        ) : (
          <Play className="size-3.5" aria-hidden="true" />
        )}
        {playing ? tStablecoin("pause") : tStablecoin("autoplay")}
      </Button>

      <p className="w-full text-xs text-muted-foreground">{tStablecoin("hint")}</p>
    </>
  );
}
