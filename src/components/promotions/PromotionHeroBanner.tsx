import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";
import { Badge } from "@/src/components/ui/Badge";

// ─── Banner data ───────────────────────────────────────────────────────────────
// Swap src paths when real assets are ready.

const HERO_BANNER = {
  src: "/image-slide/slide01.jpg",
  alt: "Tháng khuyến mãi — Giảm đến 40% toàn bộ danh mục",
  href: "/products",
  headline: "Tháng Khuyến Mãi",
  subline: "Giảm đến 40% toàn bộ danh mục",
  cta: "Xem tất cả ưu đãi",
};

const SUB_BANNERS = [
  {
    src: "/image-slide/slide02.png",
    alt: "PC Gaming Sale Khủng — Giảm đến 30%",
    href: "/products/pc-gaming",
    label: "PC Gaming Sale",
    badge: "-30%",
  },
  {
    src: "/image-slide/slide03.png",
    alt: "CPU Intel & AMD — Ưu đãi đặc biệt",
    href: "/products/cpu",
    label: "CPU Ưu Đãi",
    badge: null,
  },
  {
    src: "/image-slide/slide02.png",
    alt: "GPU RTX & RX — Giảm giá sốc",
    href: "/products/gpu",
    label: "GPU Giảm Giá",
    badge: "-25%",
  },
  {
    src: "/image-slide/slide03.png",
    alt: "Laptop Gaming Mới Nhất — Giá tốt nhất",
    href: "/products/laptop-gaming",
    label: "Laptop Gaming",
    badge: "Hot",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PromotionHeroBanner — featured banner layout for the /promotions page.
 *
 * Deliberately separate from the homepage HeroBanner: different data, different
 * visual hierarchy, and a more prominent CTA suited to the promotions context.
 *
 * Desktop layout (lg+):
 *   ┌────────────────────────────────────┬───────────────────┐
 *   │                                    │                   │
 *   │  Primary hero                      │   Sub-banner 1    │
 *   │  (overlay text + CTA)              │                   │
 *   │  lg:col-span-2  lg:row-span-2      ├───────────────────┤
 *   │                                    │                   │
 *   │                                    │   Sub-banner 2    │
 *   │                                    │                   │
 *   └────────────────────────────────────┴───────────────────┘
 *   ┌─────────────────────────────┬──────────────────────────┐
 *   │   Sub-banner 3              │   Sub-banner 4           │
 *   └─────────────────────────────┴──────────────────────────┘
 *
 * Responsive:
 *   Desktop  → asymmetric hero (2/3) + side stack (1/3) + 2-col bottom row
 *   Tablet   → full-width hero + 2-col bottom rows
 *   Mobile   → fully stacked, single column
 */
export function PromotionHeroBanner() {
  return (
    <section
      aria-label="Banner khuyến mãi nổi bật"
      className="py-4 max-w-[1400px] mx-auto"
    >
      <div className="flex w-full flex-col gap-3 px-4 sm:px-6 lg:px-8 2xl:px-0">

        {/* ── Row 1: Primary hero + 2 stacked sub-banners (desktop asymmetric) ── */}
        <div className="grid gap-3 lg:grid-cols-3 lg:grid-rows-[220px_220px]">

          {/* Primary hero — 2 cols wide, 2 rows tall on desktop */}
          <Link
            href={HERO_BANNER.href}
            aria-label={HERO_BANNER.alt}
            className={[
              "group relative block overflow-hidden rounded-2xl bg-secondary-200 shadow-md",
              "aspect-[21/9] lg:aspect-auto",
              "lg:col-span-2 lg:row-span-2",
            ].join(" ")}
          >
            <Image
              src={HERO_BANNER.src}
              alt={HERO_BANNER.alt}
              priority
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              quality={90}
              unoptimized
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />

            {/* Bottom-to-top dark gradient for text legibility */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-secondary-950/75 via-secondary-950/25 to-transparent"
            />

            {/* Overlay content — badge, headline, subline, CTA */}
            <div className="absolute bottom-0 left-0 flex flex-col items-start gap-2.5 p-5 sm:p-8">
              <Badge variant="error" size="sm">
                <FireIcon className="mr-1 h-3 w-3 shrink-0" aria-hidden="true" />
                Siêu Khuyến Mãi
              </Badge>

              <p className="text-2xl font-bold leading-tight text-white drop-shadow sm:text-4xl">
                {HERO_BANNER.headline}
              </p>

              <p className="text-sm text-white/80 drop-shadow-sm sm:text-lg">
                {HERO_BANNER.subline}
              </p>

              {/* Styled as a button but kept as <span> — the <Link> is the interactive element */}
              <span
                className={[
                  "mt-1 inline-flex items-center gap-1.5 rounded-lg",
                  "bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm",
                  "transition-all duration-200 group-hover:bg-primary-700 group-hover:gap-2.5",
                ].join(" ")}
              >
                {HERO_BANNER.cta}
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </Link>

          {/* Sub-banners 1 & 2 — auto-placed into right column on desktop */}
          {SUB_BANNERS.slice(0, 2).map((banner) => (
            <Link
              key={banner.href}
              href={banner.href}
              aria-label={banner.alt}
              className={[
                "group relative block overflow-hidden rounded-2xl bg-secondary-200 shadow-sm",
                "aspect-[16/7] lg:aspect-auto",
              ].join(" ")}
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                quality={85}
                unoptimized
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-secondary-950/55 to-transparent"
              />

              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-3">
                <span className="text-sm font-semibold text-white drop-shadow-sm">
                  {banner.label}
                </span>
                {banner.badge && (
                  <Badge variant="error" size="sm">
                    {banner.badge}
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* ── Row 2: Sub-banners 3 & 4 — equal two-column row ── */}
        <div className="grid grid-cols-2 gap-3">
          {SUB_BANNERS.slice(2).map((banner) => (
            <Link
              key={banner.href}
              href={banner.href}
              aria-label={banner.alt}
              className="group relative block aspect-[16/7] overflow-hidden rounded-2xl bg-secondary-200 shadow-sm"
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                quality={85}
                unoptimized
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-secondary-950/55 to-transparent"
              />

              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-3 sm:p-4">
                <span className="text-sm font-semibold text-white drop-shadow-sm">
                  {banner.label}
                </span>
                {banner.badge && (
                  <Badge variant="error" size="sm">
                    {banner.badge}
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
