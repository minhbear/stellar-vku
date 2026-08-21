import type { ReactNode } from "react";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

export function LessonHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mt-6 mb-12">
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      {lede ? (
        <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
          {lede}
        </p>
      ) : null}
      {children}
    </header>
  );
}

export function LessonSection({
  title,
  lede,
  children,
  className,
  id,
}: {
  title: string;
  lede?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("mt-14 scroll-mt-24", className)}>
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      {lede ? (
        <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
          {lede}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

const CALLOUT_STYLES = {
  info: {
    wrapper: "border-info/30 bg-info/8",
    icon: "text-info",
    Icon: Info,
  },
  warning: {
    wrapper: "border-warning/35 bg-warning/8",
    icon: "text-warning",
    Icon: AlertTriangle,
  },
  success: {
    wrapper: "border-success/30 bg-success/8",
    icon: "text-success",
    Icon: Lightbulb,
  },
} as const;

export type CalloutKind = keyof typeof CALLOUT_STYLES;

export function Callout({
  kind = "info",
  title,
  children,
  className,
}: {
  kind?: CalloutKind;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { wrapper, icon, Icon } = CALLOUT_STYLES[kind];

  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", wrapper, className)}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} aria-hidden="true" />
      <div className="min-w-0 space-y-1">
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        <div className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {children}
        </div>
      </div>
    </div>
  );
}
