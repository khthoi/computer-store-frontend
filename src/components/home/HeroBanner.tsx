import Image from "next/image";
import Link from "next/link";

// ─── Banner data ───────────────────────────────────────────────────────────────
// Swap src paths when real assets are ready.

const MAIN_BANNER = {
  src: "/image-slide/slide01.jpg",
  alt: "Khuyến mãi tháng 3 — Giảm đến 30%",
  href: "/promotions",
};

const PROMO_BANNERS = [
  {
    src: "/image-slide/slide02.png",
    alt: "PC Gaming Chiến Đỉnh — Sale khủng",
    href: "/products/pc-gaming",
    label: "PC Gaming Sale",
  },
  {
    src: "/image-slide/slide03.png",
    alt: "CPU Intel & AMD Bán Chạy",
    href: "/products/cpu",
    label: "CPU Bán Chạy",
  },
  {
    src: "/image-slide/slide02.png",
    alt: "GPU Giảm Giá Sốc — RTX & RX",
    href: "/products/gpu",
    label: "GPU Giảm Giá",
  },
  {
    src: "/image-slide/slide03.png",
    alt: "Laptop Gaming Mới Nhất 2024",
    href: "/products/laptop-gaming",
    label: "Laptop Gaming",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * HeroBanner — static hero layout replacing the previous slider.
 *
 * Layout:
 *   ┌──────────────────────────────────┐
 *   │         Large hero banner        │  ← full width, 21:7 ratio
 *   └──────────────────────────────────┘
 *   ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
 *   │ Promo │ │ Promo │ │ Promo │ │ Promo │  ← 4 equal columns
 *   └───────┘ └───────┘ └───────┘ └───────┘
 *
 * Responsive:
 *   Desktop  → 4 promos per row
 *   Tablet   → 2 promos per row
 *   Mobile   → 1 promo per row
 */
export function HeroBanner() {
  return (
    <section aria-label="Banner khuyến mãi" className="bg-secondary-50 py-4 max-w-[1400px] mx-auto flex items-center">
      <div className="w-full 2xl:max-w-full px-4 sm:px-6 lg:px-8 2xl:px-0">
        <div className="flex flex-col gap-3">

          {/* ── Large hero banner ── */}
          <Link
            href={MAIN_BANNER.href}
            className="group relative block w-full overflow-hidden rounded-xl aspect-[21/7] bg-secondary-200 shadow-sm"
          >
            <Image
              src={MAIN_BANNER.src}
              alt={MAIN_BANNER.alt}
              priority
              fill
              sizes="(max-width: 1400px) 100vw, 1400px"
              quality={90}
              unoptimized
              className="object-obtain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          </Link>

          {/* ── 4 promotional banners ── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROMO_BANNERS.map((banner) => (
              <Link
                key={banner.href + banner.label}
                href={banner.href}
                aria-label={banner.alt}
                className="group relative block overflow-hidden rounded-xl aspect-[4/3] bg-secondary-200 shadow-sm"
              >
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  fill
                  quality={90}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
