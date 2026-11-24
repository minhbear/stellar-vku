import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CommandBlock } from "@/components/contract/command-block";
import { GuideSteps, type GuideStepConfig } from "@/components/contract/guide-steps";
import { PromptBuilder } from "@/components/contract/prompt-builder";
import { LessonFooter } from "@/components/learn/lesson-footer";
import { Callout, LessonHeader, LessonSection } from "@/components/learn/lesson-shell";
import { COMMANDS, CONTRACT_DIR, SOROBAN_SDK_MAJOR } from "@/lib/contract/toolchain";

const PROJECT = "vku-ec-project";

const INIT_STEPS: GuideStepConfig[] = [
  { id: "init", commands: [{ code: COMMANDS.init(PROJECT) }] },
  { id: "open", commands: [{ code: COMMANDS.openCode }] },
  { id: "sdk", commands: [{ code: COMMANDS.checkSdk }] },
];

const PASTE_STEPS: GuideStepConfig[] = [
  { id: "paste" },
  { id: "deleteTest", commands: [{ code: COMMANDS.deleteTest }] },
  { id: "review" },
];

const TREE = `${PROJECT}\\
├── Cargo.toml          ← soroban-sdk = "${SOROBAN_SDK_MAJOR}"
├── README.md
├── .gitignore
└── ${CONTRACT_DIR}\\
    ├── Cargo.toml
    ├── Makefile
    └── src\\
        ├── lib.rs      ← AI writes this file
        └── test.rs     ← delete this file`;

interface Example {
  good: string;
  bad: string;
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/contract/prompt">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contract.prompt" });
  return { title: t("title"), description: t("lede") };
}

export default async function ContractPromptPage({
  params,
}: PageProps<"/[locale]/learn/contract/prompt">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PromptContent />;
}

function PromptContent() {
  const t = useTranslations("contract.prompt");
  const tCommon = useTranslations("common");
  const tModule = useTranslations("modules.contract");

  const traits = t.raw("idea.traits") as string[];
  const examples = t.raw("idea.examples") as Example[];

  return (
    <article>
      <LessonHeader
        eyebrow={`${tCommon("module")} 5 · ${tModule("title")}`}
        title={t("title")}
        lede={t("lede")}
      >
        <Callout kind="info" title={t("intro.title")} className="mt-6 max-w-[65ch]">
          {t("intro.body")}
        </Callout>
      </LessonHeader>

      <LessonSection title={t("init.title")} lede={t("init.lede")}>
        <GuideSteps namespace="contract.prompt.init.steps" steps={INIT_STEPS} />
        <CommandBlock code={TREE} caption={t("init.tree")} className="mt-4" />
      </LessonSection>

      <LessonSection title={t("idea.title")} lede={t("idea.lede")}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {traits.map((trait) => (
            <li key={trait} className="rounded-lg border border-border bg-card px-4 py-3 text-sm leading-relaxed text-pretty">
              {trait}
            </li>
          ))}
        </ul>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-2 border-b border-border bg-muted/50 text-xs font-semibold">
            <p className="px-4 py-2 text-success">{t("idea.goodLabel")}</p>
            <p className="border-l border-border px-4 py-2 text-destructive">{t("idea.badLabel")}</p>
          </div>
          {examples.map((example) => (
            <div key={example.good} className="grid grid-cols-2 border-b border-border text-sm last:border-b-0">
              <p className="px-4 py-3 leading-relaxed text-pretty">{example.good}</p>
              <p className="border-l border-border px-4 py-3 leading-relaxed text-muted-foreground text-pretty">
                {example.bad}
              </p>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection id="builder" title={t("builder.sectionTitle")} lede={t("builder.sectionLede")}>
        <PromptBuilder />
        <Callout kind="warning" title={t("builder.warning.title")} className="mt-4">
          {t("builder.warning.body")}
        </Callout>
      </LessonSection>

      <LessonSection title={t("paste.title")} lede={t("paste.lede")}>
        <GuideSteps namespace="contract.prompt.paste.steps" steps={PASTE_STEPS} start={4} />
      </LessonSection>

      <LessonFooter />
    </article>
  );
}
