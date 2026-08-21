"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import {
  getServerSnapshot,
  getSnapshot,
  setCompleted,
  subscribe,
} from "@/components/learn/progress-store";

interface ProgressState {
  /** Lesson hrefs the student has ticked off. */
  completed: readonly string[];
  isDone: (href: string) => boolean;
  toggle: (href: string) => void;
  reset: () => void;
}

export function useProgress(): ProgressState {
  const completed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(
    (href: string) => {
      const current = getSnapshot();
      setCompleted(
        current.includes(href)
          ? current.filter((item) => item !== href)
          : [...current, href],
      );
    },
    [],
  );

  return useMemo(
    () => ({
      completed,
      isDone: (href) => completed.includes(href),
      toggle,
      reset: () => setCompleted([]),
    }),
    [completed, toggle],
  );
}
