import NextImage from "next/image";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImageRatio = "square" | "video" | "wide" | "portrait";
export type ImageRounded = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  /** Aspect-ratio wrapper — triggers fill mode automatically */
  ratio?: ImageRatio;
  rounded?: ImageRounded;
  /** Object-fit applied to the <img> element */
  fit?: "cover" | "contain";
  /** Absolutely-positioned overlay rendered inside the container */
  overlay?: ReactNode;
  /** Caption rendered below the image wrapper */
  caption?: string;
  /** Extra className applied to the <img> element */
  className?: string;
  /** Extra className applied to the outer wrapper div */
  containerClassName?: string;
}

// ─── Maps ─────────────────────────────────────────────────────────────────────

const RATIO_CLASS: Record<ImageRatio, string> = {
  square:   "aspect-square",
  video:    "aspect-video",
  wide:     "aspect-[2/1]",
  portrait: "aspect-[3/4]",
};

const ROUNDED_CLASS: Record<ImageRounded, string> = {
  none:  "",
  sm:    "rounded-sm",
  md:    "rounded-md",
  lg:    "rounded-lg",
  xl:    "rounded-xl",
  "2xl": "rounded-2xl",
  full:  "rounded-full",
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Image — convenience wrapper around next/image.
 *
 * - Pass `fill` or `ratio` to enable fill mode with an aspect-ratio container.
 * - Pass `width` + `height` to render a fixed-size image directly.
 * - `overlay` renders an absolutely-positioned layer inside the container.
 * - `caption` renders a small text line below the image.
 *
 * Named export to avoid clashing with next/image's default export.
 *
 * ```tsx
 * <Image src="/hero.jpg" alt="Hero" ratio="video" rounded="xl" />
 * <Image src="/thumb.jpg" alt="Product" width={200} height={200} rounded="md" />
 * ```
 */
export function Image({
  src,
  alt,
  width,
  height,
  fill,
  priority,
  ratio,
  rounded = "none",
  fit = "cover",
  overlay,
  caption,
  className = "",
  containerClassName = "",
}: ImageProps) {
  const roundedClass = ROUNDED_CLASS[rounded];
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";

  const useContainer = fill || ratio != null;

  if (useContainer) {
    const ratioClass = ratio ? RATIO_CLASS[ratio] : "";
    const containerCls = [
      "relative overflow-hidden",
      ratioClass,
      roundedClass,
      containerClassName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <>
        <div className={containerCls}>
          <NextImage
            src={src}
            alt={alt}
            fill
            priority={priority}
            className={[fitClass, className].filter(Boolean).join(" ")}
          />
          {overlay && (
            <div className="absolute inset-0">{overlay}</div>
          )}
        </div>
        {caption && (
          <p className="mt-1.5 text-center text-xs text-secondary-500">{caption}</p>
        )}
      </>
    );
  }

  // Fixed width + height mode
  const imgCls = [roundedClass, className].filter(Boolean).join(" ");

  return (
    <>
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={imgCls || undefined}
      />
      {caption && (
        <p className="mt-1.5 text-center text-xs text-secondary-500">{caption}</p>
      )}
    </>
  );
}
