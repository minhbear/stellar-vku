"use client";

import { useTranslations } from "next-intl";
import { KeyRound, PenLine, Rocket, Zap } from "lucide-react";

import { Callout } from "@/components/learn/lesson-shell";
import { OnChainValue } from "@/components/stellar/on-chain-value";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stellarConfig } from "@/lib/stellar/config";
import { formatAmount } from "@/lib/stellar/format";
import { STEP_SIGNERS, planIssuance, stepMessageKey } from "@/lib/stellar/plan";
import type { IssuanceParams } from "@/lib/stellar/plan";
import { cn } from "@/lib/utils";

const SIGNER_ICON = {
  wallet: PenLine,
  issuer: KeyRound,
  none: Zap,
} as const;

export function ReviewPanel({
  params,
  onBack,
  onConfirm,
}: {
  params: IssuanceParams;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("issue.review");
  const tRun = useTranslations("issue.run.steps");
  const tMode = useTranslations("issue.mode");
  const tForm = useTranslations("issue.form.fields");
  const tCommon = useTranslations("common");

  const steps = planIssuance(params);

  const activeFlags = (
    [
      ["authRequired", params.authRequired],
      ["authRevocable", params.authRevocable],
      ["clawbackEnabled", params.clawbackEnabled],
      ["lockIssuer", params.lockIssuer],
    ] as const
  )
    .filter(([, on]) => on)
    .map(([flag]) => tForm(`${flag}.label`));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">{t("lede")}</p>
      </div>

      <Card>
        <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">{t("asset")}</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="font-onchain text-lg font-semibold">{params.code}</span>
              <span className="text-sm text-muted-foreground">{params.name}</span>
            </p>
            <p className="mt-1 font-onchain text-sm">
              {formatAmount(params.supply, 7)} {params.code}
            </p>
          </div>

          <div className="sm:col-span-2">
            {/* Full address, never truncated — this is the confirmation screen. */}
            <p className="text-xs text-muted-foreground">{t("recipient")}</p>
            <p className="mt-1">
              <OnChainValue value={params.recipient} kind="account" full />
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">{t("mode")}</p>
            <p className="mt-1 text-sm font-medium">{tMode(`${params.mode}.name`)}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">{t("network")}</p>
            <p className="mt-1 font-onchain text-sm">{stellarConfig.networkPassphrase}</p>
          </div>

          {params.homeDomain ? (
            <div>
              <p className="text-xs text-muted-foreground">{tForm("homeDomain.label")}</p>
              <p className="mt-1 font-onchain text-sm">{params.homeDomain}</p>
            </div>
          ) : null}

          <div className={cn(params.homeDomain ? "" : "sm:col-span-2")}>
            <p className="text-xs text-muted-foreground">{t("flags")}</p>
            <p className="mt-1 text-sm">
              {activeFlags.length ? (
                <span className="flex flex-wrap gap-1.5">
                  {activeFlags.map((flag) => (
                    <span
                      key={flag}
                      className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning"
                    >
                      {flag}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-muted-foreground">{t("noFlags")}</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("plan")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("planLede", { count: steps.length })}
          </p>
        </CardHeader>
        <CardContent>
          <ol className="space-y-1">
            {steps.map((stepId, index) => {
              const signer = STEP_SIGNERS[stepId];
              const Icon = SIGNER_ICON[signer];
              const key = stepMessageKey(stepId, params.mode);

              return (
                <li
                  key={stepId}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-card font-onchain text-[11px] text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{tRun(`${key}.label`)}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground text-pretty">
                      {tRun(`${key}.body`)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
                      signer === "wallet"
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    <Icon className="size-3" aria-hidden="true" />
                    {signer === "wallet"
                      ? t("signedByYou")
                      : signer === "issuer"
                        ? t("signedByIssuer")
                        : t("automatic")}
                  </span>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      <Callout kind="info" title={t("issuerNote.title")}>
        {t("issuerNote.body")}
      </Callout>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          {t("edit")}
        </Button>
        <Button type="button" onClick={onConfirm} className="gap-2">
          <Rocket className="size-4" aria-hidden="true" />
          {t("confirm")}
        </Button>
        <span className="text-xs text-muted-foreground">{tCommon("stepOf", { current: 4, total: 5 })}</span>
      </div>
    </div>
  );
}
