"use client";

import { useTranslations } from "next-intl";
import { FlaskConical } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { isTestnet, stellarConfig } from "@/lib/stellar/config";

/**
 * Always visible on testnet. Mixing up networks is how people lose real money,
 * so the badge is not something a page gets to opt out of.
 */
export function NetworkBadge({ className }: { className?: string }) {
  const t = useTranslations("network");

  if (!isTestnet) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium",
          className,
        )}
      >
        {t("mainnet")}
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex cursor-help items-center gap-1 rounded-full border border-warning/40 bg-warning/12 px-2 py-0.5 text-[11px] font-medium text-warning",
            className,
          )}
        >
          <FlaskConical className="size-3" aria-hidden="true" />
          {t("testnet")}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-pretty">
        {t("testnetTooltip")}
        <span className="mt-1 block font-onchain text-[10px] opacity-70">
          {stellarConfig.networkPassphrase}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
