import {
  ShoppingBagIcon,
  StarIcon,
  GiftIcon,
  ArrowPathRoundedSquareIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { Accordion } from "@/src/components/ui/Accordion";
import type { AccordionItemDef } from "@/src/components/ui/Accordion";

// ─── How-to-earn content ──────────────────────────────────────────────────────

const EARN_ITEMS: AccordionItemDef[] = [
  {
    value: "purchase",
    label: "Mua hàng tích điểm",
    icon: <ShoppingBagIcon />,
    children: (
      <ul className="space-y-1.5 list-disc list-inside text-secondary-600">
        <li>Tích <strong>1 điểm</strong> cho mỗi <strong>10.000 VNĐ</strong> thanh toán.</li>
        <li>Điểm được cộng sau khi đơn hàng chuyển sang trạng thái <em>Đã giao</em>.</li>
        <li>Không áp dụng cho sản phẩm đã giảm giá hơn 50%.</li>
      </ul>
    ),
  },
  {
    value: "review",
    label: "Viết đánh giá sản phẩm",
    icon: <StarIcon />,
    children: (
      <ul className="space-y-1.5 list-disc list-inside text-secondary-600">
        <li>Đánh giá có nội dung (≥ 30 chữ): <strong>+50 điểm</strong>.</li>
        <li>Kèm hình ảnh hoặc video: <strong>+100 điểm</strong>.</li>
        <li>Giới hạn 1 lần / sản phẩm.</li>
      </ul>
    ),
  },
  {
    value: "birthday",
    label: "Thưởng sinh nhật",
    icon: <GiftIcon />,
    children: (
      <p className="text-secondary-600">
        Nhận <strong>500 điểm</strong> vào ngày sinh nhật của bạn (cần điền ngày sinh trong hồ sơ).
        Điểm sẽ được cộng tự động lúc 00:00 ngày sinh nhật.
      </p>
    ),
  },
  {
    value: "referral",
    label: "Giới thiệu bạn bè",
    icon: <UserGroupIcon />,
    children: (
      <ul className="space-y-1.5 list-disc list-inside text-secondary-600">
        <li>Bạn nhận <strong>200 điểm</strong> khi người được giới thiệu đặt đơn hàng đầu tiên.</li>
        <li>Người được giới thiệu nhận <strong>100 điểm</strong> sau khi đơn giao thành công.</li>
        <li>Không giới hạn số lần giới thiệu.</li>
      </ul>
    ),
  },
  {
    value: "redeem",
    label: "Đổi điểm lấy ưu đãi",
    icon: <ArrowPathRoundedSquareIcon />,
    children: (
      <ul className="space-y-1.5 list-disc list-inside text-secondary-600">
        <li><strong>100 điểm</strong> = giảm <strong>10.000 VNĐ</strong> cho đơn hàng tiếp theo.</li>
        <li>Tối đa đổi 500 điểm / đơn hàng.</li>
        <li>Điểm hết hạn sau <strong>12 tháng</strong> kể từ ngày tích.</li>
      </ul>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PointsEarnAccordion — collapsible FAQ about how to earn and use points.
 */
export function PointsEarnAccordion() {
  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-secondary-900">
        Cách tích &amp; đổi điểm
      </h2>
      <Accordion items={EARN_ITEMS} variant="separated" multiple />
    </div>
  );
}
