"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchSuggestion {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
  /** Optional sub-label (e.g. category name) */
  sublabel?: string;
  /** Link to navigate when suggestion is selected */
  href?: string;
}

export interface SearchBarProps {
  /** Current controlled value */
  value?: string;
  /** Default value for uncontrolled use */
  defaultValue?: string;
  /** Called whenever the input value changes (debounced by `debounceMs`) */
  onChange?: (value: string) => void;
  /** Called when the user submits (Enter or suggestion click) */
  onSubmit?: (value: string) => void;
  /** Live suggestions to show in the dropdown */
  suggestions?: SearchSuggestion[];
  /** Recent search strings persisted by the consumer */
  recentSearches?: string[];
  /** Called when a recent search is cleared */
  onClearRecent?: (term: string) => void;
  /** Debounce delay for `onChange` in ms
   * @default 300
   */
  debounceMs?: number;
  placeholder?: string;
  /** Accessible label for the search input
   * @default "Search"
   */
  inputLabel?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SearchBar — debounced search input with suggestions dropdown and recent searches.
 *
 * ```tsx
 * <SearchBar
 *   placeholder="Search products…"
 *   suggestions={suggestions}
 *   recentSearches={recentSearches}
 *   onChange={(q) => fetchSuggestions(q)}
 *   onSubmit={(q) => router.push(`/search?q=${q}`)}
 *   onClearRecent={(term) => removeRecent(term)}
 * />
 * ```
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar(
    {
      value: controlledValue,
      defaultValue = "",
      onChange,
      onSubmit,
      suggestions = [],
      recentSearches = [],
      onClearRecent,
      debounceMs = 300,
      placeholder = "Search products…",
      inputLabel = "Search",
      className = "",
    },
    ref
  ) {
    const inputId = useId();
    const listboxId = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const internalInputRef = useRef<HTMLInputElement>(null);

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const value = isControlled ? controlledValue : internalValue;

    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Merge forwarded ref with internal
    const setInputRef = useCallback(
      (el: HTMLInputElement | null) => {
        (internalInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
      },
      [ref]
    );

    // Calculate dropdown position
    useEffect(() => {
      if (!open || !containerRef.current) {
        setDropdownPosition(null);
        return;
      }

      const updatePosition = () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setDropdownPosition({
            top: rect.bottom + 6, // mt-1.5 = 6px gap
            left: rect.left,
            width: rect.width,
          });
        }
      };

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(updatePosition);

      // Update position on scroll/resize
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }, [open]);

    // Close dropdown on outside click
    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          !containerRef.current?.contains(target) &&
          !dropdownRef.current?.contains(target)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Build combined dropdown items
    const showSuggestions = suggestions.length > 0 && value.trim().length > 0;
    const showRecent = !showSuggestions && recentSearches.length > 0;
    const dropdownVisible = open && (showSuggestions || showRecent);

    const allItems: Array<{ type: "suggestion"; data: SearchSuggestion } | { type: "recent"; term: string }> =
      showSuggestions
        ? suggestions.map((s) => ({ type: "suggestion" as const, data: s }))
        : recentSearches.map((t) => ({ type: "recent" as const, term: t }));

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!isControlled) setInternalValue(val);
        setOpen(true);
        setHighlightedIndex(-1);

        // Debounced callback
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          onChange?.(val);
        }, debounceMs);
      },
      [debounceMs, isControlled, onChange]
    );

    const handleClear = useCallback(() => {
      if (!isControlled) setInternalValue("");
      onChange?.("");
      setOpen(false);
      internalInputRef.current?.focus();
    }, [isControlled, onChange]);

    const handleSelect = useCallback(
      (term: string, href?: string) => {
        if (!isControlled) setInternalValue(term);
        onChange?.(term);
        onSubmit?.(term);
        setOpen(false);
        if (href) {
          window.location.href = href;
        }
      },
      [isControlled, onChange, onSubmit]
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (!dropdownVisible) {
          if (e.key === "Enter") onSubmit?.(value);
          return;
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < allItems.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : allItems.length - 1
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (highlightedIndex >= 0) {
            const item = allItems[highlightedIndex];
            if (item.type === "suggestion") {
              handleSelect(item.data.label, item.data.href);
            } else {
              handleSelect(item.term);
            }
          } else {
            onSubmit?.(value);
            setOpen(false);
          }
        } else if (e.key === "Escape") {
          setOpen(false);
          setHighlightedIndex(-1);
        }
      },
      [allItems, dropdownVisible, handleSelect, highlightedIndex, onSubmit, value]
    );

    return (
      <div
        ref={containerRef}
        className={["relative w-full", className].filter(Boolean).join(" ")}
      >
        {/* Input */}
        <div className="relative flex items-center">
          <label htmlFor={inputId} className="sr-only">
            {inputLabel}
          </label>
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 w-4 h-4 text-secondary-400"
            aria-hidden="true"
          />
          <input
            ref={setInputRef}
            id={inputId}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={dropdownVisible}
            aria-controls={dropdownVisible ? listboxId : undefined}
            aria-activedescendant={
              highlightedIndex >= 0 ? `${listboxId}-item-${highlightedIndex}` : undefined
            }
            value={value}
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            className="w-full rounded-lg border border-secondary-200 bg-white py-2 pl-9 pr-9 text-sm text-secondary-900 placeholder-secondary-400 transition-shadow focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {value && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={handleClear}
              className="absolute right-2.5 flex h-5 w-5 items-center justify-center rounded-full text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Dropdown - rendered via portal */}
        {dropdownVisible &&
          dropdownPosition &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={dropdownRef}
              id={listboxId}
              role="listbox"
              aria-label={showRecent ? "Recent searches" : "Suggestions"}
              className="fixed z-[9999] min-w-[240px] overflow-hidden rounded-lg border border-secondary-200 bg-white shadow-lg"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${Math.max(dropdownPosition.width, 240)}px`,
              }}
            >
            {/* Section heading */}
            <p className="px-3 pt-2.5 pb-1 text-xs font-semibold uppercase tracking-wider text-secondary-400">
              {showRecent ? "Recent searches" : "Suggestions"}
            </p>

            <ul>
              {allItems.map((item, idx) => {
                const isHighlighted = idx === highlightedIndex;
                if (item.type === "suggestion") {
                  return (
                    <li
                      key={item.data.key}
                      id={`${listboxId}-item-${idx}`}
                      role="option"
                      aria-selected={isHighlighted}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(item.data.label, item.data.href)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={[
                          "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                          isHighlighted ? "bg-primary-50" : "hover:bg-secondary-50",
                        ].join(" ")}
                      >
                        <MagnifyingGlassIcon
                          className="w-4 h-4 shrink-0 text-secondary-400"
                          aria-hidden="true"
                        />
                        <span className="flex-1 min-w-0">
                          <span className="block font-medium text-secondary-800 truncate">
                            {item.data.label}
                          </span>
                          {item.data.sublabel && (
                            <span className="block text-xs text-secondary-500 truncate">
                              {item.data.sublabel}
                            </span>
                          )}
                        </span>
                        {item.data.href && (
                          <ArrowUpRightIcon
                            className="w-3.5 h-3.5 shrink-0 text-secondary-300"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </li>
                  );
                }

                // Recent search item
                return (
                  <li
                    key={item.term}
                    id={`${listboxId}-item-${idx}`}
                    role="option"
                    aria-selected={isHighlighted}
                  >
                    <div
                      className={[
                        "flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                        isHighlighted ? "bg-primary-50" : "hover:bg-secondary-50",
                      ].join(" ")}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(item.term)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className="flex flex-1 items-center gap-3 text-left focus-visible:outline-none"
                      >
                        <ClockIcon
                          className="w-4 h-4 shrink-0 text-secondary-400"
                          aria-hidden="true"
                        />
                        <span className="flex-1 truncate text-secondary-700">
                          {item.term}
                        </span>
                      </button>
                      {onClearRecent && (
                        <button
                          type="button"
                          aria-label={`Remove "${item.term}" from recent searches`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClearRecent(item.term);
                          }}
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-secondary-300 transition-colors hover:bg-secondary-100 hover:text-secondary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                          <XMarkIcon className="w-3 h-3" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

              <div className="pb-1" />
            </div>,
            document.body
          )}
      </div>
    );
  }
);

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name             Type                        Default         Description
 * ──────────────────────────────────────────────────────────────────────────────
 * value            string                      —               Controlled input value
 * defaultValue     string                      ""              Initial uncontrolled value
 * onChange         (value: string) => void     —               Debounced change callback
 * onSubmit         (value: string) => void     —               Called on Enter / suggestion select
 * suggestions      SearchSuggestion[]          []              Live suggestion items
 * recentSearches   string[]                    []              Recent search terms
 * onClearRecent    (term: string) => void      —               Remove a recent search term
 * debounceMs       number                      300             Debounce delay for onChange
 * placeholder      string                      "Search products…" Input placeholder
 * inputLabel       string                      "Search"        Screen-reader label for input
 * className        string                      ""              Extra classes on root div
 *
 * All native <input> attributes are also forwarded via ref.
 */
