"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { Tooltip } from "@/src/components/ui/Tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SuccessHeroProps {
  orderId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SuccessHero — animated success state with order ID copy action.
 *
 * Animation sequence (Framer Motion):
 *   1. Green circle scales in   (spring, stiffness 200 / damping 20)
 *   2. SVG checkmark draws in   (pathLength 0→1, 0.4 s, delay 0.2 s)
 *   3. Title + subtitle fade up (opacity + y, delay 0.5 s)
 *   4. Order ID chip fades up   (opacity + y, delay 0.65 s)
 *
 * Copy confirmation: icon swaps ClipboardDocumentIcon → CheckIcon for 2 s.
 * No toast is used; Tooltip shows "Đã sao chép!" feedback.
 */
export function SuccessHero({ orderId }: SuccessHeroProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fail silently.
    }
  }, [orderId]);

  return (
    <div className="flex flex-col items-center text-center py-8">

      {/* ── Animated circle ────────────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-success-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10 text-success-600"
          aria-hidden="true"
        >
          {/* Checkmark path drawn in via pathLength */}
          <motion.path
            d="M4.5 12.75l6 6 9-13.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      {/* ── Title + subtitle ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.5 }}
        className="mt-6 space-y-2"
      >
        <h1 className="text-2xl font-bold text-secondary-900">
          Đặt hàng thành công!
        </h1>
        <p className="mx-auto max-w-sm text-sm text-secondary-500">
          Cảm ơn bạn đã tin tưởng mua sắm tại PC Store. Chúng tôi sẽ xử lý
          đơn hàng của bạn trong thời gian sớm nhất!
        </p>
      </motion.div>

      {/* ── Order ID badge + copy button ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.65 }}
        className="mt-5 flex items-center gap-2"
      >
        <Badge variant="default" size="md">
          Mã đơn hàng:&nbsp;#{orderId}
        </Badge>

        <Tooltip
          content={copied ? "Đã sao chép!" : "Sao chép mã đơn hàng"}
          placement="top"
          delay={0}
        >
          <button
            type="button"
            aria-label="Sao chép mã đơn hàng"
            onClick={handleCopy}
            className="rounded p-1.5 text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {copied ? (
              <CheckIcon
                className="h-4 w-4 text-success-600"
                aria-hidden="true"
              />
            ) : (
              <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </Tooltip>
      </motion.div>
    </div>
  );
}
