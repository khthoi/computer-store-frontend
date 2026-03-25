"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Textarea } from "@/src/components/ui/Textarea";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import type { AdminStatus } from "@/src/components/admin/StatusBadge";
import { TicketMetaPanel } from "./TicketMetaPanel";
import type { TicketMeta } from "./TicketMetaPanel";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketMessage {
  id: string;
  role: "customer" | "staff";
  authorName: string;
  authorAvatarUrl?: string;
  text: string;
  attachments?: string[];
  timestamp: string;
}

interface TicketDetailViewProps {
  ticket: {
    id: string;
    subject: string;
    status: string;
    priority: string;
    messages: TicketMessage[];
  };
  meta: TicketMeta;
  onReply: (text: string) => void | Promise<void>;
  onStatusChange: (status: string) => void;
  onMetaChange: (field: string, value: string | string[]) => void;
  staffOptions?: { value: string; label: string }[];
  isSending?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const VALID_STATUSES: AdminStatus[] = [
  "active", "inactive", "pending", "suspended", "draft",
  "published", "archived", "approved", "rejected", "review",
  "online", "offline",
];

function toAdminStatus(s: string): AdminStatus {
  if ((VALID_STATUSES as string[]).includes(s)) return s as AdminStatus;
  return "pending";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TicketDetailView — two-column chat + metadata layout for a support ticket.
 */
export function TicketDetailView({
  ticket,
  meta,
  onReply,
  onStatusChange,
  onMetaChange,
  staffOptions = [],
  isSending = false,
}: TicketDetailViewProps) {
  const [replyText, setReplyText] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [ticket.messages]);

  async function handleSend() {
    if (!replyText.trim() || isSending) return;
    await onReply(replyText.trim());
    setReplyText("");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      {/* ── Left: chat panel ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-secondary-900 truncate">
              {ticket.subject}
            </h1>
            <p className="text-xs text-secondary-400 mt-0.5">
              #{ticket.id}
            </p>
          </div>
          <StatusBadge status={toAdminStatus(ticket.status)} />
        </div>

        {/* Message thread */}
        <div
          ref={threadRef}
          className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] px-1 py-2"
        >
          {ticket.messages.map((msg) => {
            const isStaff = msg.role === "staff";
            return (
              <div
                key={msg.id}
                className={[
                  "flex items-end gap-2",
                  isStaff ? "flex-row-reverse" : "flex-row",
                ].join(" ")}
              >
                {/* Avatar */}
                {msg.authorAvatarUrl ? (
                  <img
                    src={msg.authorAvatarUrl}
                    alt={msg.authorName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary-200 shrink-0 flex items-center justify-center text-xs font-semibold text-secondary-600">
                    {getInitials(msg.authorName)}
                  </div>
                )}

                {/* Bubble + meta */}
                <div
                  className={[
                    "flex flex-col gap-1 max-w-[70%]",
                    isStaff ? "items-end" : "items-start",
                  ].join(" ")}
                >
                  <p className="text-xs font-medium text-secondary-500">
                    {msg.authorName}
                  </p>
                  <div
                    className={[
                      "px-4 py-2.5 text-sm leading-relaxed break-words",
                      isStaff
                        ? "bg-primary-600 text-white rounded-2xl rounded-tr-sm"
                        : "bg-secondary-100 text-secondary-800 rounded-2xl rounded-tl-sm",
                    ].join(" ")}
                  >
                    {msg.text}

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {msg.attachments.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={[
                              "text-xs underline underline-offset-2",
                              isStaff
                                ? "text-primary-100 hover:text-white"
                                : "text-primary-600 hover:text-primary-700",
                            ].join(" ")}
                          >
                            Tệp đính kèm {idx + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-secondary-400">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}

          {ticket.messages.length === 0 && (
            <p className="text-center text-sm text-secondary-400 py-8">
              Chưa có tin nhắn nào
            </p>
          )}
        </div>

        {/* Reply area */}
        <div className="border border-secondary-200 rounded-2xl p-4 space-y-3 bg-white">
          <Textarea
            placeholder="Nhập nội dung trả lời..."
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            autoFocus
          />

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange("closed")}
              disabled={isSending}
            >
              Đóng phiếu
            </Button>

            <Button
              variant="primary"
              size="sm"
              disabled={!replyText.trim() || isSending}
              onClick={handleSend}
              leftIcon={
                isSending ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : undefined
              }
            >
              {isSending ? "Đang gửi..." : "Gửi trả lời"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Right: meta panel ────────────────────────────────────────────────── */}
      <TicketMetaPanel
        meta={meta}
        onMetaChange={onMetaChange}
        staffOptions={staffOptions}
      />
    </div>
  );
}
