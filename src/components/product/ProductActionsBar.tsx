"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowsRightLeftIcon,
  HeartIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/src/components/ui/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductActionsBarProps {
  productId: string;
  productName: string;
}

// ─── Tooltip helper ───────────────────────────────────────────────────────────

function ActionTooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-secondary-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 z-20">
      {label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProductActionsBar — unified Wishlist / Compare / Share action strip for a
 * product detail page.
 *
 * - **Wishlist**: toggle with heart bounce animation + toast feedback.
 * - **Compare**: toggle with scale animation + toast feedback.
 * - **Share**: copies current URL to clipboard; shows momentary "copied" state
 *   with scale animation and tooltip feedback, then auto-resets after 2 s.
 *
 * All toasts are dispatched through `useToast()` so they stack correctly in
 * the global `<ToastProvider>` container.
 */
export function ProductActionsBar({
  productId: _productId,
  productName: _productName,
}: ProductActionsBarProps) {
  const { showToast } = useToast();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up the copy-reset timer on unmount
  useEffect(() => {
    return () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
    };
  }, []);

  const handleWishlist = useCallback(() => {
    const next = !isWishlisted;
    setIsWishlisted(next);
    showToast(
      next ? "Đã thêm vào danh sách yêu thích" : "Đã bỏ khỏi danh sách yêu thích"
    );
  }, [isWishlisted, showToast]);

  const handleCompare = useCallback(() => {
    const next = !isCompared;
    setIsCompared(next);
    showToast(
      next ? "Đã thêm vào danh sách so sánh" : "Đã bỏ khỏi danh sách so sánh",
      "info"
    );
  }, [isCompared, showToast]);

  const handleShare = useCallback(async () => {
    if (isCopied) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
      copyResetRef.current = setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // clipboard write failed silently — tooltip remains unchanged
    }
  }, [isCopied]);

  return (
    <div className="flex items-center gap-1">

      {/* ── Wishlist ── */}
      <div className="group relative">
        <button
          type="button"
          aria-label="Thêm vào danh sách yêu thích"
          aria-pressed={isWishlisted}
          onClick={handleWishlist}
          className={[
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isWishlisted
              ? "text-error-500 hover:bg-error-50"
              : "text-secondary-600 hover:bg-secondary-100 hover:text-error-500",
          ].join(" ")}
        >
          <motion.span
            animate={isWishlisted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            {isWishlisted ? (
              <HeartSolidIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <HeartIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </motion.span>
          Yêu thích
        </button>
        <ActionTooltip label={isWishlisted ? "Đã yêu thích" : "Thêm yêu thích"} />
      </div>

      {/* ── Compare ── */}
      <div className="group relative">
        <button
          type="button"
          aria-label="So sánh sản phẩm"
          aria-pressed={isCompared}
          onClick={handleCompare}
          className={[
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isCompared
              ? "bg-primary-50 text-primary-600 hover:bg-primary-100"
              : "text-secondary-600 hover:bg-secondary-100 hover:text-primary-600",
          ].join(" ")}
        >
          <motion.span
            animate={isCompared ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <ArrowsRightLeftIcon className="h-5 w-5" aria-hidden="true" />
          </motion.span>
          So sánh
        </button>
        <ActionTooltip label={isCompared ? "Đang so sánh" : "Thêm vào so sánh"} />
      </div>

      {/* ── Share ── */}
      <div className="group relative">
        <button
          type="button"
          aria-label="Chia sẻ sản phẩm"
          onClick={handleShare}
          className={[
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isCopied
              ? "bg-success-50 text-success-600 hover:bg-success-100"
              : "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900",
          ].join(" ")}
        >
          <motion.span
            animate={isCopied ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <ShareIcon className="h-5 w-5" aria-hidden="true" />
          </motion.span>
          Chia sẻ
        </button>
        <ActionTooltip label={isCopied ? "Đã sao chép!" : "Sao chép liên kết"} />
      </div>

    </div>
  );
}
