"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LightboxItem {
  /** Unique key within the set */
  key: string;
  /** Full-size image URL */
  src: string;
  /** Accessible label / alt text */
  alt: string;
  /** Optional smaller thumbnail shown in the strip (falls back to src) */
  thumbnailSrc?: string;
}

export interface LightboxProps {
  /** Ordered list of images to display */
  items: LightboxItem[];
  /** Index of the image to show first */
  activeIndex: number;
  /** Called when the overlay or close button is pressed */
  onClose: () => void;
  /** Called when the user navigates to a different image */
  onNavigate: (index: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Lightbox — full-screen image viewer rendered in a portal.
 *
 * Features:
 * - Animated image transitions (Framer Motion)
 * - Keyboard navigation (← → Escape)
 * - Touch/swipe navigation on mobile
 * - Thumbnail strip (multi-image sets)
 * - Body scroll lock while open
 * - Focus management (closes button autofocused)
 * - Click-outside closes
 *
 * ```tsx
 * <Lightbox
 *   items={images}
 *   activeIndex={index}
 *   onClose={() => setOpen(false)}
 *   onNavigate={setIndex}
 * />
 * ```
 */
export function Lightbox({
  items,
  activeIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef(0);

  const total = items.length;
  const item = items[activeIndex];

  const prev = useCallback(
    () => onNavigate((activeIndex - 1 + total) % total),
    [activeIndex, total, onNavigate]
  );
  const next = useCallback(
    () => onNavigate((activeIndex + 1) % total),
    [activeIndex, total, onNavigate]
  );

  // ── Scroll lock ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── Focus management ────────────────────────────────────────────────────────

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // ── Keyboard ────────────────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    },
    [onClose, prev, next]
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-secondary-950/95 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 50) delta > 0 ? next() : prev();
      }}
    >
      {/* ── Image counter (top-left) ── */}
      {total > 1 && (
        <span className="absolute left-5 top-4 z-20 select-none rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
          {activeIndex + 1} / {total}
        </span>
      )}

      {/* ── Close button (top-right) ── */}
      <button
        ref={closeRef}
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* ── Prev button ── */}
      {total > 1 && (
        <button
          type="button"
          aria-label="Ảnh trước"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronLeftIcon className="h-7 w-7" aria-hidden="true" />
        </button>
      )}

      {/* ── Next button ── */}
      {total > 1 && (
        <button
          type="button"
          aria-label="Ảnh tiếp theo"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronRightIcon className="h-7 w-7" aria-hidden="true" />
        </button>
      )}

      {/* ── Main image (animated on navigation) ── */}
      <div
        className="relative flex max-h-[85vh] max-w-[80vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.alt}
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Thumbnail strip (bottom, multi-image only) ── */}
      {total > 1 && (
        <div
          className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex gap-2 rounded bg-black/40 px-3 py-2 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((it, idx) => (
            <button
              key={it.key}
              type="button"
              aria-label={it.alt}
              aria-pressed={idx === activeIndex}
              onClick={() => onNavigate(idx)}
              className={[
                "h-10 w-10 shrink-0 overflow-hidden rounded border-2 transition-all",
                idx === activeIndex
                  ? "border-white opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.thumbnailSrc ?? it.src}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
