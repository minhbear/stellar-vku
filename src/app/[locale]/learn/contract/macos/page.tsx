import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CommandBlock } from "@/components/contract/command-block";
import { GuideSteps, type GuideStepConfig } from "@/components/contract/guide-steps";
import { Troubleshooting, type TroubleshootItem } from "@/components/contract/troubleshooting";
import { LessonFooter } from "@/components/learn/lesson-footer";
import { Callout, LessonHeader, LessonSection } from "@/components/learn/lesson-shell";
import { Link } from "@/i18n/navigation";
import {
  COMMANDS,
  LINKS,
  MAC_COMMANDS,
  MIN_RUST_VERSION,
  STELLAR_CLI_VERSION,
} from "@/lib/contract/toolchain";

const PROJECT = "vku-ec-project";

const STEPS: GuideStepConfig[] = [
  { id: "github", links: [{ href: LINKS.github, label: "signup" }] },
  { id: "terminal", commands: [{ code: MAC_COMMANDS.makeFolder, caption: "folder" }] },
  { id: "xcode", commands: [{ code: MAC_COMMANDS.xcode }] },
  {
    id: "homebrew",
    commands: [
      { code: MAC_COMMANDS.homebrew, caption: "install" },
      { code: MAC_COMMANDS.brewPath, caption: "path" },
    ],
    links: [{ href: LINKS.homebrew, label: "site" }],
  },
  {
    id: "desktop",
    commands: [{ code: MAC_COMMANDS.brewGithubDesktop, caption: "brew" }],
    links: [{ href: LINKS.githubDesktop, label: "download" }],
  },
  {
    id: "rust",
    commands: [
      { code: MAC_COMMANDS.rustup, caption: "install" },
      { code: COMMANDS.rustTarget, caption: "target" },
    ],
    links: [{ href: LINKS.rustup, label: "manual" }],
  },
  {
    id: "stellar",
    commands: [{ code: MAC_COMMANDS.brewStellar }],
    links: [{ href: LINKS.stellarCliRelease, label: "release" }],
  },
  {
    id: "vscode",
    commands: [{ code: MAC_COMMANDS.brewVscode }],
    links: [
      { href: LINKS.vscode, label: "vscode" },
      { href: LINKS.rustAnalyzer, label: "rustAnalyzer" },
    ],
  },
  { id: "check", commands: [{ code: COMMANDS.checkVersions }] },
];

/** Windows command on the left, what a Mac student types instead on the right. */
const DIFFERENCES = [
  { id: "init", windows: COMMANDS.init(PROJECT), mac: MAC_COMMANDS.init(PROJECT) },
  { id: "sdk", windows: COMMANDS.checkSdk, mac: MAC_COMMANDS.checkSdk },
  { id: "deleteTest", windows: COMMANDS.deleteTest, mac: MAC_COMMANDS.deleteTest },
  { id: "deploy", windows: COMMANDS.deploy, mac: MAC_COMMANDS.deploy },
] as const;

const TROUBLE: TroubleshootItem[] = [
  { id: "notFound", command: MAC_COMMANDS.cargoEnv },
  { id: "brewNotFound", command: MAC_COMMANDS.brewPath },
  { id: "xcrun", command: MAC_COMMANDS.xcode },
  { id: "password" },
  { id: "brewRust", command: MAC_COMMANDS.brewUninstallRust },
  { id: "target", command: COMMANDS.rustTarget },
  { id: "oldRust", command: COMMANDS.rustUpdate },
  { id: "code" },
  { id: "unverified" },
  { id: "icloud" },
];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/contract/macos">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contract.macos" });
  return { title: t("title"), description: t("lede") };
}

export default async function ContractMacosPage({
  params,
}: PageProps<"/[locale]/learn/contract/macos">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MacosContent />;
}

function MacosContent() {
  const t = useTranslations("contract.macos");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.contract");

  const before = t.raw("before.items") as string[];
  const habits = t.raw("differences.habits") as string[];

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 5 · ${tModule("title")}`}
        title={t("title")}
        lede={t("lede")}
      >
        <Callout kind="info" title={t("intro.title")} className="mt-6 max-w-[65ch]">
          {t("intro.body")}{" "}
          <Link
            href="/learn/contract#risein"
            className="font-medium text-foreground underline underline-offset-3"
          >
            {t("intro.link")}
          </Link>
        </Callout>
      </LessonHeader>

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
        <GuideSteps namespace="contract.macos.steps" steps={STEPS} />
      </LessonSection>

      <LessonSection id="differences" title={t("differences.title")} lede={t("differences.lede")}>
        <ul className="mb-6 grid gap-2 sm:grid-cols-2">
          {habits.map((habit) => (
            <li key={habit} className="rounded-lg border border-border bg-card px-4 py-3 text-sm leading-relaxed text-pretty">
              {habit}
            </li>
          ))}
        </ul>
        <ol className="grid gap-4">
          {DIFFERENCES.map((row) => (
            <li key={row.id} className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">{t(`differences.commands.${row.id}`)}</h3>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <CommandBlock code={row.windows} caption={t("differences.windows")} />
                <CommandBlock code={row.mac} caption={t("differences.mac")} />
              </div>
            </li>
          ))}
        </ol>
      </LessonSection>

      <LessonSection title={t("trouble.title")} lede={t("trouble.lede")}>
        <Troubleshooting namespace="contract.macos.trouble.items" items={TROUBLE} />
      </LessonSection>

      <LessonFooter />
    </article>
  );
}
