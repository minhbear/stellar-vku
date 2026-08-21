"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Boxes, Check, Coins, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { IssueMode } from "@/lib/schemas/token";

interface CompareRow {
  label: string;
  classic: string;
  sac: string;
}

const OPTIONS = [
  { mode: "classic" as const, icon: Coins, accent: "text-primary" },
  { mode: "sac" as const, icon: Boxes, accent: "text-chain" },
];

export function ModePicker({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: IssueMode | null;
  onChange: (mode: IssueMode) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("issue.mode");
  const tCommon = useTranslations("common");
  const rows = t.raw("compareRows") as CompareRow[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">{t("lede")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {OPTIONS.map(({ mode, icon: Icon, accent }) => {
          const selected = value === mode;
          return (
            <Card
              key={mode}
              className={cn(
                "h-full transition-all duration-200",
                selected
                  ? "border-primary ring-2 ring-primary/25"
                  : "hover:-translate-y-0.5 hover:shadow-md",
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <Icon className={cn("size-6", accent)} aria-hidden="true" />
                  {selected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                      <Check className="size-3" aria-hidden="true" />
                      {t("selected")}
                    </span>
                  ) : null}
                </div>
                <CardTitle className="mt-3 text-lg">{t(`${mode}.name`)}</CardTitle>
                <p className="text-xs font-medium text-muted-foreground">
                  {t(`${mode}.tagline`)}
                </p>
              </CardHeader>

              <CardContent className="flex h-full flex-col gap-4">
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  {t(`${mode}.body`)}
                </p>

                <ul className="space-y-2">
                  {(t.raw(`${mode}.pros`) as string[]).map((pro) => (
                    <li key={pro} className="flex gap-2 text-sm leading-relaxed">
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-success"
                        aria-hidden="true"
                      />
                      <span className="text-pretty text-muted-foreground">{pro}</span>
                    </li>
                  ))}
                  {(t.raw(`${mode}.cons`) as string[]).map((con) => (
                    <li key={con} className="flex gap-2 text-sm leading-relaxed">
                      <Minus
                        className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="text-pretty text-muted-foreground">{con}</span>
                    </li>
                  ))}
                </ul>

                <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  {t(`${mode}.bestFor`)}
                </p>

                <Button
                  type="button"
                  variant={selected ? "default" : "outline"}
                  onClick={() => onChange(mode)}
                  className="mt-auto w-full"
                >
                  {selected ? t("selected") : t("select")}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="border-b border-border bg-muted/60 px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
            {t("compare")}
          </caption>
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th scope="col" className="px-4 py-2.5 text-left font-medium" />
              <th scope="col" className="px-4 py-2.5 text-left font-medium">
                {t("classic.name")}
              </th>
              <th scope="col" className="px-4 py-2.5 text-left font-medium">
                {t("sac.name")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="px-4 py-2.5 text-left font-medium">
                  {row.label}
                </th>
                <td className="px-4 py-2.5 text-muted-foreground">{row.classic}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.sac}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          {tCommon("previous")}
        </Button>
        <Button type="button" onClick={onNext} disabled={!value} className="gap-2">
          {tCommon("continue")}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
