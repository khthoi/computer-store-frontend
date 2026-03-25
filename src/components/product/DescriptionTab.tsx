"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DescriptionTabProps {
  /** Safe, sanitized HTML string */
  htmlContent: string;
}

const COLLAPSED_HEIGHT = 384;

// ─── Component ────────────────────────────────────────────────────────────────

export function DescriptionTab({ htmlContent }: DescriptionTabProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : COLLAPSED_HEIGHT }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div
          className={[
            "prose max-w-none",
            "prose-headings:text-secondary-900 prose-headings:font-semibold",
            "prose-p:text-secondary-700 prose-p:leading-relaxed",
            "prose-li:text-secondary-700 prose-li:marker:text-primary-400",
            "prose-strong:text-secondary-900",
            "prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline",
            "prose-img:rounded-xl prose-img:shadow-sm",
            "prose-table:border prose-table:border-secondary-200",
            "prose-th:bg-secondary-50 prose-th:text-secondary-700",
          ].join(" ")}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </motion.div>

      {/* Gradient fade overlay when collapsed */}
      {!expanded && (
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 via-white/60 to-transparent pointer-events-none"
        />
      )}

      {/* Expand / collapse toggle */}
      <div className="mt-4 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((prev) => !prev)}
          rightIcon={
            expanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )
          }
        >
          {expanded ? "Thu gọn" : "Xem thêm nội dung"}
        </Button>
      </div>
    </div>
  );
}
