import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, Gauge, PiggyBank, Timer } from "lucide-react";

import { CompareTable, SourceList, type CompareRow, type SourceItem } from "@/components/finance/blocks";
import { FlowWalkthrough } from "@/components/finance/flow-walkthrough";
import { BANK_LOAN_SCENE, BLEND_SCENE } from "@/components/finance/scenes";
import { LessonFooter } from "@/components/learn/lesson-footer";
import { Callout, LessonHeader, LessonSection } from "@/components/learn/lesson-shell";
import { Button } from "@/components/ui/button";

interface Item {
  title: string;
  body: string;
}

const BLEND_TESTNET = "https://testnet.blend.capital";
const IDEA_ICONS = [PiggyBank, Gauge, Timer];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/finance/lending">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "finance.lending" });
  return { title: t("title"), description: t("lede") };
}

export default async function LendingPage({
  params,
}: PageProps<"/[locale]/learn/finance/lending">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LendingContent />;
}

function LendingContent() {
  const t = useTranslations("finance.lending");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.finance");

  const ideas = t.raw("idea.items") as Item[];
  const howto = t.raw("howto.steps") as Item[];
  const risks = t.raw("risks.items") as string[];

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 3 · ${tModule("title")}`}
        title={t("title")}
        lede={t("lede")}
      />

      <LessonSection title={t("bank.title")} lede={t("bank.lede")}>
        <FlowWalkthrough scene={BANK_LOAN_SCENE} namespace="finance.lending.bank" />
      </LessonSection>

      <LessonSection title={t("idea.title")} lede={t("idea.lede")}>
        <div className="grid gap-4 md:grid-cols-3">
          {ideas.map((item, index) => {
            const Icon = IDEA_ICONS[index % IDEA_ICONS.length];
            return (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5">
                <Icon className="size-5 text-chain" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </LessonSection>

      <LessonSection title={t("blend.title")} lede={t("blend.lede")}>
        <FlowWalkthrough scene={BLEND_SCENE} namespace="finance.lending.blend" />
      </LessonSection>

      <LessonSection title={t("howto.title")} lede={t("howto.lede")}>
        <ol className="grid gap-3 md:grid-cols-2">
          {howto.map((step, index) => (
            <li key={step.title} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-onchain text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button asChild className="gap-2">
            <a href={BLEND_TESTNET} target="_blank" rel="noopener noreferrer">
              {t("howto.cta")}
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </Button>
          <p className="text-xs text-muted-foreground">{t("howto.note")}</p>
        </div>
      </LessonSection>

      <LessonSection title={t("compare.title")} lede={t("compare.lede")}>
        <CompareTable
          columns={[t("compare.columns.criterion"), t("compare.columns.bank"), t("compare.columns.stellar")]}
          rows={t.raw("compare.rows") as CompareRow[]}
        />
      </LessonSection>

      <LessonSection title={t("risks.title")} lede={t("risks.lede")}>
        <Callout kind="warning" title={t("risks.calloutTitle")}>
          <ul className="mt-1 space-y-1.5">
            {risks.map((risk) => (
              <li key={risk} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </Callout>
      </LessonSection>

      <LessonSection title={t("sources.title")} lede={t("sources.lede")}>
        <SourceList items={t.raw("sources.items") as SourceItem[]} />
      </LessonSection>

      <LessonFooter />
    </article>
  );
}
