import { z } from "zod";

import { MAX_STROOPS, toStroops } from "@/lib/stellar/format";

export type IssueMode = "classic" | "sac";

/**
 * Translator shape the schema needs. Passing `t` in keeps a single schema
 * definition while letting the messages come from the active locale.
 */
type Translate = (key: string, values?: Record<string, string | number>) => string;

const ASSET_CODE_RE = /^[A-Za-z0-9]{1,12}$/;
const HOME_DOMAIN_RE = /^([a-z0-9-]+\.)+[a-z]{2,}$/i;

export function createTokenFormSchema(t: Translate) {
  return z
    .object({
      mode: z.enum(["classic", "sac"]),

      code: z
        .string()
        .trim()
        .min(1, t("code.required"))
        .max(12, t("code.tooLong"))
        .regex(ASSET_CODE_RE, t("code.charset"))
        .refine((v) => v.toUpperCase() !== "XLM", t("code.reservedXlm")),

      name: z.string().trim().min(2, t("name.required")).max(40, t("name.tooLong")),

      description: z.string().trim().max(160, t("description.tooLong")).optional(),

      supply: z
        .string()
        .trim()
        .min(1, t("supply.required"))
        .refine((v) => /^\d+(\.\d+)?$/.test(v.replace(/,/g, "")), t("supply.numeric"))
        .refine((v) => {
          const fraction = v.replace(/,/g, "").split(".")[1];
          return !fraction || fraction.length <= 7;
        }, t("supply.decimals"))
        .refine((v) => {
          try {
            const stroops = toStroops(v);
            return stroops > 0n && stroops <= MAX_STROOPS;
          } catch {
            return false;
          }
        }, t("supply.range")),

      homeDomain: z
        .string()
        .trim()
        .max(32, t("homeDomain.tooLong"))
        .refine((v) => v === "" || HOME_DOMAIN_RE.test(v), t("homeDomain.invalid"))
        .optional()
        .default(""),

      authRequired: z.boolean().default(false),
      authRevocable: z.boolean().default(false),
      clawbackEnabled: z.boolean().default(false),
      lockIssuer: z.boolean().default(false),
    })
    .refine((data) => !data.clawbackEnabled || data.authRevocable, {
      // Protocol rule: clawback can only be enabled on a revocable asset.
      path: ["clawbackEnabled"],
      message: t("flags.clawbackNeedsRevocable"),
    });
}

export type TokenFormValues = z.input<ReturnType<typeof createTokenFormSchema>>;
export type TokenFormParsed = z.output<ReturnType<typeof createTokenFormSchema>>;

export const tokenFormDefaults: TokenFormValues = {
  mode: "classic",
  code: "",
  name: "",
  description: "",
  supply: "1000000",
  homeDomain: "",
  authRequired: false,
  authRevocable: false,
  clawbackEnabled: false,
  lockIssuer: false,
};
