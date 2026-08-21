import { Children, isValidElement, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Entrance animations here are pure CSS on purpose.
 *
 * A JS-driven entrance starts the element at `opacity: 0` and needs
 * requestAnimationFrame to finish the job — which Chrome pauses in background
 * tabs. Open a lesson in a background tab and the page can stay blank. CSS
 * animations keep running on the document timeline and `animation-fill-mode:
 * both` guarantees the final state, so content is always readable.
 *
 * `prefers-reduced-motion` is honoured globally in `globals.css`.
 */

const STEP_MS = 60;

export function Reveal({
  children,
  delay = 0,
  className,
  as: Component = "div",
}: {
  children: ReactNode;
  /** Delay in seconds, to match the framer-motion call sites. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  return (
    <Component
      className={cn("animate-rise", className)}
      style={delay ? { animationDelay: `${Math.round(delay * 1000)}ms` } : undefined}
    >
      {children}
    </Component>
  );
}

/**
 * Staggers direct children in reading order. One level only — nesting staggers
 * makes a page look like it is loading twice.
 */
export function Stagger({
  children,
  className,
  step = STEP_MS,
  delay = 40,
}: {
  children: ReactNode;
  className?: string;
  /** Milliseconds between children. */
  step?: number;
  /** Milliseconds before the first child. */
  delay?: number;
}) {
  return (
    <div className={cn(className)}>
      {Children.map(children, (child, index) =>
        isValidElement(child) ? (
          // The wrapper becomes the grid/flex item, so it has to stretch or
          // cards in the same row end up different heights.
          <div
            className="animate-rise h-full"
            style={{ animationDelay: `${delay + index * step}ms` }}
          >
            {child}
          </div>
        ) : (
          child
        ),
      )}
    </div>
  );
}
