import { cn } from "@/lib/utils";

/**
 * Abstract issuance mark: an orbit (the ledger) with a token leaving the centre.
 * Drawn with `currentColor` so it inherits whatever text colour it sits in.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.35"
        transform="rotate(-28 16 16)"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.2"
        transform="rotate(28 16 16)"
      />
      <circle cx="16" cy="16" r="4.6" fill="currentColor" />
      <circle cx="27.5" cy="9" r="2.4" fill="currentColor" opacity="0.75" />
    </svg>
  );
}
