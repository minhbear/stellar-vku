"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  Eye,
  EyeOff,
  Lock,
  PartyPopper,
  Plus,
  RotateCcw,
  ShieldAlert,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";

import { Callout } from "@/components/learn/lesson-shell";
import { CopyButton } from "@/components/stellar/copy-button";
import { OnChainValue } from "@/components/stellar/on-chain-value";
import { useWallet } from "@/components/stellar/wallet-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stellarConfig } from "@/lib/stellar/config";
import { formatAmount } from "@/lib/stellar/format";
import { stepMessageKey, type IssuanceResult } from "@/lib/stellar/plan";

export function ResultPanel({
  result,
  onRestart,
}: {
  result: IssuanceResult;
  onRestart: () => void;
}) {
  const t = useTranslations("issue.result");
  const tRun = useTranslations("issue.run.steps");
  const { refreshAccount } = useWallet();

  const [secretVisible, setSecretVisible] = useState(false);
  const [added, setAdded] = useState(false);

  // The wallet now holds a new trustline and balance — pull them in so the
  // header chip and the wallet step stop showing stale numbers.
  useEffect(() => {
    void refreshAccount();
  }, [refreshAccount]);

  async function addToWallet() {
    if (!result.contractId) return;
    try {
      const { addToken } = await import("@stellar/freighter-api");
      const response = await addToken({
        contractId: result.contractId,
        networkPassphrase: stellarConfig.networkPassphrase,
      });
      if (response.error) throw new Error(response.error.message);
      setAdded(true);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : String(caught));
    }
  }

  const hashes = Object.entries(result.hashes) as Array<[string, string]>;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <span className="animate-rise mt-1 flex size-11 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <PartyPopper className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
          <p className="mt-2 max-w-[62ch] text-sm text-muted-foreground">{t("lede")}</p>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
          <div className="sm:col-span-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-onchain text-2xl font-semibold">{result.code}</span>
            <span className="text-sm text-muted-foreground">{result.name}</span>
            <span
              className={
                result.locked
                  ? "inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success"
                  : "inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              }
            >
              {result.locked ? (
                <Lock className="size-3" aria-hidden="true" />
              ) : (
                <Unlock className="size-3" aria-hidden="true" />
              )}
              {result.locked ? t("lockedYes") : t("lockedNo")}
            </span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">{t("supplyLabel")}</p>
            <p className="mt-1 font-onchain text-sm">
              {formatAmount(result.supply, 7)} {result.code}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">{t("holderLabel")}</p>
            <p className="mt-1">
              <OnChainValue value={result.recipient} kind="account" />
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">{t("issuerLabel")}</p>
            <p className="mt-1">
              <OnChainValue value={result.issuerPublicKey} kind="account" full />
            </p>
          </div>

          {result.contractId ? (
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">{t("contractLabel")}</p>
              <p className="mt-1">
                <OnChainValue value={result.contractId} kind="contract" full />
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" className="gap-2">
          <a
            href={stellarConfig.explorer.asset(result.code, result.issuerPublicKey)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("viewAsset")}
          </a>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <a
            href={stellarConfig.explorer.account(result.issuerPublicKey)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("viewIssuer")}
          </a>
        </Button>
        {result.contractId ? (
          <Button variant="outline" onClick={addToWallet} disabled={added} className="gap-2">
            {added ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
            {added ? t("addedToWallet") : t("addToWallet")}
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("transactions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {hashes.map(([stepId, hash]) => (
            <div
              key={stepId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
            >
              <span className="text-sm">
                {tRun(
                  `${stepMessageKey(stepId as never, result.mode)}.label`,
                )}
              </span>
              <OnChainValue value={hash} kind="tx" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="size-4 text-destructive" aria-hidden="true" />
            {t("secretTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
            {t("secretBody")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSecretVisible((current) => !current)}
              className="gap-2"
            >
              {secretVisible ? (
                <EyeOff className="size-3.5" aria-hidden="true" />
              ) : (
                <Eye className="size-3.5" aria-hidden="true" />
              )}
              {secretVisible ? t("secretHide") : t("secretReveal")}
            </Button>
            {secretVisible ? <CopyButton value={result.issuerSecret} /> : null}
          </div>
          {secretVisible ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 font-onchain text-xs break-all">
              {result.issuerSecret}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Callout kind="success" title={t("learnedTitle")}>
          <ul className="mt-1 space-y-2">
            {(t.raw("learned") as string[]).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-current" aria-hidden="true" />
                <span className="text-pretty">{item}</span>
              </li>
            ))}
          </ul>
        </Callout>

        <Callout kind="info" title={t("tryTitle")}>
          <ul className="mt-1 space-y-2">
            {(t.raw("try") as string[]).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-current" aria-hidden="true" />
                <span className="text-pretty">{item}</span>
              </li>
            ))}
          </ul>
        </Callout>
      </div>

      <Button variant="outline" onClick={onRestart} className="gap-2">
        <RotateCcw className="size-4" aria-hidden="true" />
        {t("again")}
      </Button>
    </div>
  );
}
