"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock } from "lucide-react";

import { Callout } from "@/components/learn/lesson-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  createTokenFormSchema,
  tokenFormDefaults,
  type IssueMode,
  type TokenFormParsed,
  type TokenFormValues,
} from "@/lib/schemas/token";
import { MAX_AMOUNT_DISPLAY } from "@/lib/stellar/format";

interface TokenFormProps {
  mode: IssueMode;
  initialValues?: TokenFormParsed | null;
  onBack: () => void;
  onSubmit: (values: TokenFormParsed) => void;
}

export function TokenForm({ mode, initialValues, onBack, onSubmit }: TokenFormProps) {
  const t = useTranslations("issue.form");
  const tErrors = useTranslations("issue.form.errors");
  const tCommon = useTranslations("common");

  // Recreated when the locale changes so validation messages follow the UI.
  const schema = useMemo(() => createTokenFormSchema((key) => tErrors(key)), [tErrors]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TokenFormValues, unknown, TokenFormParsed>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { ...tokenFormDefaults, ...(initialValues ?? {}), mode },
  });

  // `useWatch` returns plain values (unlike `watch`, which hands back a function
  // the React Compiler refuses to memoize).
  const authRequired = useWatch({ control, name: "authRequired" });
  const authRevocable = useWatch({ control, name: "authRevocable" });
  const clawbackEnabled = useWatch({ control, name: "clawbackEnabled" });
  const lockIssuer = useWatch({ control, name: "lockIssuer" });

  const flags = [
    { name: "authRequired" as const, checked: Boolean(authRequired), disabled: false },
    { name: "authRevocable" as const, checked: Boolean(authRevocable), disabled: false },
    {
      name: "clawbackEnabled" as const,
      checked: Boolean(clawbackEnabled),
      disabled: !authRevocable,
    },
    { name: "lockIssuer" as const, checked: Boolean(lockIssuer), disabled: false },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <input type="hidden" {...register("mode")} value={mode} readOnly />

      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">{t("lede")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("sectionBasics")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field
            id="code"
            label={t("fields.code.label")}
            hint={t("fields.code.hint")}
            error={errors.code?.message}
          >
            <Input
              id="code"
              autoComplete="off"
              spellCheck={false}
              placeholder={t("fields.code.placeholder")}
              className="font-onchain uppercase"
              aria-invalid={Boolean(errors.code)}
              aria-describedby="code-hint code-error"
              {...register("code", {
                setValueAs: (value: string) => value.trim().toUpperCase(),
              })}
            />
          </Field>

          <Field
            id="name"
            label={t("fields.name.label")}
            hint={t("fields.name.hint")}
            error={errors.name?.message}
          >
            <Input
              id="name"
              autoComplete="off"
              placeholder={t("fields.name.placeholder")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby="name-hint name-error"
              {...register("name")}
            />
          </Field>

          <Field
            id="description"
            label={t("fields.description.label")}
            hint={t("fields.description.hint")}
            error={errors.description?.message}
            className="sm:col-span-2"
          >
            <Input
              id="description"
              autoComplete="off"
              placeholder={t("fields.description.placeholder")}
              aria-invalid={Boolean(errors.description)}
              aria-describedby="description-hint description-error"
              {...register("description")}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("sectionSupply")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field
            id="supply"
            label={t("fields.supply.label")}
            hint={t("fields.supply.hint", { max: MAX_AMOUNT_DISPLAY })}
            error={errors.supply?.message}
          >
            <Input
              id="supply"
              inputMode="decimal"
              autoComplete="off"
              placeholder={t("fields.supply.placeholder")}
              className="font-onchain"
              aria-invalid={Boolean(errors.supply)}
              aria-describedby="supply-hint supply-error"
              {...register("supply")}
            />
          </Field>

          <Field
            id="homeDomain"
            label={t("fields.homeDomain.label")}
            hint={t("fields.homeDomain.hint")}
            error={errors.homeDomain?.message}
          >
            <Input
              id="homeDomain"
              autoComplete="off"
              spellCheck={false}
              placeholder={t("fields.homeDomain.placeholder")}
              className="font-onchain"
              aria-invalid={Boolean(errors.homeDomain)}
              aria-describedby="homeDomain-hint homeDomain-error"
              {...register("homeDomain")}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("sectionAdvanced")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("advancedHint")}</p>
        </CardHeader>
        <CardContent className="space-y-1">
          {flags.map(({ name, checked, disabled }) => (
            <div
              key={name}
              className={cn(
                "flex items-start gap-4 rounded-lg px-3 py-3 transition-colors",
                disabled ? "opacity-50" : "hover:bg-muted/50",
              )}
            >
              <Switch
                id={name}
                checked={checked}
                disabled={disabled}
                onCheckedChange={(checked) => {
                  setValue(name, checked, { shouldValidate: true });
                  // Clawback is only valid on a revocable asset, so turning
                  // revocable off has to turn clawback off with it.
                  if (name === "authRevocable" && !checked && clawbackEnabled) {
                    setValue("clawbackEnabled", false, { shouldValidate: true });
                  }
                }}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <Label htmlFor={name} className="text-sm font-medium">
                  {t(`fields.${name}.label`)}
                </Label>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">
                  {t(`fields.${name}.hint`)}
                </p>
                {errors[name]?.message ? (
                  <p className="mt-1 text-xs text-destructive">{errors[name]?.message}</p>
                ) : null}
              </div>
            </div>
          ))}

          {lockIssuer ? (
            <Callout kind="warning" title={t("lockWarning.title")} className="mt-3">
              <span className="flex items-start gap-2">
                <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {t("lockWarning.body")}
              </span>
            </Callout>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          {tCommon("previous")}
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {t("submit")}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
