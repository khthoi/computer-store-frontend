"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CartItem } from "@/src/components/cart/CartItem";
import type { CartItem as CartItemType } from "@/src/store/cart.store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartListProps {
  items: CartItemType[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CartList — ordered list of CartItem rows.
 *
 * Uses AnimatePresence + motion.li for smooth height-collapse exit animation
 * when an item is removed. This is the only place in the cart UI where
 * Framer Motion is used for layout animation.
 */
export function CartList({
  items,
  selectedIds,
  onToggleSelect,
  onQuantityChange,
  onRemove,
}: CartListProps) {
  return (
    <ul
      role="list"
      aria-label="Danh sách sản phẩm trong giỏ hàng"
      className="divide-y divide-secondary-100"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout
            initial={false}
            exit={{
              opacity: 0,
              height: 0,
              marginBottom: 0,
              overflow: "hidden",
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <CartItem
              item={item}
              isSelected={selectedIds.has(item.id)}
              onToggleSelect={onToggleSelect}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
