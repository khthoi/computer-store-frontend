"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, PaperClipIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { ToastMessage } from "@/src/components/ui/Toast";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Lightbox, type LightboxItem } from "@/src/components/ui/Lightbox";
import { TicketStatusBadge } from "@/src/components/account/support/TicketStatusBadge";
import {
  TICKET_CATEGORY_LABELS,
  type SupportTicket,
  type TicketAttachment,
  type TicketMessage,
} from "@/src/app/(storefront)/account/support/_mock_data";

// ─── Constants ────────────────────────────────────────────────────────────────

// Approx pixel height of one line at text-sm (14px) × leading-normal (1.5) + py-2.5 (20px)
const TEXTAREA_LINE_H = 21; // px per line
const TEXTAREA_PADDING_V = 20; // px (py-2.5 top + bottom)
const TEXTAREA_1_LINE = TEXTAREA_LINE_H + TEXTAREA_PADDING_V; // 41px
const TEXTAREA_5_LINES = TEXTAREA_LINE_H * 5 + TEXTAREA_PADDING_V; // 125px

// Max thumbnails displayed before "+N more" overlay
const MAX_VISIBLE_THUMBNAILS = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function attachmentsToLightboxItems(attachments: TicketAttachment[]): LightboxItem[] {
  return attachments.map((a) => ({
    key: a.id,
    src: a.url,
    alt: a.name,
  }));
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketDetailPageInnerProps {
  ticket: SupportTicket;
}

// ─── Sub-component: attachment thumbnail grid ─────────────────────────────────

function AttachmentGrid({
  attachments,
  onOpen,
}: {
  attachments: TicketAttachment[];
  /** Called with all lightbox items and the index of the clicked thumbnail */
  onOpen: (items: LightboxItem[], startIndex: number) => void;
}) {
  const items = attachmentsToLightboxItems(attachments);
  const visible = items.slice(0, MAX_VISIBLE_THUMBNAILS);
  const overflow = items.length - MAX_VISIBLE_THUMBNAILS;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((item, idx) => {
        const isLast = idx === visible.length - 1 && overflow > 0;
        return (
          <button
            key={item.key}
            type="button"
            aria-label={isLast ? `Xem tất cả ${items.length} ảnh` : `Xem ảnh ${item.alt}`}
            onClick={() => onOpen(items, idx)}
            className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-secondary-200 bg-secondary-100 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt=""
              className="h-full w-full object-cover"
            />
            {/* "+N more" overlay on the last visible thumbnail */}
            {isLast && (
              <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-secondary-900/60 text-sm font-semibold text-white">
                +{overflow + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Sub-component: message bubble ────────────────────────────────────────────

function MessageBubble({
  message,
  onImageOpen,
}: {
  message: TicketMessage;
  onImageOpen: (items: LightboxItem[], startIndex: number) => void;
}) {
  const isCustomer = message.role === "customer";
  const hasAttachments = (message.attachments?.length ?? 0) > 0;

  return (
    <div className={["flex gap-3", isCustomer ? "justify-end" : "justify-start"].join(" ")}>
      {/* Staff avatar */}
      {!isCustomer && (
        <div className="h-8 w-8 shrink-0 rounded-full bg-secondary-200 flex items-center justify-center mt-1">
          <UserIcon className="h-4 w-4 text-secondary-500" aria-hidden="true" />
        </div>
      )}

      {/*
        Content column:
        - max-w-[65%] is relative to the flex row (the correct containing block),
          so it correctly caps long messages at 65% of the thread width.
        - The bubble inside uses w-fit to shrink to content for short messages.
      */}
      <div
        className={[
          "flex flex-col gap-2 max-w-[65%]",
          isCustomer ? "items-end" : "items-start",
        ].join(" ")}
      >
        {/* Text bubble — Tooltip shows timestamp on hover */}
        {message.content && (
          <Tooltip
            content={formatDateTime(message.sentAt)}
            placement={isCustomer ? "left" : "right"}
            delay={300}
          >
            <div
              className={[
                "w-fit break-words rounded-2xl px-4 py-3",
                isCustomer
                  ? "rounded-tr-sm bg-primary-600 text-white"
                  : "rounded-tl-sm bg-white border border-secondary-200",
              ].join(" ")}
            >
              <p
                className={[
                  "text-sm leading-relaxed whitespace-pre-wrap",
                  isCustomer ? "text-white" : "text-secondary-800",
                ].join(" ")}
              >
                {message.content}
              </p>
            </div>
          </Tooltip>
        )}

        {/* Attachment thumbnails — rendered below the text bubble */}
        {hasAttachments && (
          <AttachmentGrid
            attachments={message.attachments!}
            onOpen={onImageOpen}
          />
        )}

        {/* Timestamp shown directly when there's no text (attachments-only message) */}
        {!message.content && hasAttachments && (
          <span className="text-[10px] text-secondary-400 px-1">
            {formatDateTime(message.sentAt)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TicketDetailPageInner — client root for /account/support/[ticketId].
 *
 * Chat-style message thread. Timestamps shown via Tooltip on bubble hover.
 * Reply area: [📎] [auto-resize textarea, 1–5 lines] [Gửi]
 * Images in messages open a full-screen Lightbox with navigation.
 */
export function TicketDetailPageInner({ ticket }: TicketDetailPageInnerProps) {
  const [localMessages, setLocalMessages] = useState<TicketMessage[]>(ticket.messages);
  const [localStatus, setLocalStatus] = useState(ticket.status);

  // Reply form
  const [replyContent, setReplyContent] = useState("");
  const [replyError, setReplyError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);

  // Resolve action
  const [isResolving, setIsResolving] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "info";
  }>({ visible: false, message: "", type: "success" });

  // Attachments (reply composer)
  const [attachments, setAttachments] = useState<File[]>([]);
  // Object URLs for image preview — revoked on cleanup to avoid memory leaks
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = attachments.map((f) =>
      f.type.startsWith("image/") ? URL.createObjectURL(f) : ""
    );
    setPreviewUrls(urls);
    return () => urls.forEach((u) => u && URL.revokeObjectURL(u));
  }, [attachments]);

  const handleFilesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = Array.from(e.target.files ?? []);
      if (picked.length === 0) return;
      setAttachments((prev) => [...prev, ...picked]);
      // Reset input so the same file can be re-attached after removal
      e.target.value = "";
    },
    []
  );

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Lightbox state: null = closed; otherwise holds the image set + starting index
  const [lightbox, setLightbox] = useState<{
    items: LightboxItem[];
    index: number;
  } | null>(null);

  const openLightbox = useCallback((items: LightboxItem[], index: number) => {
    setLightbox({ items, index });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  // ── scrollToBottom ──────────────────────────────────────────────────────────
  //
  // Scrolls the message thread to the most recent message.
  //
  // This function is intentionally decoupled from any specific event so it can
  // be called from multiple sites:
  //   • initial render (via useEffect on localMessages)
  //   • after the user sends a reply (handleSendReply)
  //   • after receiving a real-time push — e.g. a WebSocket / Firebase listener
  //     can call `scrollToBottom()` directly whenever a new message arrives
  //     without needing to touch any other part of the component.
  //
  const scrollToBottom = useCallback(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  // Scroll on every new message (initial load + appended messages)
  useEffect(() => {
    scrollToBottom();
  }, [localMessages, scrollToBottom]);

  // ── Textarea auto-resize ────────────────────────────────────────────────────

  const resizeTextarea = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, TEXTAREA_5_LINES);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > TEXTAREA_5_LINES ? "auto" : "hidden";
  }, []);

  const resetTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = `${TEXTAREA_1_LINE}px`;
    el.style.overflowY = "hidden";
  }, []);

  const handleReplyChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setReplyContent(e.target.value);
      resizeTextarea(e.target);
    },
    [resizeTextarea]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleMarkResolved = useCallback(async () => {
    setIsResolving(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 600));
      setLocalStatus("resolved");
      setToast({
        visible: true,
        message: "Yêu cầu đã được đánh dấu là đã giải quyết.",
        type: "success",
      });
    } finally {
      setIsResolving(false);
    }
  }, []);

  const handleSendReply = useCallback(async () => {
    // Attachments count as valid content — only block if both are empty
    if (!replyContent.trim() && attachments.length === 0) {
      setReplyError("Vui lòng nhập nội dung trả lời.");
      return;
    }
    setReplyError(undefined);
    setIsSending(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 600));

      const newMsg: TicketMessage = {
        id: crypto.randomUUID(),
        role: "customer",
        content: replyContent.trim(),
        sentAt: new Date().toISOString(),
        // In a real app the server would handle upload; here we store object URLs
        // so the freshly sent images render immediately in the thread.
        attachments:
          attachments.length > 0
            ? attachments.map((f, i) => ({
                id: crypto.randomUUID(),
                url: previewUrls[i] || "",
                name: f.name,
              }))
            : undefined,
      };

      setLocalMessages((prev) => [...prev, newMsg]);
      setReplyContent("");
      setAttachments([]);
      resetTextarea();
      // Scroll after React has flushed the new message into the DOM.
      // Also the natural entry-point for WebSocket/Firebase: call scrollToBottom()
      // inside your real-time listener after updating localMessages.
      setTimeout(scrollToBottom, 0);
      setToast({ visible: true, message: "Tin nhắn đã được gửi.", type: "success" });
    } finally {
      setIsSending(false);
    }
  }, [replyContent, attachments, previewUrls, resetTextarea, scrollToBottom]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col">
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-secondary-100">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ChevronLeftIcon />}
            onClick={() => window.history.back()}
          >
            Hỗ trợ
          </Button>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="font-mono text-lg font-bold text-secondary-900">
                {ticket.id}
              </p>
              <p className="text-sm text-secondary-500">{ticket.subject}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <TicketStatusBadge status={localStatus} />
                <Badge variant="default" size="sm">
                  {TICKET_CATEGORY_LABELS[ticket.category]}
                </Badge>
              </div>
            </div>

            {/* Mark resolved button — only while in_progress */}
            {localStatus === "in_progress" && (
              <Button
                variant="outline"
                size="sm"
                isLoading={isResolving}
                disabled={isResolving}
                onClick={handleMarkResolved}
              >
                Đánh dấu đã giải quyết
              </Button>
            )}
          </div>
        </div>

        {/* ── Message thread ────────────────────────────────────────────────── */}
        <div ref={threadRef} className="px-6 max-h-[480px] overflow-y-auto flex flex-col gap-4 py-4">
          {localMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onImageOpen={openLightbox}
            />
          ))}
        </div>

        {/* ── Reply section / resolved banner ───────────────────────────────── */}
        {localStatus === "in_progress" ? (
          <div className="px-6 pt-4 pb-7 border-t border-secondary-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary-400 mb-2">
              Trả lời
            </p>

            {/* ── Attachment previews — shown above the reply row ── */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attachments.map((file, i) => (
                  <div
                    key={i}
                    className="relative h-16 w-16 rounded-lg border border-secondary-200 bg-secondary-50 overflow-hidden"
                  >
                    {previewUrls[i] ? (
                      <Image
                        src={previewUrls[i]}
                        alt={file.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      /* Non-image file: show filename */
                      <span className="flex h-full w-full items-center justify-center p-1 text-center text-[9px] leading-tight text-secondary-500 break-all">
                        {file.name}
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`Xóa tệp ${file.name}`}
                      onClick={() => removeAttachment(i)}
                      className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary-800/70 text-white hover:bg-secondary-900 transition-colors"
                    >
                      <XMarkIcon className="h-2.5 w-2.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 my-auto">
              {/* Attachment icon button */}
              <Tooltip content="Đính kèm tệp" placement="top">
                <button
                  type="button"
                  aria-label="Đính kèm tệp"
                  disabled={isSending}
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 p-2 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <PaperClipIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </Tooltip>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="sr-only"
                tabIndex={-1}
                onChange={handleFilesChange}
              />

              {/* Textarea + error
                  `relative` on the wrapper lets the error use absolute
                  positioning so it floats below without affecting the flex row
                  height — no layout shift on the attachment icon or send button. */}
              <div className="flex-1 relative min-w-0 flexaaa my-auto">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder="Nhập nội dung trả lời..."
                  value={replyContent}
                  disabled={isSending}
                  onChange={handleReplyChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  aria-invalid={replyError ? true : undefined}
                  style={{
                    height: `${TEXTAREA_1_LINE}px`,
                    overflowY: "hidden",
                  }}
                  className={[
                    "w-full rounded border bg-white px-3 py-2.5 text-sm",
                    "text-secondary-700 placeholder:text-secondary-400",
                    "resize-none transition-colors duration-150",
                    "focus:outline-none focus:ring-2",
                    "disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-400",
                    replyError
                      ? "border-error-400 focus:border-error-500 focus:ring-error-500/15"
                      : "border-secondary-300 focus:border-primary-500 focus:ring-primary-500/15",
                  ].join(" ")}
                />
                {replyError && (
                  <p
                    role="alert"
                    className="absolute left-0 top-full mt-1 text-xs text-error-600 whitespace-nowrap"
                  >
                    {replyError}
                  </p>
                )}
              </div>

              {/* Send button */}
              <Button
                variant="primary"
                size="md"
                isLoading={isSending}
                disabled={isSending}
                onClick={handleSendReply}
                className="shrink-0 my-auto"
              >
                Gửi
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4 text-center text-sm text-secondary-400 border-t border-secondary-100">
            Yêu cầu này đã được giải quyết.
          </div>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
      {lightbox && (
        <Lightbox
          items={lightbox.items}
          activeIndex={lightbox.index}
          onClose={closeLightbox}
          onNavigate={(index) => setLightbox((prev) => prev && { ...prev, index })}
        />
      )}

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      <ToastMessage
        isVisible={toast.visible}
        type={toast.type}
        message={toast.message}
        position="bottom-right"
        duration={4000}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </>
  );
}
