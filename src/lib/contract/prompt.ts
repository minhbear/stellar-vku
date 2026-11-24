import {
  featureLines,
  type ContractPromptValues,
  type FixErrorValues,
  type InvokePromptValues,
} from "@/lib/schemas/contract-prompt";
import { CONTRACT_ALIAS, CONTRACT_DIR, IDENTITY } from "@/lib/contract/toolchain";

/**
 * The prompt text comes from the message files through `t.raw`, so it can hold
 * Rust syntax (`#[cfg(test)]`, braces) that ICU formatting would choke on.
 * Placeholders are `{{name}}`, filled here.
 */
export interface PromptTemplate {
  intro: string;
  projectHeading: string;
  fields: Record<"projectName" | "problem" | "users" | "features" | "data" | "rules", string>;
  fallbackData: string;
  fallbackRules: string;
  rulesHeading: string;
  rules: string[];
  answerHeading: string;
  answer: string[];
}

export interface FixTemplate {
  intro: string;
  commandLine: string;
  errorLine: string;
  codeLine: string;
  ask: string[];
}

export interface InvokeTemplate {
  intro: string;
  helpLine: string;
  scenarioLine: string;
  codeLine: string;
  ask: string[];
}

function fill(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
}

const SHARED = {
  dir: CONTRACT_DIR.replaceAll("\\", "/"),
  alias: CONTRACT_ALIAS,
  identity: IDENTITY,
};

export function buildContractPrompt(template: PromptTemplate, values: ContractPromptValues): string {
  const vars = { ...SHARED, sdk: values.sdkVersion };
  const features = featureLines(values.features)
    .map((line) => `- ${line}`)
    .join("\n");

  const project = [
    `${template.fields.projectName}: ${values.projectName}`,
    `${template.fields.problem}: ${values.problem}`,
    `${template.fields.users}: ${values.users}`,
    `${template.fields.features}:\n${features}`,
    `${template.fields.data}: ${values.data || template.fallbackData}`,
    `${template.fields.rules}: ${values.rules || template.fallbackRules}`,
  ].join("\n");

  return [
    fill(template.intro, vars),
    `## ${template.projectHeading}\n${project}`,
    `## ${template.rulesHeading}\n${numbered(template.rules, vars)}`,
    `## ${template.answerHeading}\n${numbered(template.answer, vars)}`,
  ].join("\n\n");
}

export function buildFixPrompt(template: FixTemplate, values: FixErrorValues, sdk: string): string {
  const vars = { ...SHARED, sdk };
  const parts = [fill(template.intro, vars)];
  if (values.command) parts.push(`${template.commandLine}\n${values.command}`);
  parts.push(`${template.errorLine}\n\`\`\`\n${values.error}\n\`\`\``);
  if (values.code) parts.push(`${template.codeLine}\n\`\`\`rust\n${values.code}\n\`\`\``);
  parts.push(numbered(template.ask, vars));
  return parts.join("\n\n");
}

export function buildInvokePrompt(template: InvokeTemplate, values: InvokePromptValues): string {
  const parts = [fill(template.intro, SHARED)];
  parts.push(`${template.helpLine}\n\`\`\`\n${values.help}\n\`\`\``);
  if (values.scenario) parts.push(`${template.scenarioLine}\n${values.scenario}`);
  if (values.code) parts.push(`${template.codeLine}\n\`\`\`rust\n${values.code}\n\`\`\``);
  parts.push(numbered(template.ask, SHARED));
  return parts.join("\n\n");
}

function numbered(lines: string[], vars: Record<string, string>): string {
  return lines.map((line, index) => `${index + 1}. ${fill(line, vars)}`).join("\n");
}
