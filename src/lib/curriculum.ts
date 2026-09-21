/**
 * Single source of truth for the course structure. The sidebar, the prev/next
 * footer and the home page all read from here, so adding a module means editing
 * this file plus the matching messages under `modules.*`.
 */

export type LessonIcon =
  | "concepts"
  | "stablecoin"
  | "issue"
  | "trace"
  | "hunt"
  | "homework"
  | "remit"
  | "lending";

export interface LessonDef {
  id: string;
  /** Empty string means the module's index route. */
  slug: string;
  icon: LessonIcon;
  /** Rendered in the sidebar so students know what is interactive. */
  kind: "reading" | "walkthrough" | "hands-on" | "investigation";
  /** Estimated minutes. Not translated — it is a number, not copy. */
  minutes: number;
}

export interface ModuleDef {
  id: string;
  slug: string;
  order: number;
  lessons: LessonDef[];
}

export const MODULES: ModuleDef[] = [
  {
    id: "tokenization",
    slug: "tokenization",
    order: 1,
    lessons: [
      { id: "overview", slug: "", icon: "concepts", kind: "reading", minutes: 12 },
      {
        id: "stablecoin",
        slug: "stablecoin",
        icon: "stablecoin",
        kind: "walkthrough",
        minutes: 15,
      },
      { id: "issue", slug: "issue-token", icon: "issue", kind: "hands-on", minutes: 20 },
    ],
  },
  {
    id: "forensics",
    slug: "forensics",
    order: 2,
    lessons: [
      { id: "wallet", slug: "", icon: "trace", kind: "investigation", minutes: 25 },
      { id: "airdrop", slug: "airdrop", icon: "hunt", kind: "investigation", minutes: 35 },
      {
        id: "frozen",
        slug: "frozen-wallet",
        icon: "homework",
        kind: "investigation",
        minutes: 35,
      },
    ],
  },
  {
    id: "finance",
    slug: "finance",
    order: 3,
    lessons: [
      { id: "payments", slug: "", icon: "remit", kind: "walkthrough", minutes: 30 },
      { id: "lending", slug: "lending", icon: "lending", kind: "walkthrough", minutes: 30 },
    ],
  },
];

export interface FlatLesson {
  moduleId: string;
  moduleSlug: string;
  lesson: LessonDef;
  href: string;
  /** `modules.<module>.lessons.<lesson>` — prefix for every label lookup. */
  messageKey: string;
}

export function lessonHref(moduleSlug: string, lessonSlug: string): string {
  return lessonSlug ? `/learn/${moduleSlug}/${lessonSlug}` : `/learn/${moduleSlug}`;
}

export const FLAT_LESSONS: FlatLesson[] = MODULES.flatMap((module) =>
  module.lessons.map((lesson) => ({
    moduleId: module.id,
    moduleSlug: module.slug,
    lesson,
    href: lessonHref(module.slug, lesson.slug),
    messageKey: `modules.${module.id}.lessons.${lesson.id}`,
  })),
);

export const TOTAL_LESSONS = FLAT_LESSONS.length;

export function findLesson(href: string): FlatLesson | undefined {
  return FLAT_LESSONS.find((entry) => entry.href === href);
}

export function lessonNeighbours(href: string): {
  index: number;
  previous?: FlatLesson;
  next?: FlatLesson;
} {
  const index = FLAT_LESSONS.findIndex((entry) => entry.href === href);
  if (index === -1) return { index };
  return {
    index,
    previous: FLAT_LESSONS[index - 1],
    next: FLAT_LESSONS[index + 1],
  };
}
