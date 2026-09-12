import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, MapPin } from "lucide-react";

import { CaseWorkspace } from "@/components/forensics/case-workspace";
import { CASE_3_SCENE } from "@/components/forensics/scene";
import { LessonFooter } from "@/components/learn/lesson-footer";
import { Callout, LessonHeader, LessonSection } from "@/components/learn/lesson-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CASE_3, case3 } from "@/lib/forensics/cases";
import { stellarConfig } from "@/lib/stellar/config";
import { truncateAddress } from "@/lib/stellar/format";

interface Power {
  name: string;
  body: string;
  /** Where to click to see it, in the explorer's own wording. */
  where: string;
}

interface Tool {
  label: string;
  href: string;
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/forensics/frozen-wallet">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forensics.case3" });
  return { title: t("title"), description: t("lede") };
}

export default async function FrozenWalletPage({
  params,
}: PageProps<"/[locale]/learn/forensics/frozen-wallet">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FrozenWalletContent />;
}

const SUBJECT_PAGE = stellarConfig.explorer.account(case3.subject);
const ASSET_PAGE = stellarConfig.explorer.asset(case3.code, case3.issuer);
const ISSUER_PAGE = stellarConfig.explorer.account(case3.issuer);

const LINKS = {
  wallet: SUBJECT_PAGE,
  token: ASSET_PAGE,
  permission: ISSUER_PAGE,
  freeze: SUBJECT_PAGE,
  clawback: ISSUER_PAGE,
  supply: ASSET_PAGE,
};

const VALUES = {
  issuer: truncateAddress(case3.issuer, 4, 4),
  treasury: truncateAddress(case3.treasury, 4, 4),
  subject: truncateAddress(case3.subject, 4, 4),
  victim: truncateAddress(case3.clawback.address, 4, 4),
  burner: truncateAddress(case3.burn.address, 4, 4),
};

function FrozenWalletContent() {
  const t = useTranslations("forensics.case3");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.forensics");
  const powers = t.raw("powers.items") as Power[];
  const further = t.raw("further.items") as string[];
  const tools = t.raw("further.tools") as Tool[];

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 2 · ${tModule("title")} · ${t("badge")}`}
        title={t("title")}
        lede={t("lede")}
      >
        <Callout kind="info" title={t("homework.title")} className="mt-6">
          {t("homework.body")}
        </Callout>
      </LessonHeader>

      <LessonSection title={t("powers.title")} lede={t("powers.lede")}>
        <ol className="grid gap-3 md:grid-cols-3">
          {powers.map((power, index) => (
            <li key={power.name}>
              <Card className="h-full">
                <CardHeader>
                  <span className="font-onchain text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <CardTitle className="mt-1 text-base">{power.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                    {power.body}
                  </p>
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 size-3 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-pretty">{power.where}</span>
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </LessonSection>

      <CaseWorkspace
        caseDef={CASE_3}
        scene={CASE_3_SCENE}
        namespace="forensics.case3"
        values={VALUES}
        links={LINKS}
        homework
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
