"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, PartyPopper } from "lucide-react";

import { Debrief } from "@/components/forensics/debrief";
import { EvidenceCard } from "@/components/forensics/evidence-card";
import {
  Investigation,
  type InvestigationProgress,
} from "@/components/forensics/investigation";
import type { Scene } from "@/components/forensics/scene";
import { LessonSection } from "@/components/learn/lesson-shell";
import { Button } from "@/components/ui/button";
import type { CaseDef } from "@/lib/forensics/cases";

/**
 * Evidence → hunt → debrief, in that order. The debrief stays shut until the
 * case is closed, because reading it first turns the hunt into a transcript —
 * but a lecturer can open it at any time to walk the room through the answers.
 */
export function CaseWorkspace({
  caseDef,
  scene,
  namespace,
  values,
  links,
  homework = false,
}: {
  caseDef: CaseDef;
  scene: Scene;
  /** e.g. `forensics.case1`. */
  namespace: string;
  values?: Record<string, string>;
  links?: Record<string, string>;
  /** Homework is solved alone, so the locked panel says so a little louder. */
  homework?: boolean;
}) {
  const t = useTranslations(namespace);
  const tUi = useTranslations("forensics.ui");
  const [progress, setProgress] = useState<InvestigationProgress | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const solvedItAll = progress?.done ?? false;
  const open = unlocked || solvedItAll;

  return (
    <>
      <LessonSection title={t("briefTitle")} lede={t("briefLede")}>
        <div className="space-y-4">
          <EvidenceCard
            kind={caseDef.evidence.kind}
            value={caseDef.evidence.value}
            namespace={namespace}
          />
          <Investigation
            caseDef={caseDef}
            namespace={namespace}
            onProgress={setProgress}
          />
        </div>
      </LessonSection>

      <LessonSection id="debrief" title={t("debrief.title")} lede={t("debrief.lede")}>
        {open ? (
          <div className="space-y-4">
            {solvedItAll ? (
              <p className="animate-rise flex items-center gap-2 rounded-xl border border-success/30 bg-success/8 px-4 py-3 text-sm font-medium text-success">
                <PartyPopper className="size-4 shrink-0" aria-hidden="true" />
                {tUi("caseClosed", {
                  solved: progress?.solved ?? 0,
                  total: progress?.total ?? caseDef.questions.length,
                })}
              </p>
            ) : null}
            <Debrief
              scene={scene}
              namespace={namespace}
              values={values}
              links={links}
            />
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border bg-muted/25 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="max-w-[55ch] text-sm leading-relaxed text-muted-foreground text-pretty">
                {tUi(homework ? "lockedHomework" : "locked", {
                  solved: (progress?.solved ?? 0) + (progress?.revealed ?? 0),
                  total: progress?.total ?? caseDef.questions.length,
                })}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setUnlocked(true)}
            >
              {tUi("unlock")}
            </Button>
          </div>
        )}
      </LessonSection>
    </>
  );
}
