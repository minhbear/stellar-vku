"use client";

import { useTranslations } from "next-intl";
import { ExternalLink, FileSearch } from "lucide-react";

import { CopyButton } from "@/components/stellar/copy-button";
import { Button } from "@/components/ui/button";
import { stellarConfig } from "@/lib/stellar/config";

/**
 * The single piece of evidence a case starts from. Deliberately the only place
 * on the page where the value is shown in full — everything else has to be
 * found in the explorer.
 */
export function EvidenceCard({
  kind,
  value,
  namespace,
}: {
  kind: "account" | "contract";
  value: string;
  namespace: string;
}) {
  const t = useTranslations(namespace);
  const tUi = useTranslations("forensics.ui");

  const explorer =
    kind === "account"
      ? stellarConfig.explorer.account(value)
      : stellarConfig.explorer.contract(value);

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-primary uppercase">
        <FileSearch className="size-3.5" aria-hidden="true" />
        {t("evidenceLabel")}
      </p>

      <div className="mt-3 flex items-start gap-1 rounded-xl border border-border bg-card p-3">
        <code className="min-w-0 flex-1 font-onchain text-xs leading-relaxed break-all">
          {value}
        </code>
        <CopyButton value={value} />
      </div>

      <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-muted-foreground text-pretty">
        {t("evidenceHint")}
      </p>

      <div className="mt-4">
        <Button asChild size="sm" className="gap-2">
          <a href={explorer} target="_blank" rel="noopener noreferrer">
            {tUi("openExplorer")}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </Button>
      </div>
    </div>
  );
}
