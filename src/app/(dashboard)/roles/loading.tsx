import { Skeleton } from "@/src/components/ui/Skeleton";

export default function RolesLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-sm">
        {/* Header row */}
        <div className="border-b border-secondary-200 px-4 py-3">
          <div className="grid grid-cols-5 gap-4">
            {["w-10", "w-48", "w-64", "w-24", "w-32"].map((w, i) => (
              <Skeleton key={i} className={`h-4 ${w}`} />
            ))}
          </div>
        </div>
        {/* Data rows */}
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="border-b border-secondary-100 px-4 py-4 last:border-0"
          >
            <div className="grid grid-cols-5 gap-4">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
