"use client";

import { useCallback, useState } from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Select";
import { Tabs, TabPanel, type TabItem } from "@/src/components/ui/Tabs";
import { ToastMessage } from "@/src/components/ui/Toast";
import { ReturnFileUpload } from "@/src/components/account/returns/ReturnFileUpload";
import { TicketCard } from "@/src/components/account/support/TicketCard";
import {
  TICKET_CATEGORY_OPTIONS,
  type SupportTicket,
  type TicketStatus,
} from "@/src/app/(storefront)/account/support/_mock_data";
import type { FilePreview } from "@/src/app/(storefront)/account/returns/_mock_data";
import type { SelectOption } from "@/src/components/ui/Select";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  subject?: string;
  category?: string;
  content?: string;
}

export interface SupportPageInnerProps {
  tickets: SupportTicket[];
  orderOptions: SelectOption[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabCountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="rounded-full bg-secondary-100 px-1.5 py-0.5 text-[11px] font-semibold text-secondary-600 leading-none">
      {count}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <ChatBubbleLeftRightIcon className="h-12 w-12 text-secondary-300" aria-hidden="true" />
      <p className="text-base font-semibold text-secondary-700">
        Bạn chưa có yêu cầu hỗ trợ nào
      </p>
      <p className="text-sm text-secondary-400">
        Điền vào biểu mẫu bên cạnh để tạo yêu cầu mới.
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SupportPageInner — client root for /account/support.
 *
 * Two-column layout on desktop (form left, ticket list right),
 * stacked single column on mobile.
 */
export function SupportPageInner({ tickets, orderOptions }: SupportPageInnerProps) {
  // ── Ticket list state ──────────────────────────────────────────────────────
  const [localTickets, setLocalTickets] = useState<SupportTicket[]>(tickets);
  const [activeTab, setActiveTab] = useState<TicketStatus>("in_progress");

  // ── Form state ─────────────────────────────────────────────────────────────
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [orderId, setOrderId] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: "",
  });

  // ── Filtering ──────────────────────────────────────────────────────────────
  const inProgressTickets = localTickets.filter((t) => t.status === "in_progress");
  const resolvedTickets = localTickets.filter((t) => t.status === "resolved");

  const tabItems: TabItem[] = [
    {
      value: "in_progress",
      label: (
        <span className="flex items-center gap-1.5">
          Đang xử lý
          <TabCountBadge count={inProgressTickets.length} />
        </span>
      ),
    },
    {
      value: "resolved",
      label: (
        <span className="flex items-center gap-1.5">
          Đã giải quyết
          <TabCountBadge count={resolvedTickets.length} />
        </span>
      ),
    },
  ];

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!subject.trim()) newErrors.subject = "Chủ đề không được để trống.";
    if (!category) newErrors.category = "Vui lòng chọn danh mục.";
    if (content.trim().length < 50)
      newErrors.content = "Nội dung phải có ít nhất 50 ký tự.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [subject, category, content]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));

      const now = new Date().toISOString();
      const newTicket: SupportTicket = {
        id: `CS-${Date.now().toString().slice(-5)}`,
        subject: subject.trim(),
        category: category as SupportTicket["category"],
        orderId: orderId || undefined,
        status: "in_progress",
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: crypto.randomUUID(),
            role: "customer",
            content: content.trim(),
            sentAt: now,
          },
        ],
      };

      // Prepend so it appears at top of the in_progress tab
      setLocalTickets((prev) => [newTicket, ...prev]);

      // Reset form
      setSubject("");
      setCategory("");
      setOrderId("");
      setContent("");
      setFiles([]);
      setErrors({});

      // Switch to in_progress tab so user sees their new ticket
      setActiveTab("in_progress");

      setToast({ visible: true, message: "Yêu cầu hỗ trợ đã được gửi thành công!" });
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, subject, category, orderId, content]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* ── New Ticket Form ──────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-secondary-200 bg-white">
          <div className="border-b border-secondary-100 px-6 py-5">
            <h2 className="text-base font-bold text-secondary-900">
              Tạo yêu cầu hỗ trợ mới
            </h2>
          </div>

          <div className="px-6 py-5">
            <div className="flex flex-col gap-4">
              {/* Subject */}
              <Input
                label="Chủ đề"
                placeholder="Mô tả ngắn gọn vấn đề của bạn"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
                errorMessage={errors.subject}
              />

              {/* Category */}
              <Select
                label="Danh mục"
                options={TICKET_CATEGORY_OPTIONS}
                value={category}
                onChange={(v) => setCategory(v as string)}
                placeholder="Chọn danh mục..."
                errorMessage={errors.category}
              />

              {/* Related order (optional) */}
              <Select
                label="Đơn hàng liên quan"
                options={orderOptions}
                value={orderId}
                onChange={(v) => setOrderId(v as string)}
                placeholder="Chọn đơn hàng (nếu có)"
                clearable
              />

              {/* Content */}
              <Textarea
                label="Nội dung"
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                showCharCount
                maxCount={2000}
                autoResize
                rows={5}
                errorMessage={errors.content}
              />

              {/* Attachments */}
              <ReturnFileUpload
                files={files}
                onChange={setFiles}
                maxFiles={5}
              />

              {/* Submit */}
              <Button
                variant="primary"
                fullWidth
                isLoading={isSubmitting}
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                Gửi yêu cầu
              </Button>
            </div>
          </div>
        </div>

        {/* ── Ticket List ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-secondary-200 bg-white">
          <div className="border-b border-secondary-100 px-6 py-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-secondary-900">
              Yêu cầu của tôi
              <TabCountBadge count={localTickets.length} />
            </h2>
          </div>

          {/* Tabs */}
          <div className="border-b border-secondary-100 px-2 overflow-x-auto">
            <Tabs
              tabs={tabItems}
              value={activeTab}
              onChange={(v) => setActiveTab(v as TicketStatus)}
              variant="line"
            >
              <TabPanel value="in_progress" className="px-6 py-5">
                {inProgressTickets.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ul className="flex flex-col gap-4">
                    {inProgressTickets.map((ticket) => (
                      <li key={ticket.id}>
                        <TicketCard ticket={ticket} />
                      </li>
                    ))}
                  </ul>
                )}
              </TabPanel>

              <TabPanel value="resolved" className="px-6 py-5">
                {resolvedTickets.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ul className="flex flex-col gap-4">
                    {resolvedTickets.map((ticket) => (
                      <li key={ticket.id}>
                        <TicketCard ticket={ticket} />
                      </li>
                    ))}
                  </ul>
                )}
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      <ToastMessage
        isVisible={toast.visible}
        type="success"
        message={toast.message}
        position="bottom-right"
        duration={4000}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </>
  );
}
