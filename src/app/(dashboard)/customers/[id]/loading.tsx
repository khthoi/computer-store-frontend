import { Skeleton } from "@/src/components/ui/Skeleton";

export default function CustomerDetailLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-4 w-40" />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
            <Skeleton className="mb-4 h-4 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
            <Skeleton className="mb-4 h-4 w-24" />
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-secondary-200 bg-white shadow-sm">
          <div className="border-b border-secondary-200 px-6 py-3">
            <div className="flex gap-6">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <div className="p-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="border-b border-secondary-100 py-3 last:border-0"
              >
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
