import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { POPULAR_SEARCHES } from "@/src/app/(storefront)/search/_mock_data";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchEmptyStateProps {
  query: string;
  onSearch: (query: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SearchEmptyState — rendered when totalProducts === 0.
 * Shows an illustration, suggestions, popular search chips, and a CTA.
 */
export function SearchEmptyState({ query, onSearch }: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* Illustration */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary-100">
        <MagnifyingGlassIcon
          className="h-12 w-12 text-secondary-300"
          aria-hidden="true"
        />
      </div>

      {/* Heading */}
      <h2 className="mb-2 text-lg font-semibold text-secondary-700">
        Không tìm thấy kết quả cho{" "}
        <span className="text-secondary-900">&ldquo;{query}&rdquo;</span>
      </h2>

      {/* Suggestions */}
      <ul className="mb-6 space-y-1.5 text-left text-sm text-secondary-500">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-secondary-400" aria-hidden="true">•</span>
          Kiểm tra lại chính tả của từ khoá.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-secondary-400" aria-hidden="true">•</span>
          Thử dùng từ khoá ngắn hơn hoặc chung hơn.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-secondary-400" aria-hidden="true">•</span>
          Tìm theo tên danh mục hoặc thương hiệu.
        </li>
      </ul>

      {/* Popular search chips */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-secondary-400">
        Có thể bạn muốn tìm
      </p>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {POPULAR_SEARCHES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSearch(s)}
            className="rounded-full border border-secondary-200 bg-white px-4 py-1.5 text-sm text-secondary-700 transition-colors hover:border-primary-400 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            {s}
          </button>
        ))}
      </div>

      {/* CTA */}
      <Link href="/">
        <Button variant="primary" size="lg">
          Về trang chủ
        </Button>
      </Link>
    </div>
  );
}
