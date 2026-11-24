"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";

import { FormField } from "@/components/contract/form-field";
import { PromptOutput } from "@/components/contract/prompt-output";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildContractPrompt, type PromptTemplate } from "@/lib/contract/prompt";
import { SOROBAN_SDK_MAJOR } from "@/lib/contract/toolchain";
import {
  createContractPromptSchema,
  type ContractPromptValues,
} from "@/lib/schemas/contract-prompt";

export interface IdeaPreset {
  projectName: string;
  summary: string;
  problem: string;
  users: string;
  features: string[];
  data: string;
  rules: string;
}

const EMPTY: ContractPromptValues = {
  projectName: "",
  problem: "",
  users: "",
  features: "",
  data: "",
  rules: "",
  sdkVersion: SOROBAN_SDK_MAJOR,
};

type FieldName = Exclude<keyof ContractPromptValues, "sdkVersion">;

const TEXT_FIELDS: { name: FieldName; rows: number; optional?: boolean }[] = [
  { name: "problem", rows: 3 },
  { name: "users", rows: 2 },
  { name: "features", rows: 5 },
  { name: "data", rows: 2, optional: true },
  { name: "rules", rows: 2, optional: true },
];

export function PromptBuilder() {
  const t = useTranslations("contract.prompt.builder");
  const tErrors = useTranslations("contract.prompt.builder.errors");
  const tCommon = useTranslations("common");
  const tIdeas = useTranslations("contract.prompt.ideas");

  const schema = useMemo(() => createContractPromptSchema((key) => tErrors(key)), [tErrors]);
  const ideas = tIdeas.raw("items") as IdeaPreset[];
  const template = t.raw("template") as PromptTemplate;

  const [prompt, setPrompt] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ContractPromptValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: EMPTY,
  });

  function applyIdea(idea: IdeaPreset) {
    reset({
      projectName: idea.projectName,
      problem: idea.problem,
      users: idea.users,
      features: idea.features.join("\n"),
      data: idea.data,
      rules: idea.rules,
      sdkVersion: getValues("sdkVersion") || SOROBAN_SDK_MAJOR,
    });
    setPrompt(null);
  }

  function onSubmit(values: ContractPromptValues) {
    setPrompt(buildContractPrompt(template, values));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium">{tIdeas("pick")}</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {ideas.map((idea) => (
            <li key={idea.projectName}>
              <button
                type="button"
                onClick={() => applyIdea(idea)}
                className="flex h-full w-full flex-col items-start gap-0.5 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="text-sm font-medium">{idea.projectName}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">{idea.summary}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("title")}</CardTitle>
            <p className="max-w-[65ch] text-sm text-muted-foreground">{t("lede")}</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
              <FormField
                id="projectName"
                label={t("fields.projectName.label")}
                hint={t("fields.projectName.hint")}
                error={errors.projectName?.message}
              >
                <Input
                  id="projectName"
                  autoComplete="off"
                  placeholder={t("fields.projectName.placeholder")}
                  aria-invalid={Boolean(errors.projectName)}
                  aria-describedby="projectName-hint projectName-error"
                  {...register("projectName")}
                />
              </FormField>
              <FormField
                id="sdkVersion"
                label={t("fields.sdkVersion.label")}
                hint={t("fields.sdkVersion.hint")}
                error={errors.sdkVersion?.message}
              >
                <Input
                  id="sdkVersion"
                  inputMode="decimal"
                  autoComplete="off"
                  className="font-onchain"
                  aria-invalid={Boolean(errors.sdkVersion)}
                  aria-describedby="sdkVersion-hint sdkVersion-error"
                  {...register("sdkVersion")}
                />
              </FormField>
            </div>

            {TEXT_FIELDS.map((field) => (
              <FormField
                key={field.name}
                id={field.name}
                label={t(`fields.${field.name}.label`)}
                hint={t(`fields.${field.name}.hint`)}
                optional={field.optional ? tCommon("optional") : undefined}
                error={errors[field.name]?.message}
              >
                <Textarea
                  id={field.name}
                  rows={field.rows}
                  placeholder={t(`fields.${field.name}.placeholder`)}
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={`${field.name}-hint ${field.name}-error`}
                  {...register(field.name)}
                />
              </FormField>
            ))}

            <Button type="submit" className="gap-2">
              <Sparkles className="size-4" aria-hidden="true" />
              {t("submit")}
            </Button>
          </CardContent>
        </Card>
      </form>

      {prompt ? <PromptOutput value={prompt} title={t("output.title")} hint={t("output.hint")} /> : null}
    </div>
  );
}
