/**
 * Tiny external store for lesson progress, kept outside React so it can be read
 * with `useSyncExternalStore` — no state-setting effect, and no hydration
 * mismatch (the server snapshot is always empty).
 */
const STORAGE_KEY = "stellar-vku:progress:v1";

const EMPTY: readonly string[] = [];

let cache: readonly string[] | null = null;
const listeners = new Set<() => void>();

function read(): readonly string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    // Blocked or corrupt storage must not break the lesson.
    return EMPTY;
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Keep tabs in sync when the same student has the course open twice.
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

/** Must return a stable reference between calls or React re-renders forever. */
export function getSnapshot(): readonly string[] {
  cache ??= read();
  return cache;
}

export function getServerSnapshot(): readonly string[] {
  return EMPTY;
}

export function setCompleted(next: readonly string[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private-mode failures; the in-memory value still applies.
  }
  for (const listener of listeners) listener();
}
