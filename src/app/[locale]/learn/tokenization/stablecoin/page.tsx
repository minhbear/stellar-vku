import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ExternalLink } from "lucide-react";

import { LessonFooter } from "@/components/learn/lesson-footer";
import { LessonHeader, LessonSection } from "@/components/learn/lesson-shell";
import { StablecoinWalkthrough } from "@/components/stablecoin/walkthrough";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

interface SourceItem {
  label: string;
  href: string;
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/tokenization/stablecoin">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "stablecoin" });
  return { title: t("title"), description: t("lede") };
}

export default async function StablecoinPage({
  params,
}: PageProps<"/[locale]/learn/tokenization/stablecoin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StablecoinContent />;
}

function StablecoinContent() {
  const t = useTranslations("stablecoin");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.tokenization");
  const sources = t.raw("sources.items") as SourceItem[];

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 1 · ${tModule("title")}`}
        title={t("title")}
        lede={t("lede")}
      />

      <StablecoinWalkthrough />

      <Card className="mt-12 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">{t("complete.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[55ch] text-sm text-muted-foreground">{t("complete.body")}</p>
          <Button asChild className="shrink-0 gap-2">
            <Link href="/learn/tokenization/issue-token">
              {t("complete.cta")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <LessonSection title={t("sources.title")} lede={t("sources.lede")}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {sources.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="min-w-0 flex-1 text-pretty">{source.label}</span>
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
