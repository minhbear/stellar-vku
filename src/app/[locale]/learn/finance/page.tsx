import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarClock,
  Coins,
  EyeOff,
  Layers3,
  Store,
  TimerReset,
} from "lucide-react";

import { CompareTable, SourceList, type CompareRow, type SourceItem } from "@/components/finance/blocks";
import { FlowWalkthrough } from "@/components/finance/flow-walkthrough";
import { MONEYGRAM_SCENE, WIRE_SCENE } from "@/components/finance/scenes";
import { LessonFooter } from "@/components/learn/lesson-footer";
import { Callout, LessonHeader, LessonSection } from "@/components/learn/lesson-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface Item {
  title: string;
  body: string;
}

interface Stage {
  title: string;
  body: string;
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/finance">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "finance.payments" });
  return { title: t("title"), description: t("lede") };
}

export default async function PaymentsPage({ params }: PageProps<"/[locale]/learn/finance">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PaymentsContent />;
}

const PAIN_ICONS = [TimerReset, Coins, EyeOff, CalendarClock];
const FIX_ICONS = [Layers3, Coins, Store];

function PaymentsContent() {
  const t = useTranslations("finance.payments");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.finance");

  const pains = t.raw("pains.items") as Item[];
  const fixes = t.raw("fix.items") as Item[];

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 3 · ${tModule("title")}`}
        title={t("title")}
        lede={t("lede")}
      >
        <Callout kind="info" title={t("example.title")} className="mt-6 max-w-[65ch]">
          {t("example.body")}
        </Callout>
      </LessonHeader>

      <LessonSection title={t("wire.title")} lede={t("wire.lede")}>
        <FlowWalkthrough scene={WIRE_SCENE} namespace="finance.payments.wire" />
      </LessonSection>

      <LessonSection title={t("pains.title")} lede={t("pains.lede")}>
        <IconGrid items={pains} icons={PAIN_ICONS} accent="text-warning" columns="lg:grid-cols-4" />
      </LessonSection>

      <LessonSection title={t("fix.title")} lede={t("fix.lede")}>
        <IconGrid items={fixes} icons={FIX_ICONS} accent="text-chain" columns="lg:grid-cols-3" />
      </LessonSection>

      <LessonSection title={t("moneygram.title")} lede={t("moneygram.lede")}>
        <FlowWalkthrough scene={MONEYGRAM_SCENE} namespace="finance.payments.moneygram" />
      </LessonSection>

      <LessonSection title={t("compare.title")} lede={t("compare.lede")}>
        <CompareTable
          columns={[t("compare.columns.criterion"), t("compare.columns.bank"), t("compare.columns.stellar")]}
          rows={t.raw("compare.rows") as CompareRow[]}
        />
      </LessonSection>

      <Lifecycle />

      <Card className="mt-14 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">{t("next.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[55ch] text-sm text-muted-foreground">{t("next.body")}</p>
          <Button asChild className="shrink-0 gap-2">
            <Link href="/learn/finance/lending">
              {t("next.cta")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <LessonSection title={t("sources.title")} lede={t("sources.lede")}>
        <SourceList items={t.raw("sources.items") as SourceItem[]} />
      </LessonSection>

      <LessonFooter />
    </article>
  );
}

function IconGrid({
  items,
  icons,
  accent,
  columns,
}: {
  items: Item[];
  icons: (typeof Coins)[];
  accent: string;
  columns: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", columns)}>
      {items.map((item, index) => {
        const Icon = icons[index % icons.length];
        return (
          <div key={item.title} className="rounded-xl border border-border bg-card p-5">
            <Icon className={cn("size-5", accent)} aria-hidden="true" />
            <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
              {item.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Two lanes, same six stages: where a payment is at each point of its life. */
function Lifecycle() {
  const t = useTranslations("finance.payments.lifecycle");

  const lanes = [
    { key: "bank" as const, Icon: Building2, dot: "border-fiat/40 bg-fiat/10 text-fiat" },
    { key: "stellar" as const, Icon: BookOpenCheck, dot: "border-chain/40 bg-chain/10 text-chain" },
  ];

  return (
    <LessonSection title={t("title")} lede={t("lede")}>
      <div className="grid gap-4 lg:grid-cols-2">
        {lanes.map(({ key, Icon, dot }) => {
          const stages = t.raw(`${key}.stages`) as Stage[];
          return (
            <Card key={key} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-4" aria-hidden="true" />
                  {t(`${key}.label`)}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{t(`${key}.total`)}</p>
              </CardHeader>
              <CardContent>
                <ol>
                  {stages.map((stage, index) => (
                    <li key={stage.title} className="relative flex gap-3 pb-4 last:pb-0">
                      {index < stages.length - 1 ? (
                        <span
                          className="absolute top-7 left-[13px] h-full w-px bg-border"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span
                        className={cn(
                          "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border font-onchain text-[11px] font-semibold",
                          dot,
                        )}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-medium">{stage.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                          {stage.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Callout kind="success" title={t("callout.title")} className="mt-4">
        {t("callout.body")}
      </Callout>
    </LessonSection>
  );
}
