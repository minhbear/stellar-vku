import { ExternalLink } from "lucide-react";

export interface CompareRow {
  criterion: string;
  bank: string;
  stellar: string;
}

export interface SourceItem {
  label: string;
  href: string;
}

/** Old way vs on-chain way, one row per criterion. */
export function CompareTable({ columns, rows }: { columns: [string, string, string]; rows: CompareRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[36rem] text-sm">
        <thead className="bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2.5 text-left font-medium">
              {columns[0]}
            </th>
            <th scope="col" className="px-4 py-2.5 text-left font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-fiat" aria-hidden="true" />
                {columns[1]}
              </span>
            </th>
            <th scope="col" className="px-4 py-2.5 text-left font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-chain" aria-hidden="true" />
                {columns[2]}
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.criterion} className="align-top">
              <th scope="row" className="px-4 py-3 text-left font-medium">
                {row.criterion}
              </th>
              <td className="px-4 py-3 leading-relaxed text-muted-foreground">{row.bank}</td>
              <td className="px-4 py-3 leading-relaxed">{row.stellar}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SourceList({ items }: { items: SourceItem[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((source) => (
        <li key={source.href}>
          <a
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="min-w-0 flex-1 text-pretty">{source.label}</span>
            <ExternalLink
              className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
