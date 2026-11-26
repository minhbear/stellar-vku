"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Terminal } from "lucide-react";

import { FormField } from "@/components/contract/form-field";
import { PlatformSwitch, usePlatformVars } from "@/components/contract/platform-switch";
import { PromptOutput } from "@/components/contract/prompt-output";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildInvokePrompt, type InvokeTemplate } from "@/lib/contract/prompt";
import { createInvokePromptSchema, type InvokePromptValues } from "@/lib/schemas/contract-prompt";

/** Turns the pasted `-- --help` output into a prompt asking the AI for ready-to-run invoke commands. */
export function InvokePrompt() {
  const t = useTranslations("contract.invoke");
  const tErrors = useTranslations("contract.invoke.errors");
  const tCommon = useTranslations("common");

  const schema = useMemo(() => createInvokePromptSchema((key) => tErrors(key)), [tErrors]);
  const template = t.raw("template") as InvokeTemplate;
  const platform = usePlatformVars();
  const [prompt, setPrompt] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvokePromptValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { help: "", scenario: "", code: "" },
  });

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit((values) => setPrompt(buildInvokePrompt(template, values, platform)))}
        noValidate
        className="space-y-4 rounded-xl border border-border bg-background p-4"
      >
        <PlatformSwitch />
        <FormField id="invoke-help" label={t("fields.help.label")} hint={t("fields.help.hint")} error={errors.help?.message}>
          <Textarea
            id="invoke-help"
            rows={5}
            className="max-h-72 font-onchain text-[13px]"
            placeholder={t("fields.help.placeholder")}
            aria-invalid={Boolean(errors.help)}
            aria-describedby="invoke-help-hint invoke-help-error"
            {...register("help")}
          />
        </FormField>
        <FormField
          id="invoke-scenario"
          label={t("fields.scenario.label")}
          hint={t("fields.scenario.hint")}
          optional={tCommon("optional")}
          error={errors.scenario?.message}
        >
          <Textarea
            id="invoke-scenario"
            rows={2}
            aria-invalid={Boolean(errors.scenario)}
            aria-describedby="invoke-scenario-hint invoke-scenario-error"
            {...register("scenario")}
          />
        </FormField>
        <FormField
          id="invoke-code"
          label={t("fields.code.label")}
          hint={t("fields.code.hint")}
          optional={tCommon("optional")}
          error={errors.code?.message}
        >
          <Textarea
            id="invoke-code"
            rows={2}
            className="max-h-64 font-onchain text-[13px]"
            aria-invalid={Boolean(errors.code)}
            aria-describedby="invoke-code-hint invoke-code-error"
            {...register("code")}
          />
        </FormField>
        <Button type="submit" className="gap-2">
          <Terminal className="size-4" aria-hidden="true" />
          {t("submit")}
        </Button>
      </form>

      {prompt ? <PromptOutput value={prompt} title={t("output.title")} hint={t("output.hint")} /> : null}
    </div>
  );
}
