"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Link2, ShieldCheck } from "lucide-react";

/**
 * Decorative preview of the asset page a student ends up with. Deliberately a
 * mock — the real values are shown by the issuance wizard.
 */
export function AssetPreviewCard() {
  const t = useTranslations("issue.result");
  const reduce = useReducedMotion();

  const rows = [
    { label: t("issuerLabel"), value: "GDEMO…VKU7", mono: true },
    { label: t("supplyLabel"), value: "1,000,000.0000000", mono: true },
    { label: t("holderLabel"), value: "GABC…X7QK", mono: true },
  ];

  return (
    <motion.div
      animate={reduce ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-full max-w-sm"
    >
      <div
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/12 blur-3xl"
        aria-hidden="true"
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="flex items-center gap-3 border-b border-border bg-gradient-to-br from-primary/12 to-brand/10 px-5 py-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary font-onchain text-sm font-semibold text-primary-foreground">
            VKU
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">VKU Fintech Coin</span>
            <span className="block font-onchain text-[11px] text-muted-foreground">
              VKUCOIN
            </span>
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/12 px-2 py-0.5 text-[10px] font-medium text-success">
            <ShieldCheck className="size-3" aria-hidden="true" />
            Testnet
          </span>
        </div>

        <dl className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-xs text-muted-foreground">{row.label}</dt>
              <dd className="font-onchain text-xs">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-5 py-3 text-[11px] text-muted-foreground">
          <Link2 className="size-3.5" aria-hidden="true" />
          Trustline · 0.5 XLM reserve
        </div>
      </div>
    </motion.div>
  );
}
