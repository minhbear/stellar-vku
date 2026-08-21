"use client";

import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";

import { CopyButton } from "@/components/stellar/copy-button";
import { cn } from "@/lib/utils";
import { stellarConfig } from "@/lib/stellar/config";
import { truncateAddress, truncateHash } from "@/lib/stellar/format";

type ValueKind = "account" | "contract" | "tx";

interface OnChainValueProps {
  value: string;
  kind: ValueKind;
  /** Confirmation screens must show the full value — never truncate there. */
  full?: boolean;
  label?: string;
  className?: string;
  showCopy?: boolean;
  showExplorer?: boolean;
}

function explorerHref(kind: ValueKind, value: string) {
  switch (kind) {
    case "account":
      return stellarConfig.explorer.account(value);
    case "contract":
      return stellarConfig.explorer.contract(value);
    case "tx":
      return stellarConfig.explorer.tx(value);
  }
}

/**
 * Renders an address, contract id or transaction hash the way the design system
 * requires: mono, copyable, linked to the explorer for the active network, with
 * the untruncated value always reachable through `title`.
 */
export function OnChainValue({
  value,
  kind,
  full = false,
  label,
  className,
  showCopy = true,
  showExplorer = true,
}: OnChainValueProps) {
  const t = useTranslations("explorerLink");
  const display = full
    ? value
    : kind === "tx"
      ? truncateHash(value)
      : truncateAddress(value);

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1", className)}>
      {label ? (
        <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      ) : null}
      <span
        title={value}
        className={cn(
          "font-onchain text-xs",
          full && "break-all leading-relaxed",
        )}
      >
        {display}
      </span>
      {showCopy ? <CopyButton value={value} /> : null}
      {showExplorer ? (
        <a
          href={explorerHref(kind, value)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t(kind)} — ${t("external")}`}
          className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      ) : null}
    </span>
  );
}
