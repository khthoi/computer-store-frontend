import Link from "next/link";
import { FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa";

// ─── Social icon SVGs ─────────────────────────────────────────────────────────

function FacebookIcon({ className }: { className?: string }) {
  return (
    <FaFacebookF className={className} />
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <FaYoutube className={className} />
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <FaTiktok className={className} />
  );
}

// ─── Payment badge ─────────────────────────────────────────────────────────────

function PaymentBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded border border-white/20 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-wide",
        color,
      ].join(" ")}
      aria-label={`Thanh toán qua ${label}`}
    >
      {label}
    </span>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SUPPORT_LINKS = [
  { label: "Hướng dẫn mua hàng",   href: "/huong-dan-mua-hang" },
  { label: "Chính sách bảo hành",   href: "/chinh-sach-bao-hanh" },
  { label: "Chính sách đổi trả",    href: "/chinh-sach-doi-tra" },
  { label: "Câu hỏi thường gặp",    href: "/faq" },
  { label: "Hỗ trợ kỹ thuật",       href: "/support/technical" },
];

const CATEGORY_LINKS = [
  { label: "Laptop",      href: "/products/laptop" },
  { label: "PC Gaming",   href: "/products/pc-gaming" },
  { label: "CPU",         href: "/products/cpu" },
  { label: "GPU",         href: "/products/gpu" },
  { label: "RAM",         href: "/products/ram" },
  { label: "SSD",         href: "/products/ssd" },
  { label: "Màn Hình",    href: "/products/man-hinh" },
  { label: "Bàn Phím",    href: "/products/ban-phim" },
  { label: "Chuột",       href: "/products/chuot" },
  { label: "Tai Nghe",    href: "/products/tai-nghe" },
];

const COMPANY_LINKS = [
  { label: "Về chúng tôi",    href: "/about" },
  { label: "Tuyển dụng",      href: "/careers" },
  { label: "Liên hệ",         href: "/contact" },
];

const SOCIAL_LINKS = [
  { label: "Facebook",  href: "https://facebook.com", Icon: FacebookIcon,  hoverClass: "hover:text-blue-400 hover:border-blue-400/40" },
  { label: "YouTube",   href: "https://youtube.com",  Icon: YouTubeIcon,   hoverClass: "hover:text-red-400 hover:border-red-400/40" },
  { label: "TikTok",    href: "https://tiktok.com",   Icon: TikTokIcon,    hoverClass: "hover:text-white hover:border-white/40" },
];

const PAYMENT_METHODS = [
  { label: "VISA",        color: "text-blue-400" },
  { label: "Mastercard",  color: "text-orange-400" },
  { label: "MoMo",        color: "text-pink-400" },
  { label: "VNPay",       color: "text-blue-300" },
  { label: "COD",         color: "text-green-400" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-white/90">
      {children}
    </h3>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("http");
  return (
    <li>
      <Link
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-sm text-white/60 transition-colors hover:text-white hover:underline underline-offset-2 decoration-white/30"
      >
        {children}
      </Link>
    </li>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="bg-secondary-900 text-secondary-400">

      {/* ── Main footer grid ── */}
      <div className="mx-auto max-w-[1450px] flex px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-y-10 gap-x-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* ── Column 1: Store info ── */}
          <div>
            {/* Logo */}
            <Link href="/" className="mb-5 flex items-center gap-2.5 focus-visible:outline-none">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-extrabold shadow-md">
                PC
              </div>
              <span className="text-base font-extrabold text-white">
                Tech<span className="text-primary-400">Store</span>
              </span>
            </Link>

            <p className="mb-5 text-sm leading-relaxed text-white/60">
              Cửa hàng linh kiện máy tính & laptop chính hãng. Đa dạng sản phẩm từ CPU,
              GPU, RAM, SSD đến laptop gaming và phụ kiện công nghệ.
            </p>

            {/* Hotline card */}
            <div className="mb-5 rounded-lg bg-white/5 p-3 border border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-1">
                Hotline hỗ trợ
              </p>
              <a
                href="tel:19001234"
                className="block text-base font-bold text-primary-400 hover:text-primary-300 transition-colors"
              >
                1900 1234
              </a>
              <p className="text-xs text-white/50 mt-0.5">
                Thứ 2 – CN, 08:00 – 21:00
              </p>
            </div>

            {/* Company links */}
            <FooterHeading>Công ty</FooterHeading>
            <ul className="flex flex-col gap-2">
              {COMPANY_LINKS.map((link) => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* ── Column 2: Customer support ── */}
          <div>
            <FooterHeading>Hỗ trợ khách hàng</FooterHeading>
            <ul className="flex flex-col gap-2.5">
              {SUPPORT_LINKS.map((link) => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Product categories ── */}
          <div>
            <FooterHeading>Danh mục sản phẩm</FooterHeading>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-1">
              {CATEGORY_LINKS.map((link) => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Contact & social ── */}
          <div>
            <FooterHeading>Liên hệ</FooterHeading>

            <address className="not-italic flex flex-col gap-3.5 text-sm mb-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40 mb-1">Địa chỉ</p>
                <p className="text-white/60">123 Nguyễn Văn Linh, Q.7</p>
                <p className="text-white/60">TP. Hồ Chí Minh</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40 mb-1">Email</p>
                <a
                  href="mailto:support@techstore.vn"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  support@techstore.vn
                </a>
              </div>
            </address>

            {/* Social */}
            <FooterHeading>Theo dõi chúng tôi</FooterHeading>
            <div className="flex items-center gap-2.5 mb-6">
              {SOCIAL_LINKS.map(({ label, href, Icon, hoverClass }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/50 transition-all hover:bg-white/10",
                    hoverClass,
                  ].join(" ")}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Certificates */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-white/40">
                Chứng nhận
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] text-white/40">
                <span className="rounded border border-white/15 px-2 py-0.5">DMCA Protected</span>
                <span className="rounded border border-white/15 px-2 py-0.5">SSL Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom strip ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">

            {/* Copyright + legal */}
            <p className="text-xs text-white/40 text-center sm:text-left my-auto">
              © {new Date().getFullYear()} TechStore Vietnam. All rights reserved.{" "}
              <Link href="/privacy" className="hover:text-white/70 transition-colors">Chính sách bảo mật</Link>
              {" · "}
              <Link href="/terms" className="hover:text-white/70 transition-colors">Điều khoản dịch vụ</Link>
            </p>

            {/* Payment methods — center on all sizes */}
            <div
              className="flex flex-wrap justify-center items-center gap-2"
              aria-label="Phương thức thanh toán"
            >
              {PAYMENT_METHODS.map(({ label, color }) => (
                <PaymentBadge key={label} label={label} color={color} />
              ))}
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
