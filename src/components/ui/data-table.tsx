import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  columns: {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.map((item, idx) => (
              <tr
                key={idx}
                className="bg-white transition-colors dark:bg-gray-950"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3 text-gray-700 dark:text-gray-300", col.className)}
                  >
                    {col.render
                      ? col.render(item)
                      : String(item[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="animate-pulse">
        <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border-b border-gray-100 p-4 dark:border-gray-800">
            <div className="flex gap-4">
              {Array.from({ length: cols }).map((_, j) => (
                <div key={j} className="h-4 flex-1 rounded bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
