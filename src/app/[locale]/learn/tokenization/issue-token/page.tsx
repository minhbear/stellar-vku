import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LessonFooter } from "@/components/learn/lesson-footer";
import { LessonHeader } from "@/components/learn/lesson-shell";
import { IssueWizard } from "@/components/token/issue-wizard";
import { NetworkBadge } from "@/components/stellar/network-badge";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/tokenization/issue-token">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "issue" });
  return { title: t("title"), description: t("lede") };
}

export default async function IssueTokenPage({
  params,
}: PageProps<"/[locale]/learn/tokenization/issue-token">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <IssueTokenContent />;
}

function IssueTokenContent() {
  const t = useTranslations("issue");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.tokenization");

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 1 · ${tModule("title")}`}
        title={t("title")}
        lede={t("lede")}
      >
        <div className="mt-5">
          <NetworkBadge />
        </div>
      </LessonHeader>

      <IssueWizard />

      <LessonFooter />
    </article>
  );
}
