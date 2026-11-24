"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bug } from "lucide-react";

import { FormField } from "@/components/contract/form-field";
import { PromptOutput } from "@/components/contract/prompt-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildFixPrompt, type FixTemplate } from "@/lib/contract/prompt";
import { SOROBAN_SDK_MAJOR } from "@/lib/contract/toolchain";
import { createFixErrorSchema, type FixErrorValues } from "@/lib/schemas/contract-prompt";

/** Turns a pasted terminal error into a prompt that asks the AI for a whole fixed file. */
export function FixErrorPrompt() {
  const t = useTranslations("contract.fix");
  const tErrors = useTranslations("contract.fix.errors");
  const tCommon = useTranslations("common");

  const schema = useMemo(() => createFixErrorSchema((key) => tErrors(key)), [tErrors]);
  const template = t.raw("template") as FixTemplate;
  const [prompt, setPrompt] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FixErrorValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { command: "", error: "", code: "" },
  });

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit((values) => setPrompt(buildFixPrompt(template, values, SOROBAN_SDK_MAJOR)))}
        noValidate
        className="space-y-4 rounded-xl border border-border bg-card p-5"
      >
        <FormField
          id="fix-command"
          label={t("fields.command.label")}
          hint={t("fields.command.hint")}
          optional={tCommon("optional")}
          error={errors.command?.message}
        >
          <Input
            id="fix-command"
            autoComplete="off"
            className="font-onchain"
            placeholder="stellar contract build"
            aria-invalid={Boolean(errors.command)}
            aria-describedby="fix-command-hint fix-command-error"
            {...register("command")}
          />
        </FormField>
        <FormField
          id="fix-error"
          label={t("fields.error.label")}
          hint={t("fields.error.hint")}
          error={errors.error?.message}
        >
          <Textarea
            id="fix-error"
            rows={4}
            className="font-onchain text-[13px]"
            aria-invalid={Boolean(errors.error)}
            aria-describedby="fix-error-hint fix-error-error"
            {...register("error")}
          />
        </FormField>
        <FormField
          id="fix-code"
          label={t("fields.code.label")}
          hint={t("fields.code.hint")}
          optional={tCommon("optional")}
          error={errors.code?.message}
        >
          <Textarea
            id="fix-code"
            rows={3}
            className="max-h-64 font-onchain text-[13px]"
            aria-invalid={Boolean(errors.code)}
            aria-describedby="fix-code-hint fix-code-error"
            {...register("code")}
          />
        </FormField>
        <Button type="submit" variant="secondary" className="gap-2">
          <Bug className="size-4" aria-hidden="true" />
          {t("submit")}
        </Button>
      </form>

      {prompt ? <PromptOutput value={prompt} title={t("output.title")} hint={t("output.hint")} /> : null}
    </div>
  );
}
