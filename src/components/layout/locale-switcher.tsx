"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Languages } from "lucide-react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, startTransition] = useTransition();

  function select(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      // `params` carries any dynamic segments of the current route so the same
      // page is re-resolved under the new locale rather than dropping to root.
      router.replace(
        // @ts-expect-error -- pathname + params are consistent by construction
        { pathname, params },
        { locale: next },
      );
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2"
          disabled={pending}
          aria-label={t("language")}
        >
          <Languages className="size-4" aria-hidden="true" />
          <span className="text-xs font-medium">{localeLabels[locale].short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel className="text-xs">{t("language")}</DropdownMenuLabel>
        {locales.map((item) => (
          <DropdownMenuItem
            key={item}
            onSelect={() => select(item)}
            className="justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">{localeLabels[item].flag}</span>
              {localeLabels[item].name}
            </span>
            {item === locale ? <Check className="size-4" aria-hidden="true" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
