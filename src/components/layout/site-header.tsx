import { useTranslations } from "next-intl";

import { BrandMark } from "@/components/layout/brand-mark";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NetworkBadge } from "@/components/stellar/network-badge";
import { WalletChip } from "@/components/stellar/wallet-chip";
import { Link } from "@/i18n/navigation";
import { MODULES, lessonHref } from "@/lib/curriculum";

export function SiteHeader() {
  const t = useTranslations();
  const firstModule = MODULES[0];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <BrandMark className="size-6 text-primary transition-transform duration-200 group-hover:rotate-12" />
          <span className="text-sm font-semibold tracking-tight">
            {t("meta.siteName")}
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 text-sm md:flex">
          <Link
            href={lessonHref(firstModule.slug, firstModule.lessons[0].slug)}
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {t("nav.curriculum")}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <NetworkBadge className="hidden sm:inline-flex" />
          <WalletChip />
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
