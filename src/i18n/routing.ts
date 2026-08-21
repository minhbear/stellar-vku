import { defineRouting } from "next-intl/routing";

export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, { name: string; short: string; flag: string }> = {
  en: { name: "English", short: "EN", flag: "🇬🇧" },
  vi: { name: "Tiếng Việt", short: "VI", flag: "🇻🇳" },
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Every URL carries its locale so a lecturer can share /vi/... or /en/... directly.
  localePrefix: "always",
});
