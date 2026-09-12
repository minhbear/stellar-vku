import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Clock3,
  ExternalLink,
  FlaskConical,
  Sparkles,
} from "lucide-react";

import { AssetPreviewCard } from "@/components/onboarding/asset-preview-card";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { MODULES, lessonHref } from "@/lib/curriculum";

interface Highlight {
  title: string;
  body: string;
}

interface Prereq extends Highlight {
  action: string;
  href: string;
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: t("title"), description: t("lede") };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  // Without this the page opts out of static rendering and every visit is SSR'd.
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Highlights />
      <Curriculum />
      <Prerequisites />
      <SiteFooter />
    </>
  );
}

function Hero() {
  const t = useTranslations("home");
  const firstModule = MODULES[0];

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        {/* No entrance animation on the hero: it is the LCP block, and fading it
            in only delays the moment the page becomes readable. */}
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-brand" aria-hidden="true" />
            {t("eyebrow")}
          </p>

          <h1 className="mt-5 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
            {t.rich("titleRich", {
              // Keeps the accent word in the translator's control instead of
              // slicing the string in code.
              accent: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
          </h1>

          <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("lede")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href={lessonHref(firstModule.slug, firstModule.lessons[0].slug)}>
                {t("ctaPrimary")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={lessonHref(firstModule.slug, "issue-token")}>
                {t("ctaSecondary")}
              </Link>
            </Button>
          </div>

          <p className="mt-6 inline-flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/8 px-3 py-2 text-xs text-warning">
            <FlaskConical className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {t("badgeTestnet")}
          </p>
        </div>

        <div className="lg:justify-self-end">
          <AssetPreviewCard />
        </div>
      </div>
    </section>
  );
}

function Highlights() {
  const t = useTranslations("home.highlights");
  const items = t.raw("items") as Highlight[];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
      </Reveal>

      <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <Card key={item.title} className="h-full">
            <CardHeader>
              <span
                className="font-onchain text-xs text-muted-foreground"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <CardTitle className="mt-1 text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              {item.body}
            </CardContent>
          </Card>
        ))}
      </Stagger>
    </section>
  );
}

function Curriculum() {
  const t = useTranslations();

  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("home.curriculum.title")}
          </h2>
          <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
            {t("home.curriculum.lede")}
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {MODULES.map((module) => (
            <Reveal key={module.id}>
              <Card className="h-full">
                <CardHeader>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {t("common.module")} {module.order}
                  </p>
                  <CardTitle className="text-xl">
                    {t(`modules.${module.id}.title`)}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`modules.${module.id}.description`)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-1">
                  {module.lessons.map((lesson, index) => {
                    const key = `modules.${module.id}.lessons.${lesson.id}`;
                    return (
                      <Link
                        key={lesson.id}
                        href={lessonHref(module.slug, lesson.slug)}
                        className="group flex items-start gap-3 rounded-lg border border-transparent px-3 py-3 transition-colors hover:border-border hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-card font-onchain text-[11px] text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{t(`${key}.title`)}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                            {t(`${key}.description`)}
                          </span>
                        </span>
                        <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock3 className="size-3" aria-hidden="true" />
                          {t("common.minutes", { count: lesson.minutes })}
                        </span>
                        <ArrowRight
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            </Reveal>
          ))}

          <Reveal delay={0.08}>
            <Card className="h-full border-dashed bg-transparent shadow-none">
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">
                  {t("home.curriculum.comingSoon")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {t("home.curriculum.comingSoonBody")}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Prerequisites() {
  const t = useTranslations("home.prereq");
  const items = t.raw("items") as Prereq[];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">{t("lede")}</p>
      </Reveal>

      <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <Card key={item.title} className="h-full">
            <CardHeader>
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/12 font-onchain text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <CardTitle className="mt-2 text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex h-full flex-col gap-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {item.action}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </CardContent>
          </Card>
        ))}
      </Stagger>
    </section>
  );
}

function SiteFooter() {
  const t = useTranslations();
  const links = [
    { label: t("home.footer.docs"), href: "https://developers.stellar.org" },
    { label: t("home.footer.explorer"), href: "https://stellar.expert/explorer/testnet" },
    { label: t("home.footer.lab"), href: "https://lab.stellar.org" },
  ];

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-7xl px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <nav className="flex flex-wrap gap-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {link.label}
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
