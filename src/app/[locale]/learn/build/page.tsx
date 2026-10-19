import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight, Handshake, PiggyBank } from "lucide-react";

import { LessonFooter } from "@/components/learn/lesson-footer";
import { Callout, LessonHeader, LessonSection } from "@/components/learn/lesson-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAPPS } from "@/lib/dapps";

interface Item {
  title: string;
  body: string;
}

const APP_ICONS = {
  sharebill: PiggyBank,
  escrow: Handshake,
} as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/build">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "build" });
  return { title: t("title"), description: t("lede") };
}

export default async function BuildPage({ params }: PageProps<"/[locale]/learn/build">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BuildContent />;
}

function BuildContent() {
  const t = useTranslations("build");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.build");

  const prepare = t.raw("prepare.items") as string[];
  const steps = t.raw("steps.items") as Item[];
  const questions = t.raw("worksheet.items") as string[];

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 4 · ${tModule("title")}`}
        title={t("title")}
        lede={t("lede")}
      >
        <Callout kind="info" title={t("intro.title")} className="mt-6 max-w-[65ch]">
          {t("intro.body")}
        </Callout>
      </LessonHeader>

      <LessonSection title={t("prepare.title")}>
        <ol className="grid gap-3 sm:grid-cols-3">
          {prepare.map((item, index) => (
            <li key={item} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-onchain text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{item}</p>
            </li>
          ))}
        </ol>
      </LessonSection>

      <LessonSection title={t("apps.title")} lede={t("apps.lede")}>
        <div className="grid gap-4 lg:grid-cols-2">
          {DAPPS.map((dapp) => {
            const Icon = APP_ICONS[dapp.id];
            return (
              <Card key={dapp.id} className="flex h-full flex-col">
                <CardHeader>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <CardTitle className="mt-3 text-lg">
                    {t(`apps.items.${dapp.id}.name`)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t(`apps.items.${dapp.id}.tagline`)}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                    {t(`apps.items.${dapp.id}.body`)}
                  </p>
                  <p className="rounded-lg border border-chain/30 bg-chain/8 px-3 py-2 text-sm">
                    {t(`apps.items.${dapp.id}.rule`)}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                    {dapp.url ? (
                      <Button asChild className="gap-2">
                        <a href={dapp.url} target="_blank" rel="noopener noreferrer">
                          {t("apps.open")}
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                        </a>
                      </Button>
                    ) : (
                      <Button disabled className="gap-2">
                        {t("apps.soon")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </LessonSection>

      <LessonSection title={t("worksheet.title")} lede={t("worksheet.lede")}>
        <ol className="grid gap-3">
          {questions.map((question, index) => (
            <li key={question} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-warning/30 bg-warning/10 font-onchain text-xs font-semibold text-warning">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-pretty">{question}</p>
            </li>
          ))}
        </ol>

        <Callout kind="success" title={t("answer.title")} className="mt-4">
          {t("answer.body")}
        </Callout>
      </LessonSection>

      <LessonSection title={t("steps.title")} lede={t("steps.lede")}>
        <ol className="grid gap-3 md:grid-cols-2">
          {steps.map((step, index) => (
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
      </LessonSection>

      <LessonFooter />
    </article>
  );
}
