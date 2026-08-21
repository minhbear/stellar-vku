"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Wallet } from "lucide-react";

import { useWallet } from "@/components/stellar/wallet-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatAmount, truncateAddress } from "@/lib/stellar/format";

/**
 * Header-only status pill. It never offers "connect" — connecting belongs to the
 * lesson that needs it, so the header does not nag students who are just reading.
 */
export function WalletChip() {
  const t = useTranslations("issue.wallet");
  const { status, address, account, networkMismatch, network } = useWallet();

  if (status !== "connected" || !address) return null;

  if (networkMismatch) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="hidden items-center gap-1.5 rounded-full border border-warning/40 bg-warning/12 px-2.5 py-1 text-[11px] font-medium text-warning sm:inline-flex">
            <AlertTriangle className="size-3" aria-hidden="true" />
            {network}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-64 text-pretty">
          {t("wrongNetworkBody", { current: network ?? "?" })}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] sm:inline-flex">
          <Wallet className="size-3 text-muted-foreground" aria-hidden="true" />
          <span className="font-onchain">{truncateAddress(address)}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent className="space-y-1">
        <span className="block font-onchain text-[10px] break-all">{address}</span>
        {account ? (
          <span className="block text-[11px] opacity-80">
            {t("balance")}: {formatAmount(account.xlmBalance, 2)} XLM
          </span>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}
