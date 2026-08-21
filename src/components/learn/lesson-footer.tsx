"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Circle } from "lucide-react";

import { useProgress } from "@/components/learn/use-progress";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { lessonNeighbours } from "@/lib/curriculum";
import { cn } from "@/lib/utils";

export function LessonFooter() {
  const t = useTranslations();
  const pathname = usePathname();
  const { isDone, toggle } = useProgress();
  const { previous, next } = lessonNeighbours(pathname);
  const done = isDone(pathname);

  return (
    <div className="mt-16 border-t border-border pt-6">
      <Button
        type="button"
        variant={done ? "secondary" : "outline"}
        onClick={() => toggle(pathname)}
        className={cn("gap-2", done && "text-success")}
      >
        {done ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Circle className="size-4" aria-hidden="true" />
        )}
        {done ? t("nav.markedComplete") : t("nav.markComplete")}
      </Button>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {previous ? (
          <Link
            href={previous.href}
            className="group flex flex-col gap-1 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true" />
              {t("nav.prevLesson")}
            </span>
            <span className="text-sm font-medium">{t(`${previous.messageKey}.title`)}</span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}

        {next ? (
          <Link
            href={next.href}
            className="group flex flex-col gap-1 rounded-lg border border-primary/30 bg-primary/5 p-4 text-right transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs text-primary">
              {t("nav.nextLesson")}
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">{t(`${next.messageKey}.title`)}</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
