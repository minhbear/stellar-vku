"use client";

import { useSyncExternalStore } from "react";

/**
 * Which laptop the student codes on. It only changes the wording of the AI
 * prompts (Windows PowerShell or the macOS Terminal), and is shared by every
 * prompt form so a Mac student picks it once.
 *
 * Kept in an external store like lesson progress: the server snapshot is
 * always Windows, the client reads localStorage or guesses from the browser.
 */
export type Platform = "windows" | "mac";

const STORAGE_KEY = "stellar-vku:platform:v1";

let cache: Platform | null = null;
const listeners = new Set<() => void>();

function read(): Platform {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "windows" || saved === "mac") return saved;
  } catch {
    // Blocked storage falls through to the guess below.
  }
  return /Mac/i.test(window.navigator.userAgent) ? "mac" : "windows";
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Platform {
  cache ??= read();
  return cache;
}

function getServerSnapshot(): Platform {
  return "windows";
}

export function setPlatform(next: Platform) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // The in-memory value still applies for this visit.
  }
  for (const listener of listeners) listener();
}

export function usePlatform(): Platform {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
