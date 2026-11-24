import { CopyButton } from "@/components/stellar/copy-button";
import { cn } from "@/lib/utils";

interface CommandBlockProps {
  code: string;
  /** Short line above the block, e.g. "Run in PowerShell". */
  caption?: string;
  className?: string;
}

/**
 * A command or file the student copies verbatim. Lines wrap instead of
 * scrolling sideways: on a laptop in class a hidden half-command is worse than
 * an ugly break.
 */
export function CommandBlock({ code, caption, className }: CommandBlockProps) {
  return (
    <figure className={cn("min-w-0", className)}>
      {caption ? (
        <figcaption className="mb-1.5 text-xs font-medium text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 py-2 pr-1.5 pl-3">
        <pre className="min-w-0 flex-1 py-1 font-onchain text-[13px] leading-relaxed break-words whitespace-pre-wrap">
          {code}
        </pre>
        <CopyButton value={code} />
      </div>
    </figure>
  );
}
