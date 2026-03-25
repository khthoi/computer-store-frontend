"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
export type AvatarStatus = "online" | "away" | "busy" | "offline";
export type AvatarShape = "circle" | "square";

export interface AvatarProps {
  /** Image URL. Falls back to initials if the image fails to load. */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /**
   * Name used to derive initials when no image is available.
   * Takes the first letter of the first two words.
   */
  name?: string;
  /** @default "md" */
  size?: AvatarSize;
  /** @default "circle" */
  shape?: AvatarShape;
  /** Shows a colored status indicator dot */
  status?: AvatarStatus;
  className?: string;
}

export interface AvatarGroupProps {
  /** Array of Avatar props */
  avatars: AvatarProps[];
  /** Maximum avatars to display before a +N overflow badge
   * @default 4
   */
  max?: number;
  /** @default "md" */
  size?: AvatarSize;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const SIZE: Record<AvatarSize, string> = {
  xs: "size-6  text-xs",
  sm: "size-8  text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
  "2xl": "size-20 text-xl",
  "3xl": "size-24 text-2xl",
  "4xl": "size-32 text-3xl",
  "5xl": "size-40 text-4xl",
};

const STATUS_DOT_SIZE: Record<AvatarSize, string> = {
  xs: "size-1.5",
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
  xl: "size-3.5",
  "2xl": "size-4",
  "3xl": "size-5",
  "4xl": "size-6",
  "5xl": "size-7",
};

const STATUS_COLOR: Record<AvatarStatus, string> = {
  online:  "bg-success-500",
  away:    "bg-warning-500",
  busy:    "bg-error-500",
  offline: "bg-secondary-400",
};

const STATUS_LABEL: Record<AvatarStatus, string> = {
  online:  "Online",
  away:    "Away",
  busy:    "Busy",
  offline: "Offline",
};

// Background colors cycled for initials avatars (8 options)
const INITIALS_BG = [
  "bg-primary-100   text-primary-700",
  "bg-accent-100    text-accent-700",
  "bg-success-50    text-success-700",
  "bg-warning-50    text-warning-700",
  "bg-info-50       text-info-700",
  "bg-error-50      text-error-700",
  "bg-secondary-100 text-secondary-600",
  "bg-primary-200   text-primary-800",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % INITIALS_BG.length;
}

// ─── Avatar component ─────────────────────────────────────────────────────────

/**
 * Avatar — user or product image with initials fallback and status indicator.
 *
 * ```tsx
 * // Image with status
 * <Avatar src="/users/tran-van-a.jpg" name="Tran Van A" status="online" />
 *
 * // Initials fallback
 * <Avatar name="Nguyen Thi B" size="lg" />
 *
 * // Square shape (product image)
 * <Avatar src="/products/cpu.jpg" shape="square" size="xl" />
 * ```
 */
export function Avatar({
  src,
  alt,
  name = "",
  size = "md",
  shape = "circle",
  status,
  className = "",
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;
  const initials = name ? getInitials(name) : "?";
  const colorClass = INITIALS_BG[getColorIndex(name || "?")];
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-md";

  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      {/* Avatar image or initials */}
      <span
        className={[
          "inline-flex items-center justify-center overflow-hidden font-semibold",
          SIZE[size],
          shapeClass,
          showImage ? "" : colorClass,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={name || alt || "Avatar"}
        role={name && !alt ? "img" : undefined}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt ?? name}
            className="size-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </span>

      {/* Status indicator */}
      {status && (
        <span
          aria-label={STATUS_LABEL[status]}
          title={STATUS_LABEL[status]}
          className={[
            "absolute bottom-0 right-0 rounded-full ring-2 ring-white",
            STATUS_DOT_SIZE[size],
            STATUS_COLOR[status],
            shape === "square" ? "-bottom-0.5 -right-0.5" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      )}
    </span>
  );
}

// ─── AvatarGroup component ────────────────────────────────────────────────────

/**
 * AvatarGroup — stacked row of Avatars with overflow count.
 *
 * ```tsx
 * <AvatarGroup
 *   avatars={[
 *     { name: "Tran Van A", src: "/a.jpg" },
 *     { name: "Nguyen Thi B" },
 *     { name: "Le Van C" },
 *   ]}
 *   max={3}
 * />
 * ```
 */
export function AvatarGroup({ avatars, max = 4, size = "md" }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className="flex items-center">
      {visible.map((avatar, i) => (
        <span
          key={i}
          className="-ml-2 first:ml-0 ring-2 ring-white rounded-full inline-flex"
        >
          <Avatar {...avatar} size={size} />
        </span>
      ))}

      {overflow > 0 && (
        <span
          aria-label={`${overflow} more`}
          className={[
            "-ml-2 inline-flex items-center justify-center rounded-full",
            "bg-secondary-200 text-xs font-semibold text-secondary-600",
            "ring-2 ring-white",
            SIZE[size],
          ].join(" ")}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

/*
 * ─── Avatar Prop Table ────────────────────────────────────────────────────────
 *
 * Name      Type                                  Default    Description
 * ──────────────────────────────────────────────────────────────────────────────
 * src       string                                —          Image URL
 * alt       string                                —          Image alt text
 * name      string                                ""         Derives initials + bg color
 * size      "xs"|"sm"|"md"|"lg"|"xl"              "md"       Dimensions
 * shape     "circle"|"square"                     "circle"   Border radius
 * status    "online"|"away"|"busy"|"offline"       —          Status dot
 * className string                                ""         Extra classes
 *
 * ─── AvatarGroup Prop Table ───────────────────────────────────────────────────
 *
 * Name     Type          Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * avatars  AvatarProps[] required Avatar definitions
 * max      number        4        Max visible before +N badge
 * size     AvatarSize    "md"     Applied to all avatars
 */
