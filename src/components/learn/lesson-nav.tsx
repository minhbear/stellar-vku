"use client";

import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Globe,
  HandCoins,
  Library,
  NotebookPen,
  Radar,
  Search,
  Wand2,
} from "lucide-react";

import { useProgress } from "@/components/learn/use-progress";
import { Progress } from "@/components/ui/progress";
import { Link, usePathname } from "@/i18n/navigation";
import { MODULES, TOTAL_LESSONS, lessonHref, type LessonIcon } from "@/lib/curriculum";
import { cn } from "@/lib/utils";

const ICONS: Record<LessonIcon, typeof Library> = {
  concepts: Library,
  stablecoin: CircleDollarSign,
  issue: Wand2,
  trace: Search,
  hunt: Radar,
  homework: NotebookPen,
  remit: Globe,
  lending: HandCoins,
};

export function LessonNav({ variant = "sidebar" }: { variant?: "sidebar" | "strip" }) {
  const t = useTranslations();
  const pathname = usePathname();
  const { completed, isDone } = useProgress();

  const doneCount = completed.length;

  if (variant === "strip") {
    return (
      <nav
        aria-label={t("nav.modules")}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden"
      >
        {MODULES.flatMap((module) =>
          module.lessons.map((lesson) => {
            const href = lessonHref(module.slug, lesson.slug);
            const active = pathname === href;
            const Icon = ICONS[lesson.icon];
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {t(`modules.${module.id}.lessons.${lesson.id}.short`)}
                {isDone(href) ? (
                  <CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />
                ) : null}
              </Link>
            );
          }),
        )}
      </nav>
    );
  }

  return (
    <nav aria-label={t("nav.modules")} className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium text-muted-foreground">{t("nav.progress")}</span>
          <span className="font-onchain text-muted-foreground">
            {t("nav.progressValue", { done: doneCount, total: TOTAL_LESSONS })}
          </span>
        </div>
        <Progress value={(doneCount / TOTAL_LESSONS) * 100} className="h-1.5" />
      </div>

      {MODULES.map((module) => (
        <div key={module.id} className="space-y-2">
          <p className="px-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {t("common.module")} {module.order} · {t(`modules.${module.id}.title`)}
          </p>

          <ul className="space-y-0.5">
            {module.lessons.map((lesson) => {
              const href = lessonHref(module.slug, lesson.slug);
              const active = pathname === href;
              const Icon = ICONS[lesson.icon];
              const key = `modules.${module.id}.lessons.${lesson.id}`;

              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors",
                      active
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border text-[10px] transition-colors",
                        active
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-border bg-card",
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-sm leading-snug",
                          active ? "font-semibold text-foreground" : "font-medium",
                        )}
                      >
                        {t(`${key}.title`)}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock3 className="size-3" aria-hidden="true" />
                        {t("common.minutes", { count: lesson.minutes })}
                      </span>
                    </span>

                    {isDone(href) ? (
                      <CheckCircle2
                        className="mt-1 size-4 shrink-0 text-success"
                        aria-label={t("nav.markedComplete")}
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
