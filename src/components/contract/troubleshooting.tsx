import { useTranslations } from "next-intl";

import { CommandBlock } from "@/components/contract/command-block";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface TroubleshootItem {
  id: string;
  /** A command that fixes it, shown under the explanation. */
  command?: string;
}

/**
 * Symptom first, because that is what the student sees on screen. Copy lives
 * at `<namespace>.<id>`: `symptom`, optional `error` (the exact text the
 * terminal prints, so it can be matched by eye), `cause`, `fix`.
 */
export function Troubleshooting({
  namespace,
  items,
}: {
  namespace: string;
  items: TroubleshootItem[];
}) {
  const t = useTranslations(namespace);
  const tLabels = useTranslations("contract.labels");

  return (
    <Accordion type="multiple" className="rounded-xl border border-border bg-card px-4">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="text-left">
            {t(`${item.id}.symptom`)}
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {t.has(`${item.id}.error`) ? (
              <pre className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 font-onchain text-[12px] leading-relaxed break-words whitespace-pre-wrap text-destructive">
                {t(`${item.id}.error`)}
              </pre>
            ) : null}
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              <span className="font-medium text-foreground">{tLabels("cause")}: </span>
              {t(`${item.id}.cause`)}
            </p>
            <p className="text-sm leading-relaxed text-pretty">
              <span className="font-medium">{tLabels("fix")}: </span>
              {t(`${item.id}.fix`)}
            </p>
            {item.command ? <CommandBlock code={item.command} /> : null}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
