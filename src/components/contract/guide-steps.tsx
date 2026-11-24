import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

import { CommandBlock } from "@/components/contract/command-block";
import { Callout } from "@/components/learn/lesson-shell";
import { Button } from "@/components/ui/button";

export interface GuideCommand {
  code: string;
  /** Key under `<namespace>.<step>.captions`. */
  caption?: string;
}

export interface GuideLink {
  href: string;
  /** Key under `<namespace>.<step>.links`. */
  label: string;
}

export interface GuideStepConfig {
  id: string;
  commands?: GuideCommand[];
  links?: GuideLink[];
  /** Extra content (a form, say) shown after the commands. */
  slot?: ReactNode;
}

/**
 * Numbered how-to steps. The copy for each step lives at `<namespace>.<id>`:
 * `title`, `body`, optional `items` (sub-steps), optional `expect` (what the
 * screen should show) and optional `note` (a warning).
 */
export function GuideSteps({
  namespace,
  steps,
  start = 1,
}: {
  namespace: string;
  steps: GuideStepConfig[];
  start?: number;
}) {
  const t = useTranslations(namespace);

  return (
    <ol className="grid gap-4">
      {steps.map((step, index) => {
        const items = t.has(`${step.id}.items`) ? (t.raw(`${step.id}.items`) as string[]) : [];
        return (
          <li
            key={step.id}
            id={`step-${step.id}`}
            className="scroll-mt-24 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-onchain text-xs font-semibold text-primary">
                {start + index}
              </span>
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <h3 className="text-base font-semibold">{t(`${step.id}.title`)}</h3>
                  <p className="mt-1.5 max-w-[70ch] text-sm leading-relaxed text-muted-foreground text-pretty">
                    {t(`${step.id}.body`)}
                  </p>
                </div>

                {items.length > 0 ? (
                  <ol className="max-w-[70ch] list-decimal space-y-1.5 pl-5 text-sm leading-relaxed marker:text-muted-foreground">
                    {items.map((item) => (
                      <li key={item} className="pl-1 text-pretty">
                        {item}
                      </li>
                    ))}
                  </ol>
                ) : null}

                {step.links?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {step.links.map((link) => (
                      <Button key={link.href} asChild variant="outline" size="sm" className="gap-1.5">
                        <a href={link.href} target="_blank" rel="noopener noreferrer">
                          {t(`${step.id}.links.${link.label}`)}
                          <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        </a>
                      </Button>
                    ))}
                  </div>
                ) : null}

                {step.commands?.map((command) => (
                  <CommandBlock
                    key={command.code}
                    code={command.code}
                    caption={command.caption ? t(`${step.id}.captions.${command.caption}`) : undefined}
                  />
                ))}

                {step.slot}

                {t.has(`${step.id}.expect`) ? (
                  <Callout kind="success">{t(`${step.id}.expect`)}</Callout>
                ) : null}

                {t.has(`${step.id}.note`) ? (
                  <Callout kind="warning">{t(`${step.id}.note`)}</Callout>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
