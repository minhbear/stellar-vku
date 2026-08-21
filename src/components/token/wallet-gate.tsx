"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  ArrowRight,
  Download,
  Link2,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { OnChainValue } from "@/components/stellar/on-chain-value";
import { useWallet } from "@/components/stellar/wallet-provider";
import { Callout } from "@/components/learn/lesson-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { stellarConfig } from "@/lib/stellar/config";
import { formatAmount } from "@/lib/stellar/format";

/**
 * Every wallet state from the design system gets its own screen here: missing
 * extension, not connected, wrong network, unfunded account, thin reserve, ready.
 */
export function WalletGate({ onReady }: { onReady: () => void }) {
  const t = useTranslations("issue.wallet");
  const tCommon = useTranslations("common");
  const {
    status,
    address,
    network,
    networkMismatch,
    account,
    accountLoading,
    connecting,
    error,
    connect,
    disconnect,
    refreshAccount,
    fundAccount,
  } = useWallet();

  const [funding, setFunding] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);

  async function handleFund() {
    setFunding(true);
    setFundError(null);
    try {
      await fundAccount();
    } catch (caught) {
      setFundError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setFunding(false);
    }
  }

  if (status === "checking") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-48" />
        </CardContent>
      </Card>
    );
  }

  if (status === "notInstalled") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("notInstalledTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            {t("notInstalledBody")}
          </p>
          <Button asChild className="gap-2">
            <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer">
              <Download className="size-4" aria-hidden="true" />
              {t("notInstalledCta")}
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "disconnected" || !address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("disconnectedTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            {t("disconnectedBody")}
          </p>
          <Button onClick={connect} disabled={connecting} className="gap-2">
            <Wallet className="size-4" aria-hidden="true" />
            {connecting ? t("connecting") : t("connect")}
          </Button>
          {error ? (
            <Callout kind="warning" title={t("disconnectedTitle")}>
              {error}
            </Callout>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  // `account === null` means the summary has not arrived yet — showing "0 XLM"
  // there would look like an empty wallet rather than a pending read.
  const loadingAccount = accountLoading || account === null;
  const unfunded = account !== null && !account.exists;
  const lowBalance = account?.exists === true && Number(account.xlmBalance) < 1.6;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-lg">{t("connectedTitle")}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t("lede")}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={disconnect}>
          {t("disconnect")}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <dl className="grid gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">{t("address")}</dt>
            <dd className="mt-1">
              <OnChainValue value={address} kind="account" full />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("network")}</dt>
            <dd className="mt-1 font-onchain text-xs">{network ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("balance")}</dt>
            <dd className="mt-1 flex items-center gap-2 font-onchain text-xs">
              {loadingAccount ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <>
                  {formatAmount(account?.xlmBalance ?? "0", 4)} XLM
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={refreshAccount}
                    aria-label={t("refresh")}
                  >
                    <RefreshCw className="size-3" aria-hidden="true" />
                  </Button>
                </>
              )}
            </dd>
          </div>
          {account?.exists ? (
            <div className="sm:col-span-2">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link2 className="size-3" aria-hidden="true" />
                {t("trustlines")}
              </dt>
              <dd className="mt-1 font-onchain text-xs">
                {account.trustlines.length} · {t("reserve")}{" "}
                {(0.5 * account.subentryCount + 1).toFixed(1)} XLM
              </dd>
            </div>
          ) : null}
        </dl>

        {networkMismatch ? (
          <Callout kind="warning" title={t("wrongNetworkTitle")}>
            {t("wrongNetworkBody", { current: network ?? "?" })}
          </Callout>
        ) : null}

        {unfunded ? (
          <div className="space-y-3">
            <Callout kind="warning" title={t("unfundedTitle")}>
              {t("unfundedBody")}
            </Callout>
            <Button onClick={handleFund} disabled={funding} className="gap-2">
              <AlertTriangle className="size-4" aria-hidden="true" />
              {funding ? t("funding") : t("fund")}
            </Button>
          </div>
        ) : null}

        {!unfunded && lowBalance ? (
          <div className="space-y-3">
            <Callout kind="warning" title={t("lowBalanceTitle")}>
              {t("lowBalanceBody")}
            </Callout>
            <Button variant="outline" onClick={handleFund} disabled={funding} className="gap-2">
              {funding ? t("funding") : t("fund")}
            </Button>
          </div>
        ) : null}

        {fundError ? (
          <Callout kind="warning" title={tCommon("details")}>
            <span className="font-onchain text-xs break-all">{fundError}</span>
          </Callout>
        ) : null}

        <div className="flex items-center gap-3 pt-1">
          <Button
            onClick={onReady}
            disabled={networkMismatch || unfunded || loadingAccount}
            className="gap-2"
          >
            {t("readyCta")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <span className="font-onchain text-[11px] text-muted-foreground">
            {stellarConfig.network}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
