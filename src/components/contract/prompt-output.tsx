"use client";

import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** The finished prompt, plus one large copy button: the only action that matters here. */
export function PromptOutput({ value, title, hint }: { value: string; title: string; hint: string }) {
  const tCommon = useTranslations("common");
  const t = useTranslations("contract.labels");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(tCommon("copied"));
    } catch {
      toast.error(tCommon("copyFailed"));
    }
  }

  return (
    <div className="animate-rise space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 max-w-[60ch] text-xs leading-relaxed text-muted-foreground">{hint}</p>
        </div>
        <Button type="button" onClick={copy} className="gap-2">
          <Copy className="size-4" aria-hidden="true" />
          {t("copyPrompt")}
        </Button>
      </div>
      <pre
        tabIndex={0}
        aria-label={title}
        className="max-h-96 overflow-y-auto rounded-lg border border-border bg-background p-3 font-onchain text-[12.5px] leading-relaxed break-words whitespace-pre-wrap"
      >
        {value}
      </pre>
    </div>
  );
}
