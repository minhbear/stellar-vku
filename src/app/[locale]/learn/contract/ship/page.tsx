import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";

import { CommandBlock } from "@/components/contract/command-block";
import { FixErrorPrompt } from "@/components/contract/fix-error-prompt";
import { GuideSteps, type GuideStepConfig } from "@/components/contract/guide-steps";
import { InvokePrompt } from "@/components/contract/invoke-prompt";
import { Troubleshooting, type TroubleshootItem } from "@/components/contract/troubleshooting";
import { LessonFooter } from "@/components/learn/lesson-footer";
import { Callout, LessonHeader, LessonSection } from "@/components/learn/lesson-shell";
import { README_TEMPLATE } from "@/lib/contract/readme";
import { COMMANDS, CONTRACT_ALIAS, IDENTITY, LINKS, MAC_COMMANDS } from "@/lib/contract/toolchain";

const BUILD_STEPS: GuideStepConfig[] = [{ id: "build", commands: [{ code: COMMANDS.build }] }];

const DEPLOY_STEPS: GuideStepConfig[] = [
  { id: "keys", commands: [{ code: COMMANDS.keys }] },
  {
    id: "deploy",
    commands: [
      { code: COMMANDS.deploy, caption: "windows" },
      { code: MAC_COMMANDS.deploy, caption: "mac" },
    ],
  },
  { id: "help", commands: [{ code: COMMANDS.help }] },
  { id: "invokePrompt", slot: <InvokePrompt /> },
  {
    id: "invoke",
    commands: [
      { code: COMMANDS.invokeWrite, caption: "write" },
      { code: COMMANDS.invokeRead, caption: "read" },
    ],
  },
  {
    id: "explorer",
    commands: [{ code: COMMANDS.contractId, caption: "id" }],
    links: [{ href: LINKS.expertContract, label: "expert" }],
  },
];

const README_STEPS: GuideStepConfig[] = [{ id: "write" }, { id: "image" }];

const GITHUB_STEPS: GuideStepConfig[] = [
  { id: "add" },
  { id: "publish" },
  { id: "check" },
  { id: "update" },
];

const TROUBLE: TroubleshootItem[] = [
  { id: "compile" },
  { id: "modTest", command: COMMANDS.deleteTest },
  { id: "wasmMissing" },
  { id: "notFunded", command: COMMANDS.fund },
  { id: "contractError" },
  { id: "auth" },
  { id: "badArg", command: COMMANDS.help },
  { id: "redeploy" },
  { id: "readOnly" },
  { id: "notRepo" },
  { id: "publishName" },
  { id: "target" },
];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/contract/ship">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contract.ship" });
  return { title: t("title"), description: t("lede") };
}

export default async function ContractShipPage({
  params,
}: PageProps<"/[locale]/learn/contract/ship">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ShipContent />;
}

function ShipContent() {
  const t = useTranslations("contract.ship");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.contract");

  const checklist = t.raw("submit.items") as string[];
  const readmePrompt = (t.raw("readme.prompt") as string[]).join("\n");

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 5 · ${tModule("title")}`}
        title={t("title")}
        lede={t("lede")}
      >
        <Callout kind="info" title={t("intro.title")} className="mt-6 max-w-[65ch]">
          {t("intro.body", { identity: IDENTITY, alias: CONTRACT_ALIAS })}
        </Callout>
      </LessonHeader>

      <LessonSection title={t("buildSection.title")} lede={t("buildSection.lede")}>
        <GuideSteps namespace="contract.ship.buildSection.steps" steps={BUILD_STEPS} />
      </LessonSection>

      <LessonSection title={t("deploySection.title")} lede={t("deploySection.lede")}>
        <GuideSteps namespace="contract.ship.deploySection.steps" steps={DEPLOY_STEPS} start={2} />
      </LessonSection>

      <LessonSection id="readme" title={t("readme.title")} lede={t("readme.lede")}>
        <GuideSteps namespace="contract.ship.readme.steps" steps={README_STEPS} start={8} />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <CommandBlock code={readmePrompt} caption={t("readme.promptCaption")} />
          <CommandBlock code={README_TEMPLATE} caption={t("readme.templateCaption")} />
        </div>
      </LessonSection>

      <LessonSection title={t("github.title")} lede={t("github.lede")}>
        <GuideSteps namespace="contract.ship.github.steps" steps={GITHUB_STEPS} start={10} />
      </LessonSection>

      <LessonSection id="fix" title={t("fix.title")} lede={t("fix.lede")}>
        <FixErrorPrompt />
      </LessonSection>

      <LessonSection title={t("trouble.title")} lede={t("trouble.lede")}>
        <Troubleshooting namespace="contract.ship.trouble.items" items={TROUBLE} />
      </LessonSection>

      <LessonSection title={t("submit.title")} lede={t("submit.lede")}>
        <ul className="grid gap-2">
          {checklist.map((item) => (
            <li key={item} className="flex gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm leading-relaxed">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              <span className="text-pretty">{item}</span>
            </li>
          ))}
        </ul>
      </LessonSection>

      <LessonFooter />
    </article>
  );
}
