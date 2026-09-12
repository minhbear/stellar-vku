"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ExternalLink, Eye, HelpCircle, X } from "lucide-react";

import { OnChainValue } from "@/components/stellar/on-chain-value";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { isCorrect, type CaseDef, type CaseQuestion } from "@/lib/forensics/cases";
import { cn } from "@/lib/utils";

type Status = "idle" | "wrong" | "correct" | "revealed";

interface QuestionState {
  input: string;
  status: Status;
  attempts: number;
  hint: boolean;
}

const EMPTY: QuestionState = { input: "", status: "idle", attempts: 0, hint: false };

export interface InvestigationProgress {
  solved: number;
  revealed: number;
  total: number;
  done: boolean;
}

/**
 * The puzzle board. Answers are checked in the browser against the seeded case
 * data — this is a workshop self-check, not an exam, so a student who opens
 * devtools can read them. The point is the hunt through the explorer.
 */
export function Investigation({
  caseDef,
  namespace,
  onProgress,
}: {
  caseDef: CaseDef;
  namespace: string;
  onProgress?: (progress: InvestigationProgress) => void;
}) {
  const t = useTranslations(namespace);
  const tUi = useTranslations("forensics.ui");
  const [state, setState] = useState<Record<string, QuestionState>>({});

  const questions = caseDef.questions;
  const progress = useMemo(() => {
    const values = questions.map((q) => state[q.id]?.status ?? "idle");
    const solved = values.filter((s) => s === "correct").length;
    const revealed = values.filter((s) => s === "revealed").length;
    return { solved, revealed, total: questions.length, done: solved + revealed === questions.length };
  }, [questions, state]);

  // Through a ref so the parent does not have to memoise the callback just to
  // keep this effect from re-firing on every render.
  const report = useRef(onProgress);
  useEffect(() => {
    report.current = onProgress;
  }, [onProgress]);

  const { solved, revealed, total, done } = progress;
  useEffect(() => {
    report.current?.({ solved, revealed, total, done });
  }, [solved, revealed, total, done]);

  function update(id: string, patch: Partial<QuestionState>) {
    setState((current) => ({ ...current, [id]: { ...EMPTY, ...current[id], ...patch } }));
  }

  function check(question: CaseQuestion, value: string) {
    const current = state[question.id] ?? EMPTY;
    if (isCorrect(question, value)) {
      update(question.id, { input: value, status: "correct" });
      return;
    }
    update(question.id, {
      input: value,
      status: "wrong",
      attempts: current.attempts + 1,
      // Two misses is where a nudge stops being a spoiler and starts being help.
      hint: current.hint || current.attempts + 1 >= 2,
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-muted/25 p-3 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold">{t("questionsTitle")}</p>
        <p className="font-onchain text-xs text-muted-foreground">
          {tUi("solvedOf", { solved: progress.solved, total: progress.total })}
        </p>
      </div>
      <Progress
        value={((progress.solved + progress.revealed) / progress.total) * 100}
        className="mt-2 h-1.5"
      />

      <ol className="mt-5 space-y-3">
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            index={index}
            question={question}
            state={state[question.id] ?? EMPTY}
            namespace={namespace}
            onInput={(value) => update(question.id, { input: value, status: "idle" })}
            onCheck={(value) => check(question, value)}
            onToggleHint={() =>
              update(question.id, { hint: !(state[question.id] ?? EMPTY).hint })
            }
            onReveal={() =>
              update(question.id, { input: question.answer, status: "revealed" })
            }
          />
        ))}
      </ol>
    </div>
  );
}

function QuestionCard({
  index,
  question,
  state,
  namespace,
  onInput,
  onCheck,
  onToggleHint,
  onReveal,
}: {
  index: number;
  question: CaseQuestion;
  state: QuestionState;
  namespace: string;
  onInput: (value: string) => void;
  onCheck: (value: string) => void;
  onToggleHint: () => void;
  onReveal: () => void;
}) {
  const t = useTranslations(`${namespace}.questions.${question.id}`);
  const tUi = useTranslations("forensics.ui");
  const settled = state.status === "correct" || state.status === "revealed";
  const options = question.kind === "choice" ? (t.raw("options") as string[]) : null;

  return (
    <li
      className={cn(
        "rounded-xl border bg-card p-4 transition-colors",
        state.status === "correct" && "border-success/45 bg-success/6",
        state.status === "revealed" && "border-border bg-muted/40",
        state.status === "wrong" && "border-destructive/40",
        state.status === "idle" && "border-border",
      )}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border font-onchain text-[11px]",
            state.status === "correct"
              ? "border-success bg-success text-success-foreground"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          {state.status === "correct" ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            index + 1
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm leading-relaxed font-medium text-pretty">
            {t("prompt", question.vars)}
            {question.bonus ? (
              <span className="ml-2 inline-block rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 align-middle text-[10px] font-semibold tracking-wide whitespace-nowrap text-brand uppercase">
                {tUi("bonus")}
              </span>
            ) : null}
          </p>

          {options ? (
            <div className="grid gap-1.5">
              {options.map((option, optionIndex) => {
                const chosen = state.input === String(optionIndex);
                const isAnswer = String(optionIndex) === question.answer;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={settled}
                    onClick={() => onCheck(String(optionIndex))}
                    aria-pressed={chosen}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      !settled && "border-border hover:border-primary/40 hover:bg-accent",
                      settled && isAnswer && "border-success/50 bg-success/10",
                      settled && !isAnswer && "border-border opacity-55",
                      !settled && chosen && state.status === "wrong" && "border-destructive/50",
                    )}
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/40 text-[10px]">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="text-pretty">{option}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                onCheck(state.input);
              }}
            >
              <Input
                value={state.input}
                onChange={(event) => onInput(event.target.value)}
                disabled={settled}
                spellCheck={false}
                autoComplete="off"
                placeholder={tUi(`placeholder.${question.kind}`)}
                aria-label={t("prompt", question.vars)}
                className="min-w-0 flex-1 font-onchain text-xs"
              />
              <Button type="submit" disabled={settled || !state.input.trim()}>
                {tUi("check")}
              </Button>
            </form>
          )}

          {state.status === "wrong" ? (
            <p className="animate-rise flex items-center gap-1.5 text-xs font-medium text-destructive">
              <X className="size-3.5" aria-hidden="true" />
              {tUi("wrong")}
            </p>
          ) : null}

          {settled ? (
            <div className="animate-rise space-y-2 rounded-lg border border-border bg-muted/40 p-3">
              {state.status === "revealed" ? (
                <p className="text-xs font-semibold text-muted-foreground">
                  {tUi("revealed")}
                </p>
              ) : (
                <p className="text-xs font-semibold text-success">{tUi("correct")}</p>
              )}
              {question.kind === "address" ? (
                <OnChainValue value={question.answer} kind="account" full />
              ) : question.kind === "number" || question.kind === "text" ? (
                <p className="font-onchain text-xs break-all">{question.answer}</p>
              ) : null}
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {t("explain", question.vars)}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={onToggleHint}
              >
                <HelpCircle className="size-3.5" aria-hidden="true" />
                {state.hint ? tUi("hideHint") : tUi("showHint")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={onReveal}
              >
                <Eye className="size-3.5" aria-hidden="true" />
                {tUi("reveal")}
              </Button>
            </div>
          )}

          {state.hint && !settled ? (
            <div className="animate-rise space-y-2 rounded-lg border border-info/30 bg-info/8 p-3">
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {t("hint")}
              </p>
              {question.link ? (
                <a
                  href={question.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-info underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {tUi("openPage")}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
