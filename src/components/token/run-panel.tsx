"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Check, KeyRound, Loader2, PenLine, RotateCcw } from "lucide-react";

import { Callout } from "@/components/learn/lesson-shell";
import { OnChainValue } from "@/components/stellar/on-chain-value";
import { useWallet } from "@/components/stellar/wallet-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IssuanceRunner } from "@/lib/stellar/issue";
import {
  STEP_SIGNERS,
  planIssuance,
  stepMessageKey,
  type IssuanceParams,
  type IssuanceResult,
  type IssuanceStep,
} from "@/lib/stellar/plan";
import { cn } from "@/lib/utils";

export function RunPanel({
  params,
  onDone,
  onRestart,
}: {
  params: IssuanceParams;
  onDone: (result: IssuanceResult) => void;
  onRestart: () => void;
}) {
  const t = useTranslations("issue.run");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const { sign } = useWallet();

  const [steps, setSteps] = useState<IssuanceStep[]>(() =>
    planIssuance(params).map((id) => ({
      id,
      status: "pending" as const,
      signer: STEP_SIGNERS[id],
    })),
  );
  const [running, setRunning] = useState(false);
  const [failure, setFailure] = useState<{ code: string; detail?: string } | null>(null);

  const runnerRef = useRef<IssuanceRunner | null>(null);
  const startedRef = useRef(false);

  const start = useCallback(async () => {
    setRunning(true);
    setFailure(null);
    try {
      if (!runnerRef.current) {
        // The SDK is a large dependency; it is only fetched once a student
        // actually commits to issuing.
        const { IssuanceRunner: Runner } = await import("@/lib/stellar/issue");
        runnerRef.current = new Runner(params, {
          signWithWallet: sign,
          onProgress: (next) => setSteps([...next]),
        });
      }
      const result = await runnerRef.current.run();
      onDone(result);
    } catch (caught) {
      const mapped = caught as { code?: string; detail?: string; message?: string };
      setFailure({
        code: mapped.code ?? "unknown",
        detail: mapped.detail ?? mapped.message,
      });
    } finally {
      setRunning(false);
    }
  }, [params, sign, onDone]);

  // Start once. React 18+ mounts effects twice in dev, so the guard matters.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void start();
  }, [start]);

  const waitingForSignature = steps.some((step) => step.status === "awaitingSignature");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">{t("lede")}</p>
      </div>

      {waitingForSignature ? (
        <div className="animate-rise">
          <Callout kind="info" title={t("signHint")}>
            <span className="flex items-center gap-2">
              <PenLine className="size-3.5 shrink-0" aria-hidden="true" />
              {t("steps.createTrustline.body")}
            </span>
          </Callout>
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{params.code}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ol className="divide-y divide-border">
            {steps.map((step, index) => {
              const key = stepMessageKey(step.id, params.mode);
              return (
                <li key={step.id} className="flex items-start gap-3 px-6 py-4">
                  <StatusIcon status={step.status} index={index} />

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        step.status === "pending" && "text-muted-foreground",
                      )}
                    >
                      {t(`steps.${key}.label`)}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground text-pretty">
                      {t(`steps.${key}.body`)}
                    </p>

                    {step.hash ? (
                      <p className="mt-2">
                        <OnChainValue value={step.hash} kind="tx" />
                      </p>
                    ) : null}

                    {step.status === "failed" && step.errorCode ? (
                      <p className="mt-2 text-xs text-destructive">
                        {tErrors(step.errorCode)}
                      </p>
                    ) : null}
                  </div>

                  <span
                    className={cn(
                      "shrink-0 text-[11px] whitespace-nowrap",
                      step.status === "done" && "text-success",
                      step.status === "failed" && "text-destructive",
                      step.status === "awaitingSignature" && "text-primary",
                      (step.status === "pending" || step.status === "running") &&
                        "text-muted-foreground",
                    )}
                  >
                    {t(`status.${step.status}`)}
                  </span>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {failure ? (
        <div className="space-y-3">
          <Callout kind="warning" title={t("failedTitle")}>
            <span className="block">{tErrors(failure.code)}</span>
            <span className="mt-1 block">{t("failedBody")}</span>
            {failure.detail ? (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium">
                  {tCommon("details")}
                </summary>
                <span className="mt-1 block font-onchain text-[11px] break-all opacity-80">
                  {failure.detail}
                </span>
              </details>
            ) : null}
          </Callout>

          <div className="flex flex-wrap gap-3">
            <Button onClick={start} disabled={running} className="gap-2">
              <RotateCcw className="size-4" aria-hidden="true" />
              {t("resume")}
            </Button>
            <Button variant="outline" onClick={onRestart} disabled={running}>
              {t("startOver")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusIcon({ status, index }: { status: IssuanceStep["status"]; index: number }) {
  const reduce = useReducedMotion();

  const base =
    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-onchain";

  if (status === "done") {
    return (
      <motion.span
        initial={reduce ? false : { scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className={cn(base, "border-success bg-success text-success-foreground")}
      >
        <Check className="size-3.5" aria-hidden="true" />
      </motion.span>
    );
  }

  if (status === "failed") {
    return (
      <span className={cn(base, "border-destructive bg-destructive/10 text-destructive")}>
        <AlertCircle className="size-3.5" aria-hidden="true" />
      </span>
    );
  }

  if (status === "awaitingSignature") {
    return (
      <span className={cn(base, "border-primary bg-primary/10 text-primary")}>
        <KeyRound className="size-3.5 animate-pulse" aria-hidden="true" />
      </span>
    );
  }

  if (status === "running") {
    return (
      <span className={cn(base, "border-primary/50 bg-primary/5 text-primary")}>
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className={cn(base, "border-border bg-card text-muted-foreground")}>{index + 1}</span>
  );
}
