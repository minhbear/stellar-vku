"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    // Surfaced in the browser console so a lecturer can read it during class.
    console.error("[stellar-vku]", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-4 px-4 py-24 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("boundaryTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("boundaryBody")}</p>
      {error.digest ? (
        <p className="font-onchain text-xs text-muted-foreground">{error.digest}</p>
      ) : null}
      <Button onClick={reset} className="gap-2">
        <RotateCcw className="size-4" aria-hidden="true" />
        {t("backHome")}
      </Button>
    </main>
  );
}
