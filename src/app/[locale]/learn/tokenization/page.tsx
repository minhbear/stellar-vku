import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ExternalLink, Layers, Link2, Shapes } from "lucide-react";

import { LessonFooter } from "@/components/learn/lesson-footer";
import { Callout, LessonHeader, LessonSection } from "@/components/learn/lesson-shell";
import { Quiz } from "@/components/learn/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { KNOWN_ASSETS } from "@/lib/stellar/config";
import { truncateAddress } from "@/lib/stellar/format";
import { cn } from "@/lib/utils";

interface MetadataRow {
  field: string;
  meaning: string;
  where: "onChain" | "offChain";
}

interface AssetTypeRow {
  type: string;
  what: string;
  trustline: string;
  use: string;
}

interface FlowStep {
  title: string;
  body: string;
}

interface Tool {
  name: string;
  body: string;
  href: string;
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/tokenization">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "overview" });
  return { title: t("title"), description: t("lede") };
}

export default async function TokenizationOverviewPage({
  params,
}: PageProps<"/[locale]/learn/tokenization">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OverviewContent />;
}

function OverviewContent() {
  const t = useTranslations("overview");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.tokenization");

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 1 · ${tModule("title")}`}
        title={t("title")}
        lede={t("lede")}
      />

      {/* The quiz card carries its own heading — a section title above it would
          just repeat the same words. */}
      <Quiz />

      <Fungibility />
      <MetadataSection />
      <AssetTypes />
      <Trustlines />
      <ExplorerSection />

      <Card className="mt-14 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">{t("next.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[55ch] text-sm text-muted-foreground">{t("next.body")}</p>
          <Button asChild className="shrink-0 gap-2">
            <Link href="/learn/tokenization/stablecoin">
              {t("next.cta")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <LessonFooter />
    </article>
  );
}

function Fungibility() {
  const t = useTranslations("overview.fungibility");

  const columns = [
    { key: "fungible" as const, icon: Layers, accent: "text-primary" },
    { key: "nonFungible" as const, icon: Shapes, accent: "text-brand" },
  ];

  return (
    <LessonSection title={t("title")} lede={t("lede")}>
      <div className="grid gap-4 md:grid-cols-2">
        {columns.map(({ key, icon: Icon, accent }) => (
          <Card key={key} className="h-full">
            <CardHeader>
              <Icon className={cn("size-5", accent)} aria-hidden="true" />
              <CardTitle className="mt-2 text-base">{t(`${key}.title`)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {(t.raw(`${key}.points`) as string[]).map((point) => (
                  <li
                    key={point}
                    className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span
                      className={cn("mt-2 size-1 shrink-0 rounded-full bg-current", accent)}
                      aria-hidden="true"
                    />
                    <span className="text-pretty">{point}</span>
                  </li>
                ))}
              </ul>
              <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                {t(`${key}.examples`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </LessonSection>
  );
}

function MetadataSection() {
  const t = useTranslations("overview.metadata");

  const tabs = [
    { value: "fungible", label: t("fungibleTitle"), rows: t.raw("fungibleRows") as MetadataRow[] },
    {
      value: "nonFungible",
      label: t("nonFungibleTitle"),
      rows: t.raw("nonFungibleRows") as MetadataRow[],
    },
  ];

  return (
    <LessonSection title={t("title")} lede={t("lede")}>
      <Tabs defaultValue="fungible">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[36rem] text-sm">
                <thead className="bg-muted/60 text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 text-left font-medium">
                      {t("columns.field")}
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-left font-medium">
                      {t("columns.meaning")}
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-left font-medium">
                      {t("columns.where")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tab.rows.map((row) => (
                    <tr key={row.field} className="align-top">
                      <th scope="row" className="px-4 py-3 text-left font-medium whitespace-nowrap">
                        {row.field}
                      </th>
                      <td className="px-4 py-3 leading-relaxed text-muted-foreground">
                        {row.meaning}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
                            row.where === "onChain"
                              ? "border-success/40 bg-success/10 text-success"
                              : "border-border bg-muted text-muted-foreground",
                          )}
                        >
                          {t(row.where)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Callout kind="warning" title={t("callout.title")} className="mt-4">
        {t("callout.body")}
      </Callout>
    </LessonSection>
  );
}

function AssetTypes() {
  const t = useTranslations("overview.assetTypes");
  const rows = t.raw("rows") as AssetTypeRow[];

  return (
    <LessonSection title={t("title")} lede={t("lede")}>
      <div className="grid gap-4 lg:grid-cols-3">
        {rows.map((row, index) => (
          <Card key={row.type} className="h-full">
            <CardHeader>
              <span className="font-onchain text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <CardTitle className="mt-1 text-base leading-snug">{row.type}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="leading-relaxed text-muted-foreground">{row.what}</p>
              <dl className="space-y-2 border-t border-border pt-3 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t("columns.trustline")}</dt>
                  <dd className="text-right font-medium">{row.trustline}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">{t("columns.use")}</dt>
                  <dd className="leading-relaxed text-pretty">{row.use}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>

      <Callout kind="info" title={t("sacNote.title")} className="mt-4">
        {t("sacNote.body")}
      </Callout>
    </LessonSection>
  );
}

function Trustlines() {
  const t = useTranslations("overview.trustlines");
  const steps = t.raw("flowSteps") as FlowStep[];

  const blocks = [
    { title: t("howTitle"), body: t("howBody") },
    { title: t("costTitle"), body: t("costBody") },
    { title: t("whyOthersTitle"), body: t("whyOthersBody") },
    { title: t("tradeoffTitle"), body: t("tradeoffBody") },
  ];

  return (
    <LessonSection title={t("title")} lede={t("lede")}>
      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map((block) => (
          <div key={block.title} className="rounded-xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Link2 className="size-4 text-primary" aria-hidden="true" />
              {block.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              {block.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold">{t("flowTitle")}</h3>
        <ol className="mt-4 space-y-0">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
              {index < steps.length - 1 ? (
                <span
                  className="absolute top-8 left-[15px] h-full w-px bg-border"
                  aria-hidden="true"
                />
              ) : null}
              <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-onchain text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 pt-1">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </LessonSection>
  );
}

function ExplorerSection() {
  const t = useTranslations("overview.explorer");
  const tools = t.raw("tools") as Tool[];
  const checks = t.raw("checkItems") as string[];

  return (
    <LessonSection title={t("title")} lede={t("lede")}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("whatToCheck")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {checks.map((check) => (
                <li key={check} className="flex gap-2.5 text-sm leading-relaxed">
                  <span
                    className="mt-2 size-1 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <span className="text-pretty text-muted-foreground">{check}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">{t("toolsTitle")}</h3>
          {tools.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <p className="flex items-center gap-1.5 text-sm font-medium">
                {tool.name}
                <ExternalLink
                  className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tool.body}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold">{t("examplesTitle")}</h3>
        <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">{t("examplesLede")}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {KNOWN_ASSETS.map((asset) => (
            <a
              key={asset.issuer}
              href={`https://stellar.expert/explorer/public/asset/${asset.code}-${asset.issuer}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted font-onchain text-[11px] font-semibold">
                {asset.code.slice(0, 4)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{asset.name}</span>
                  <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {t(`kinds.${asset.kind}`)}
                  </span>
                </span>
                <span
                  title={asset.issuer}
                  className="mt-0.5 block font-onchain text-[11px] text-muted-foreground"
                >
                  {asset.code}:{truncateAddress(asset.issuer)}
                </span>
              </span>
              <ExternalLink
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
      </div>
    </LessonSection>
  );
}
