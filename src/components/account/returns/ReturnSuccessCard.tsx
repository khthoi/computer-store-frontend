import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReturnSuccessCardProps {
  /** e.g. "YC-284731" — displayed to the user and used in the tracking link */
  returnRequestId: string;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const LINK_PRIMARY_MD =
  "inline-flex items-center justify-center gap-2 font-medium rounded transition-all duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 " +
  "h-10 px-4 text-sm bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800";

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ReturnSuccessCard — shown after a return request is submitted successfully.
 * Displays the generated request ID and navigation links.
 */
export function ReturnSuccessCard({ returnRequestId }: ReturnSuccessCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 px-6 text-center">
      {/* Icon */}
      <CheckCircleIcon
        className="h-16 w-16 text-success-500"
        aria-hidden="true"
      />

      {/* Heading */}
      <h2 className="text-xl font-bold text-secondary-900">
        Yêu cầu đã được gửi!
      </h2>

      {/* Request ID */}
      <p className="text-sm text-secondary-600">
        Mã yêu cầu của bạn:{" "}
        <span className="font-mono font-bold text-primary-700">
          {returnRequestId}
        </span>
      </p>

      {/* Support note */}
      <p className="max-w-xs text-sm text-secondary-500">
        Đội ngũ CSKH sẽ liên hệ và xử lý yêu cầu trong vòng{" "}
        <span className="font-medium">1–2 ngày làm việc</span>.
      </p>

      {/* Primary CTA */}
      <Link href={`/account/returns/${returnRequestId}`} className={LINK_PRIMARY_MD}>
        Theo dõi yêu cầu
      </Link>

      {/* Secondary link */}
      <Link
        href="/account/returns"
        className="text-sm text-primary-600 underline underline-offset-2 hover:text-primary-700"
      >
        Tất cả yêu cầu đổi/trả
      </Link>
    </div>
  );
}
