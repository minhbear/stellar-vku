import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { GuideSteps, type GuideStepConfig } from "@/components/contract/guide-steps";
import { Troubleshooting, type TroubleshootItem } from "@/components/contract/troubleshooting";
import { LessonFooter } from "@/components/learn/lesson-footer";
import { Callout, LessonHeader, LessonSection } from "@/components/learn/lesson-shell";
import { COMMANDS, LINKS, MIN_RUST_VERSION, STELLAR_CLI_VERSION } from "@/lib/contract/toolchain";

interface Part {
  title: string;
  body: string;
}

const STEPS: GuideStepConfig[] = [
  { id: "github", links: [{ href: LINKS.github, label: "signup" }] },
  {
    id: "desktop",
    links: [{ href: LINKS.githubDesktop, label: "download" }],
    commands: [{ code: COMMANDS.wingetGithubDesktop, caption: "winget" }],
  },
  {
    id: "terminal",
    links: [{ href: LINKS.windowsTerminal, label: "terminal" }],
    commands: [{ code: COMMANDS.makeFolder, caption: "folder" }],
  },
  {
    id: "buildTools",
    commands: [{ code: COMMANDS.wingetBuildTools, caption: "winget" }],
    links: [{ href: LINKS.vsBuildTools, label: "manual" }],
  },
  {
    id: "rust",
    commands: [
      { code: COMMANDS.wingetRust, caption: "install" },
      { code: COMMANDS.rustTarget, caption: "target" },
    ],
    links: [{ href: LINKS.rustup, label: "manual" }],
  },
  {
    id: "stellar",
    commands: [{ code: COMMANDS.wingetStellar, caption: "winget" }],
    links: [{ href: LINKS.stellarCliInstaller, label: "installer" }],
  },
  {
    id: "vscode",
    links: [
      { href: LINKS.vscode, label: "vscode" },
      { href: LINKS.rustAnalyzer, label: "rustAnalyzer" },
    ],
  },
  { id: "check", commands: [{ code: COMMANDS.checkVersions }] },
];

const TROUBLE: TroubleshootItem[] = [
  { id: "notRecognized" },
  { id: "winget" },
  { id: "linker" },
  { id: "target", command: COMMANDS.rustTarget },
  { id: "oldRust", command: COMMANDS.rustUpdate },
  { id: "gnu", command: COMMANDS.rustMsvc },
  { id: "policy", command: COMMANDS.executionPolicy },
  { id: "path" },
  { id: "antivirus" },
  { id: "emoji" },
];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/contract">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contract.setup" });
  return { title: t("title"), description: t("lede") };
}

export default async function ContractSetupPage({ params }: PageProps<"/[locale]/learn/contract">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SetupContent />;
}

function SetupContent() {
  const t = useTranslations("contract.setup");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.contract");

  const parts = t.raw("ec.parts") as Part[];
  const before = t.raw("before.items") as string[];

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 5 · ${tModule("title")}`}
        title={t("title")}
        lede={t("lede")}
      />

      <LessonSection title={t("ec.title")} lede={t("ec.lede")}>
        <ol className="grid gap-3 sm:grid-cols-2">
          {parts.map((part, index) => (
            <li key={part.title} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-chain/30 bg-chain/10 font-onchain text-xs font-semibold text-chain">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{part.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {part.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <Callout kind="info" title={t("ec.example.title")} className="mt-4">
          {t("ec.example.body")}{" "}
          <a
            href={LINKS.exampleRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-3"
          >
            ChainSubscription-Hub
          </a>
        </Callout>
      </LessonSection>

      <LessonSection title={t("before.title")} lede={t("before.lede")}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {before.map((item) => (
            <li key={item} className="rounded-lg border border-border bg-card px-4 py-3 text-sm leading-relaxed text-pretty">
              {item}
            </li>
          ))}
        </ul>
      </LessonSection>

      <LessonSection
        title={t("steps.title")}
        lede={t("steps.lede", { cli: STELLAR_CLI_VERSION, rust: MIN_RUST_VERSION })}
      >
        <GuideSteps namespace="contract.setup.steps" steps={STEPS} />
      </LessonSection>

      <LessonSection title={t("trouble.title")} lede={t("trouble.lede")}>
        <Troubleshooting namespace="contract.setup.trouble.items" items={TROUBLE} />
      </LessonSection>

      <LessonFooter />
    </article>
  );
}
