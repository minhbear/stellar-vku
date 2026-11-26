"use client";

import { useTranslations } from "next-intl";

import { setPlatform, usePlatform, type Platform } from "@/components/contract/use-platform";
import type { PlatformVars } from "@/lib/contract/prompt";
import { cn } from "@/lib/utils";

const PLATFORMS: Platform[] = ["windows", "mac"];

/** Words the prompt templates use for `{{os}}` and `{{shell}}` on the chosen laptop. */
export function usePlatformVars(): PlatformVars {
  const t = useTranslations("contract.platform");
  const platform = usePlatform();
  return { os: t(`${platform}.os`), shell: t(`${platform}.shell`) };
}

/** Windows or macOS, so the AI answers with commands for the right terminal. */
export function PlatformSwitch({ className }: { className?: string }) {
  const t = useTranslations("contract.platform");
  const platform = usePlatform();

  return (
    <div className={cn("space-y-1.5", className)}>
      <p id="platform-label" className="text-sm font-medium">
        {t("label")}
      </p>
      <div
        role="radiogroup"
        aria-labelledby="platform-label"
        aria-describedby="platform-hint"
        className="inline-flex rounded-lg border border-border bg-muted/50 p-1"
      >
        {PLATFORMS.map((value) => {
          const active = value === platform;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPlatform(value)}
              className={cn(
                "min-h-9 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`${value}.label`)}
            </button>
          );
        })}
      </div>
      <p id="platform-hint" className="text-xs leading-relaxed text-muted-foreground">
        {t("hint")}
      </p>
    </div>
  );
}
