"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Drawer } from "@/src/components/ui/Drawer";
import { Select } from "@/src/components/ui/Select";
import { Pagination } from "@/src/components/navigation/Pagination";
import { ProductCardList } from "@/src/components/product/ProductCardList";
import { SearchBar } from "./SearchBar";
import { SearchFiltersPanel } from "./SearchFiltersPanel";
import { SearchEmptyState } from "./SearchEmptyState";
import type {
  FilterDefinition,
  FilterState,
  FilterValue,
} from "@/src/app/(storefront)/products/demo/_config";
import { SORT_OPTIONS } from "@/src/app/(storefront)/products/demo/_config";
import type { SearchResults } from "@/src/app/(storefront)/search/_mock_data";

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(value: number): string {
  return value.toLocaleString("vi-VN") + "₫";
}

function isFilterActive(value: FilterValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return true;
  if (typeof value === "string") return value !== "";
  if (Array.isArray(value)) {
    if (value.length === 0) return false;
    return typeof value[0] === "number" ? true : value.length > 0;
  }
  return false;
}

interface ActiveChip {
  key: string;   // e.g. "brand:asus" or "price" or "inStock"
  label: string;
  group: string;
}

function buildActiveFilters(
  state: FilterState,
  definitions: FilterDefinition[]
): ActiveChip[] {
  const chips: ActiveChip[] = [];

  for (const def of definitions) {
    const val = state[def.key];
    if (!isFilterActive(val)) continue;

    switch (def.type) {
      case "dropdown":
      case "checkbox": {
        const arr = Array.isArray(val) ? (val as string[]) : val ? [val as string] : [];
        for (const v of arr) {
          const opt = def.options?.find((o) => o.value === v);
          if (opt) chips.push({ key: `${def.key}:${v}`, label: opt.label, group: def.label });
        }
        break;
      }
      case "range": {
        const [min, max] = val as [number, number];
        const label =
          def.unit === "₫"
            ? `${formatVND(min)} – ${formatVND(max)}`
            : `${min} – ${max}${def.unit ? ` ${def.unit}` : ""}`;
        chips.push({ key: def.key, label, group: def.label });
        break;
      }
      case "toggle":
        chips.push({ key: def.key, label: def.label, group: "" });
        break;
      case "rating":
        chips.push({ key: def.key, label: `${val}★ trở lên`, group: def.label });
        break;
    }
  }
  return chips;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchResultsPageInnerProps {
  results: SearchResults;
  query: string;
  filterDefinitions: FilterDefinition[];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SearchResultsPageInner — client root for /search.
 *
 * Zones:
 *  1. Search hero — large SearchBar + result count + didYouMean suggestion
 *  2. Category/brand chips (when non-product results exist)
 *  3. Filters sidebar + product grid + pagination
 */
export function SearchResultsPageInner({
  results,
  query,
  filterDefinitions,
}: SearchResultsPageInnerProps) {
  const router = useRouter();

  // ── Local state ──────────────────────────────────────────────────────────────
  const [filterState, setFilterState] = useState<FilterState>({});
  const [sortBy, setSortBy] = useState("bestselling");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── Navigation ───────────────────────────────────────────────────────────────

  const handleNewSearch = useCallback(
    (q: string) => {
      router.replace(`/search?q=${encodeURIComponent(q)}`);
    },
    [router]
  );

  // ── Filter & sort helpers ────────────────────────────────────────────────────

  function handleFilterChange(next: FilterState) {
    setFilterState(next);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSortChange(v: string | string[]) {
    setSortBy(typeof v === "string" ? v : v[0] ?? "bestselling");
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeChip(chipKey: string) {
    const [filterKey, optionValue] = chipKey.split(":");
    setFilterState((prev) => {
      const next = { ...prev };
      if (optionValue !== undefined) {
        // Multi-select: remove just this option value
        const arr = (prev[filterKey] as string[]) ?? [];
        const newArr = arr.filter((v) => v !== optionValue);
        if (newArr.length === 0) {
          delete next[filterKey];
        } else {
          next[filterKey] = newArr;
        }
      } else {
        delete next[filterKey];
      }
      return next;
    });
    setCurrentPage(1);
  }

  // ── Derived data ─────────────────────────────────────────────────────────────

  const activeChips = useMemo(
    () => buildActiveFilters(filterState, filterDefinitions),
    [filterState, filterDefinitions]
  );

  const totalPages = Math.max(1, Math.ceil(results.totalProducts / ITEMS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return results.products.slice(start, start + ITEMS_PER_PAGE);
  }, [results.products, currentPage]);

  const hasNonProductResults =
    results.categories.length > 0 || results.brands.length > 0;

  const isEmpty = results.totalProducts === 0;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Zone 1: Search Hero ─────────────────────────────────────────── */}
      <section className="py-8">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">

          {/* Result summary */}
          {!isEmpty && (
            <p className="mt-3 text-center text-sm text-secondary-500">
              Tìm thấy{" "}
              <strong className="font-semibold text-secondary-900">
                {results.totalProducts} kết quả
              </strong>{" "}
              cho{" "}
              <strong className="font-semibold text-secondary-900">
                &ldquo;{query}&rdquo;
              </strong>
            </p>
          )}

          {/* Did-you-mean suggestion */}
          {results.didYouMean && (
            <p className="mt-2 text-center text-sm text-secondary-500">
              Bạn có muốn tìm:{" "}
              <button
                type="button"
                onClick={() => handleNewSearch(results.didYouMean!)}
                className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-700 transition-colors"
              >
                {results.didYouMean}
              </button>
              ?
            </p>
          )}
        </div>
      </section>

      {/* ── Zone 2: Category + Brand chips ─────────────────────────────── */}
      {hasNonProductResults && !isEmpty && (
        <section className="bg-secondary-50 border-b border-secondary-200 py-5">
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div
              className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin"
              aria-label="Danh mục và thương hiệu liên quan"
            >
              {results.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-secondary-200 bg-white px-3 py-1.5 text-sm text-secondary-700 transition-colors hover:border-primary-400 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  {cat.thumbnail && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={cat.thumbnail}
                      alt=""
                      className="h-5 w-5 object-contain"
                    />
                  )}
                  <span>{cat.name}</span>
                  <Badge variant="default" size="sm">
                    {cat.productCount}
                  </Badge>
                </Link>
              ))}

              {results.brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={brand.href}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-secondary-200 bg-white px-3 py-1.5 text-sm text-secondary-700 transition-colors hover:border-primary-400 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  {brand.logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={brand.logoUrl}
                      alt=""
                      className="h-5 w-5 object-contain"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700"
                    >
                      {brand.name[0]}
                    </span>
                  )}
                  <span>{brand.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Zone 3: Filters + Product Results ──────────────────────────── */}
      <section className="py-8">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          {isEmpty ? (
            /* Empty state — full width, no filter column */
            <SearchEmptyState query={query} onSearch={handleNewSearch} />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              {/* ── Left: Filter panel (desktop) ── */}
              <aside className="hidden lg:block" aria-label="Bộ lọc">
                <div className="sticky top-24 rounded-xl border border-secondary-200 bg-white p-4">
                  <SearchFiltersPanel
                    definitions={filterDefinitions}
                    value={filterState}
                    onChange={handleFilterChange}
                  />
                </div>
              </aside>

              {/* ── Right: Controls + grid ── */}
              <div className="min-w-0">
                {/* Top control bar */}
                <div className="mb-5 flex flex-wrap items-start gap-3">
                  {/* Mobile filter button */}
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FunnelIcon />}
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden shrink-0"
                  >
                    Lọc
                  </Button>

                  {/* Active filter chips */}
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    {activeChips.map((chip) => (
                      <span
                        key={chip.key}
                        className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                      >
                        {chip.group && (
                          <span className="text-primary-500">{chip.group}:</span>
                        )}
                        {chip.label}
                        <button
                          type="button"
                          aria-label={`Xóa bộ lọc ${chip.label}`}
                          onClick={() => removeChip(chip.key)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-primary-200 transition-colors"
                        >
                          <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </span>
                    ))}

                    {activeChips.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleFilterChange({})}
                        className="text-xs text-secondary-500 hover:text-secondary-700 transition-colors underline underline-offset-2"
                      >
                        Xóa tất cả bộ lọc
                      </button>
                    )}
                  </div>

                  {/* Sort selector */}
                  <div className="ml-auto w-44 shrink-0">
                    <Select
                      options={SORT_OPTIONS}
                      value={[sortBy]}
                      onChange={handleSortChange}
                      size="sm"
                      placeholder="Sắp xếp"
                    />
                  </div>
                </div>

                {/* Product grid */}
                <ProductCardList
                  products={paginatedProducts}
                  itemsPerRow={6}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      page={currentPage}
                      totalPages={totalPages}
                      onPageChange={(p) => {
                        setCurrentPage(p);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Mobile filters drawer ──────────────────────────────────────── */}
      <Drawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        position="left"
        size="md"
        title="Bộ lọc tìm kiếm"
      >
        <div className="p-4">
          <SearchFiltersPanel
            definitions={filterDefinitions}
            value={filterState}
            onChange={(next) => {
              handleFilterChange(next);
              setMobileFiltersOpen(false);
            }}
          />
        </div>
      </Drawer>
    </>
  );
}
