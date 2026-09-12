import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, MapPin } from "lucide-react";

import { CaseWorkspace } from "@/components/forensics/case-workspace";
import { CASE_1_SCENE } from "@/components/forensics/scene";
import { LessonFooter } from "@/components/learn/lesson-footer";
import { LessonHeader, LessonSection } from "@/components/learn/lesson-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CASE_1, case1 } from "@/lib/forensics/cases";
import { stellarConfig } from "@/lib/stellar/config";
import { truncateAddress } from "@/lib/stellar/format";

interface Panel {
  panel: string;
  body: string;
  /** Where to click to see it — the explorer's own wording, not an API call. */
  where: string;
}

interface Layer {
  name: string;
  body: string;
}

interface Tool {
  label: string;
  href: string;
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/forensics">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forensics.case1" });
  return { title: t("title"), description: t("lede") };
}

export default async function WalletCasePage({
  params,
}: PageProps<"/[locale]/learn/forensics">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WalletCaseContent />;
}

const SUBJECT_PAGE = stellarConfig.explorer.account(case1.subject);

const LINKS = {
  identity: SUBJECT_PAGE,
  trustlines: stellarConfig.explorer.asset(
    case1.holdings[0].code,
    case1.holdings[0].issuer,
  ),
  history: SUBJECT_PAGE,
  control: SUBJECT_PAGE,
  metadata: SUBJECT_PAGE,
};

function WalletCaseContent() {
  const t = useTranslations("forensics.case1");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.forensics");
  const panels = t.raw("manual.items") as Panel[];
  const layers = t.raw("layers.items") as Layer[];
  const further = t.raw("further.items") as string[];
  const tools = t.raw("further.tools") as Tool[];

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 2 · ${tModule("title")}`}
        title={t("title")}
        lede={t("lede")}
      />

      <LessonSection title={t("manual.title")} lede={t("manual.lede")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {panels.map((item) => (
            <Card key={item.panel} className="h-full">
              <CardHeader>
                <CardTitle className="text-base">{item.panel}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  {item.body}
                </p>
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="mt-0.5 size-3 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-pretty">{item.where}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </LessonSection>

      <LessonSection title={t("layers.title")} lede={t("layers.lede")}>
        <ol className="grid gap-3 md:grid-cols-3">
          {layers.map((layer, index) => (
            <li
              key={layer.name}
              className="rounded-xl border border-border bg-card p-4"
            >
              <span className="font-onchain text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-1 text-sm font-semibold">{layer.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {layer.body}
              </p>
            </li>
          ))}
        </ol>
      </LessonSection>

      <CaseWorkspace
        caseDef={CASE_1}
        scene={CASE_1_SCENE}
        namespace="forensics.case1"
        values={{ account: truncateAddress(case1.subject, 4, 4) }}
        links={LINKS}
      />

      <LessonSection title={t("further.title")} lede={t("further.lede")}>
        <ol className="space-y-2">
          {further.map((item, index) => (
            <li
              key={item}
              className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border font-onchain text-[11px] text-muted-foreground">
                {index + 1}
              </span>
              <span className="text-pretty text-muted-foreground">{item}</span>
            </li>
          ))}
        </ol>

        <h3 className="mt-8 text-sm font-semibold">{t("further.toolsTitle")}</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {tools.map((tool) => (
            <li key={tool.href}>
              <a
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="min-w-0 flex-1 text-pretty">{tool.label}</span>
                <ExternalLink
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>
      </LessonSection>

      <LessonFooter />
    </article>
  );
}
