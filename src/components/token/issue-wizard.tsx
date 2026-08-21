"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

import { ModePicker } from "@/components/token/mode-picker";
import { ResultPanel } from "@/components/token/result-panel";
import { ReviewPanel } from "@/components/token/review-panel";
import { RunPanel } from "@/components/token/run-panel";
import { TokenForm } from "@/components/token/token-form";
import { WalletGate } from "@/components/token/wallet-gate";
import { useWallet } from "@/components/stellar/wallet-provider";
import { cn } from "@/lib/utils";
import type { IssueMode, TokenFormParsed } from "@/lib/schemas/token";
import type { IssuanceParams, IssuanceResult } from "@/lib/stellar/plan";

const STAGES = ["connect", "type", "details", "review", "execute", "done"] as const;
type Stage = (typeof STAGES)[number];

export function IssueWizard() {
  const t = useTranslations("issue.steps");
  const { address } = useWallet();

  const [stage, setStage] = useState<Stage>("connect");
  const [mode, setMode] = useState<IssueMode | null>(null);
  const [values, setValues] = useState<TokenFormParsed | null>(null);
  const [result, setResult] = useState<IssuanceResult | null>(null);

  const params = useMemo<IssuanceParams | null>(() => {
    if (!values || !address) return null;
    return {
      mode: values.mode,
      code: values.code,
      name: values.name,
      description: values.description,
      supply: values.supply,
      homeDomain: values.homeDomain || undefined,
      authRequired: values.authRequired,
      authRevocable: values.authRevocable,
      clawbackEnabled: values.clawbackEnabled,
      lockIssuer: values.lockIssuer,
      recipient: address,
      trustLimit: values.supply,
    };
  }, [values, address]);

  function restart() {
    setResult(null);
    setValues(null);
    setStage("type");
  }

  const currentIndex = STAGES.indexOf(stage);

  return (
    <div className="space-y-8">
      <ol className="flex flex-wrap gap-x-2 gap-y-2">
        {STAGES.map((item, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={item} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border font-onchain text-[11px] transition-colors",
                  done && "border-success bg-success text-success-foreground",
                  active && "border-primary bg-primary text-primary-foreground",
                  !done && !active && "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3" aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-xs",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {t(item)}
              </span>
              {index < STAGES.length - 1 ? (
                <span className="mx-1 h-px w-4 bg-border sm:w-6" aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* Keyed on the stage so React remounts and the CSS entrance replays. A
          JS transition here would stall mid-fade in a background tab and leave
          the student staring at an empty panel. */}
      <div key={stage} className="animate-rise">
        {stage === "connect" ? <WalletGate onReady={() => setStage("type")} /> : null}

        {stage === "type" ? (
          <ModePicker
            value={mode}
            onChange={setMode}
            onBack={() => setStage("connect")}
            onNext={() => setStage("details")}
          />
        ) : null}

        {stage === "details" && mode ? (
          <TokenForm
            mode={mode}
            initialValues={values}
            onBack={() => setStage("type")}
            onSubmit={(next) => {
              setValues(next);
              setStage("review");
            }}
          />
        ) : null}

        {stage === "review" && params ? (
          <ReviewPanel
            params={params}
            onBack={() => setStage("details")}
            onConfirm={() => setStage("execute")}
          />
        ) : null}

        {stage === "execute" && params ? (
          <RunPanel
            params={params}
            onDone={(next) => {
              setResult(next);
              setStage("done");
            }}
            onRestart={restart}
          />
        ) : null}

        {stage === "done" && result ? (
          <ResultPanel result={result} onRestart={restart} />
        ) : null}
      </div>
    </div>
  );
}
