import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, MapPin } from "lucide-react";

import { CaseWorkspace } from "@/components/forensics/case-workspace";
import { CASE_2_SCENE } from "@/components/forensics/scene";
import { LessonFooter } from "@/components/learn/lesson-footer";
import { LessonHeader, LessonSection } from "@/components/learn/lesson-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CASE_2, case2 } from "@/lib/forensics/cases";
import { stellarConfig } from "@/lib/stellar/config";
import { truncateAddress } from "@/lib/stellar/format";

interface Step {
  name: string;
  body: string;
  /** Where to click to see it — the explorer's own wording, not an API call. */
  where: string;
}

interface Tool {
  label: string;
  href: string;
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/forensics/airdrop">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forensics.case2" });
  return { title: t("title"), description: t("lede") };
}

export default async function AirdropCasePage({
  params,
}: PageProps<"/[locale]/learn/forensics/airdrop">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AirdropCaseContent />;
}

const ASSET_PAGE = stellarConfig.explorer.asset(case2.code, case2.issuer);

const LINKS = {
  address: stellarConfig.explorer.contract(case2.contractId),
  identity: ASSET_PAGE,
  mint: stellarConfig.explorer.account(case2.issuer),
  fanout: stellarConfig.explorer.account(case2.treasury),
  secondary: ASSET_PAGE,
  lock: ASSET_PAGE,
};

const VALUES = {
  contract: truncateAddress(case2.contractId, 4, 4),
  asset: case2.code,
  issuer: truncateAddress(case2.issuer, 4, 4),
  treasury: truncateAddress(case2.treasury, 4, 4),
  decoy: truncateAddress(case2.decoy.issuer, 4, 4),
  mule: truncateAddress(case2.forward.to, 4, 4),
};

function AirdropCaseContent() {
  const t = useTranslations("forensics.case2");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.forensics");
  const steps = t.raw("toolkit.items") as Step[];
  const further = t.raw("further.items") as string[];
  const tools = t.raw("further.tools") as Tool[];

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 2 · ${tModule("title")}`}
        title={t("title")}
        lede={t("lede")}
      />

      <LessonSection title={t("toolkit.title")} lede={t("toolkit.lede")}>
        <ol className="grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.name}>
              <Card className="h-full">
                <CardHeader>
                  <span className="font-onchain text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <CardTitle className="mt-1 text-base">{step.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                    {step.body}
                  </p>
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 size-3 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-pretty">{step.where}</span>
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </LessonSection>

      <CaseWorkspace
        caseDef={CASE_2}
        scene={CASE_2_SCENE}
        namespace="forensics.case2"
        values={VALUES}
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
