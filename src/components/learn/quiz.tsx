"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export function Quiz() {
  const t = useTranslations("overview.quiz");
  const questions = t.raw("questions") as QuizQuestion[];

  // `undefined` = unanswered. Answers are intentionally not persisted: this is a
  // self-check during the lecture, not an assessment.
  const [picked, setPicked] = useState<Record<number, number | undefined>>({});
  const answered = Object.values(picked).filter((value) => value !== undefined).length;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t("lede")}</p>
        </div>
        {answered > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setPicked({})}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {t("reset")}
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="font-onchain text-xs text-muted-foreground">
            {t("progress", { done: answered, total: questions.length })}
          </p>
          <Progress value={(answered / questions.length) * 100} className="h-1.5" />
        </div>

        <ol className="space-y-6">
          {questions.map((item, questionIndex) => {
            const selection = picked[questionIndex];
            const isAnswered = selection !== undefined;
            const isCorrect = selection === item.answer;

            return (
              <li key={item.question} className="space-y-3">
                <p className="flex gap-2.5 text-sm font-medium">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-onchain text-[11px] text-muted-foreground">
                    {questionIndex + 1}
                  </span>
                  <span className="text-pretty">{item.question}</span>
                </p>

                <div className="ml-7.5 grid gap-1.5">
                  {item.options.map((option, optionIndex) => {
                    const chosen = selection === optionIndex;
                    const revealCorrect = isAnswered && optionIndex === item.answer;
                    const revealWrong = chosen && !isCorrect;

                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={isAnswered}
                        onClick={() =>
                          setPicked((current) => ({ ...current, [questionIndex]: optionIndex }))
                        }
                        aria-pressed={chosen}
                        className={cn(
                          "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                          !isAnswered &&
                            "border-border hover:border-primary/40 hover:bg-accent",
                          revealCorrect && "border-success/50 bg-success/10",
                          revealWrong && "border-destructive/50 bg-destructive/10",
                          isAnswered && !revealCorrect && !revealWrong && "border-border opacity-55",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border text-[10px]",
                            revealCorrect && "border-success bg-success text-success-foreground",
                            revealWrong && "border-destructive bg-destructive text-destructive-foreground",
                            !revealCorrect && !revealWrong && "border-muted-foreground/40",
                          )}
                        >
                          {revealCorrect ? (
                            <Check className="size-2.5" aria-hidden="true" />
                          ) : revealWrong ? (
                            <X className="size-2.5" aria-hidden="true" />
                          ) : (
                            String.fromCharCode(65 + optionIndex)
                          )}
                        </span>
                        <span className="text-pretty">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {isAnswered ? (
                  <div
                    className={cn(
                      "animate-rise ml-7.5 rounded-lg border p-3 text-sm leading-relaxed text-pretty",
                      isCorrect
                        ? "border-success/30 bg-success/8"
                        : "border-border bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mb-1 block text-xs font-semibold",
                        isCorrect ? "text-success" : "text-muted-foreground",
                      )}
                    >
                      {isCorrect ? t("correct") : t("incorrect")}
                    </span>
                    <span className="text-muted-foreground">{item.explanation}</span>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
