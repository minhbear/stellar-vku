import { z } from "zod";

type Translate = (key: string, values?: Record<string, string | number>) => string;

/** `29`, `29.1` or `29.1.0`: whatever the student reads off `Cargo.toml`. */
const SDK_VERSION_RE = /^\d{1,3}(\.\d{1,3}){0,2}$/;

export function createContractPromptSchema(t: Translate) {
  return z.object({
    projectName: z.string().trim().min(2, t("projectName.required")).max(60, t("projectName.tooLong")),
    problem: z.string().trim().min(20, t("problem.tooShort")).max(800, t("problem.tooLong")),
    users: z.string().trim().min(5, t("users.required")).max(400, t("users.tooLong")),
    features: z
      .string()
      .trim()
      .min(10, t("features.required"))
      .max(1200, t("features.tooLong"))
      .refine((v) => featureLines(v).length >= 2, t("features.tooFew"))
      .refine((v) => featureLines(v).length <= 8, t("features.tooMany")),
    data: z.string().trim().max(600, t("data.tooLong")),
    rules: z.string().trim().max(600, t("rules.tooLong")),
    sdkVersion: z.string().trim().regex(SDK_VERSION_RE, t("sdkVersion.format")),
  });
}

export type ContractPromptValues = z.infer<ReturnType<typeof createContractPromptSchema>>;

export function createFixErrorSchema(t: Translate) {
  return z.object({
    command: z.string().trim().max(400, t("command.tooLong")),
    error: z.string().trim().min(10, t("error.required")).max(8000, t("error.tooLong")),
    code: z.string().trim().max(30000, t("code.tooLong")),
  });
}

export type FixErrorValues = z.infer<ReturnType<typeof createFixErrorSchema>>;

/** One feature per line; bullets and numbering the student typed are dropped. */
export function featureLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•+]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}
