"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClockIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "@/src/components/ui/Skeleton";
import {
  SUGGESTION_PRODUCTS,
  SUGGESTION_CATEGORIES,
  type SuggestionProduct,
  type SuggestionCategory,
} from "@/src/app/(storefront)/search/_mock_data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

function matchProducts(q: string): SuggestionProduct[] {
  const lower = q.toLowerCase();
  return SUGGESTION_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(lower)
  ).slice(0, 4);
}

function matchCategories(q: string): SuggestionCategory[] {
  const lower = q.toLowerCase();
  return SUGGESTION_CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(lower)
  ).slice(0, 3);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchSuggestionsPopoverProps {
  query: string;
  isFocused: boolean;
  /** Called when the user confirms a search query */
  onSubmit: (query: string) => void;
  onClose: () => void;
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-secondary-400">
      {label}
    </p>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SearchSuggestionsPopover — absolute-positioned autocomplete panel anchored
 * below the SearchBar input. Managed by focus state from the parent.
 *
 * - When query is empty: shows recent search history.
 * - When query has input: debounces 300ms then shows product + category matches.
 * - All buttons use onMouseDown + e.preventDefault() so clicking them does not
 *   blur the input before the click registers.
 */
export function SearchSuggestionsPopover({
  query,
  isFocused,
  onSubmit,
  onClose,
}: SearchSuggestionsPopoverProps) {
  const router = useRouter();

  // ── Search history (localStorage) ──────────────────────────────────────────
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (!isFocused || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("search_history");
      setHistory(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setHistory([]);
    }
  }, [isFocused]);

  function removeHistoryEntry(entry: string) {
    const next = history.filter((h) => h !== entry);
    setHistory(next);
    try {
      localStorage.setItem("search_history", JSON.stringify(next));
    } catch {}
  }

  function clearAllHistory() {
    setHistory([]);
    try {
      localStorage.removeItem("search_history");
    } catch {}
  }

  // ── Debounced suggestions ───────────────────────────────────────────────────
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestionProduct[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<SuggestionCategory[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setIsDebouncing(false);
      setSuggestedProducts([]);
      setSuggestedCategories([]);
      return;
    }

    setIsDebouncing(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setSuggestedProducts(matchProducts(query));
      setSuggestedCategories(matchCategories(query));
      setIsDebouncing(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Visibility ──────────────────────────────────────────────────────────────
  const showHistory = isFocused && query.length === 0 && history.length > 0;
  const showSuggestions = isFocused && query.length >= 1;
  const isOpen = showHistory || showSuggestions;

  if (!isOpen) return null;

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleHistoryClick(entry: string) {
    onSubmit(entry);
  }

  function handleProductClick(href: string) {
    onClose();
    router.push(href);
  }

  function handleCategoryClick(href: string) {
    onClose();
    router.push(href);
  }

  function handleCTAClick() {
    onSubmit(query);
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      role="listbox"
      aria-label="Gợi ý tìm kiếm"
      className="absolute left-0 right-0 top-full z-[200] mt-1 overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-xl"
    >
      {/* ── Recent searches (shown only when query is empty) ───────────── */}
      {showHistory && (
        <div>
          <SectionHeader label="Tìm kiếm gần đây" />
          <ul>
            {history.map((entry) => (
              <li key={entry}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleHistoryClick(entry)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-secondary-700 hover:bg-secondary-50 focus-visible:bg-secondary-50 focus-visible:outline-none"
                >
                  <ClockIcon className="h-4 w-4 shrink-0 text-secondary-400" aria-hidden="true" />
                  <span className="flex-1 truncate">{entry}</span>
                  <span
                    role="button"
                    aria-label={`Xóa "${entry}" khỏi lịch sử`}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHistoryEntry(entry);
                    }}
                    className="ml-auto shrink-0 rounded p-0.5 text-secondary-400 hover:text-secondary-700"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {history.length > 0 && (
            <div className="px-4 py-2 border-t border-secondary-100">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={clearAllHistory}
                className="text-xs text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                Xóa lịch sử
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Query-based suggestions ────────────────────────────────────── */}
      {showSuggestions && (
        <>
          {/* Products */}
          <div className={showHistory ? "border-t border-secondary-100" : ""}>
            <SectionHeader label="Sản phẩm" />
            {isDebouncing ? (
              <div className="space-y-1 px-4 pb-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5">
                    <Skeleton className="h-10 w-10 shrink-0 rounded" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestedProducts.length > 0 ? (
              <ul>
                {suggestedProducts.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleProductClick(product.href)}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-secondary-50 focus-visible:bg-secondary-50 focus-visible:outline-none"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.thumbnail}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded object-cover bg-secondary-50"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-secondary-800">
                          {product.name}
                        </p>
                        <p className="text-xs font-semibold text-primary-600">
                          {formatVND(product.price)}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-sm text-secondary-400">
                Không tìm thấy sản phẩm phù hợp.
              </p>
            )}
          </div>

          {/* Categories */}
          {(isDebouncing || suggestedCategories.length > 0) && (
            <div className="border-t border-secondary-100">
              <SectionHeader label="Danh mục" />
              {isDebouncing ? (
                <div className="space-y-1 px-4 pb-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5">
                      <Skeleton className="h-4 w-4 shrink-0 rounded" />
                      <Skeleton className="h-3.5 w-1/2 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <ul>
                  {suggestedCategories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={false}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleCategoryClick(cat.href)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-secondary-700 hover:bg-secondary-50 focus-visible:bg-secondary-50 focus-visible:outline-none"
                      >
                        <FolderIcon className="h-4 w-4 shrink-0 text-secondary-400" aria-hidden="true" />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Footer CTA */}
          <div className="border-t border-secondary-100">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCTAClick}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors focus-visible:bg-primary-50 focus-visible:outline-none"
            >
              <MagnifyingGlassIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Xem tất cả kết quả cho &ldquo;
                <span className="font-semibold">{query}</span>
                &rdquo;
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
