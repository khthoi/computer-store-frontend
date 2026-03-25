"use client";

import { useState, type KeyboardEvent } from "react";
import { Toggle } from "@/src/components/ui/Toggle";
import { Button } from "@/src/components/ui/Button";
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationChannel = "email" | "dashboard" | "sms";
type EventType =
  | "new_order"
  | "low_stock"
  | "ticket_opened"
  | "ticket_replied"
  | "user_registered"
  | "order_cancelled"
  | "refund_requested";

export interface NotificationSettings {
  matrix: Record<EventType, Record<NotificationChannel, boolean>>;
  recipientEmails: Record<EventType, string[]>;
}

interface NotificationSettingsFormProps {
  value: NotificationSettings;
  onChange: (v: NotificationSettings) => void;
  onSave: () => void;
  isSaving?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_LABELS: Record<EventType, string> = {
  new_order: "Đơn hàng mới",
  low_stock: "Tồn kho thấp",
  ticket_opened: "Phiếu hỗ trợ mới",
  ticket_replied: "Phản hồi phiếu hỗ trợ",
  user_registered: "Người dùng mới đăng ký",
  order_cancelled: "Đơn hàng bị huỷ",
  refund_requested: "Yêu cầu hoàn tiền",
};

const ALL_EVENTS = Object.keys(EVENT_LABELS) as EventType[];

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: "Email",
  dashboard: "Dashboard",
  sms: "SMS",
};

const ALL_CHANNELS: NotificationChannel[] = ["email", "dashboard", "sms"];

// ─── Email recipients row ─────────────────────────────────────────────────────

interface EmailRecipientsRowProps {
  eventType: EventType;
  emails: string[];
  onUpdate: (emails: string[]) => void;
}

function EmailRecipientsRow({
  eventType,
  emails,
  onUpdate,
}: EmailRecipientsRowProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  function addEmail() {
    const email = inputValue.trim();
    if (!email || emails.includes(email)) return;
    onUpdate([...emails, email]);
    setInputValue("");
  }

  function removeEmail(email: string) {
    onUpdate(emails.filter((e) => e !== email));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  }

  return (
    <div className="border-t border-secondary-100 pt-2">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 text-xs text-secondary-500 hover:text-secondary-700 transition-colors"
      >
        <span className="font-medium">
          Người nhận email — {EVENT_LABELS[eventType]}
        </span>
        {open ? (
          <ChevronUpIcon className="w-3.5 h-3.5" aria-hidden="true" />
        ) : (
          <ChevronDownIcon className="w-3.5 h-3.5" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {/* Existing email chips */}
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {emails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-100 text-xs text-secondary-700 border border-secondary-200"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    aria-label={`Xóa ${email}`}
                    className="hover:text-error-600"
                  >
                    <XMarkIcon className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add email input */}
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập email rồi Enter..."
              className="flex-1 min-w-0 text-xs border border-secondary-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:border-primary-400 focus:ring-primary-500/15"
            />
            <button
              type="button"
              onClick={addEmail}
              disabled={!inputValue.trim()}
              className="px-2.5 py-1.5 text-xs text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              Thêm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * NotificationSettingsForm — matrix table of event × channel notification toggles
 * with collapsible email recipient lists.
 */
export function NotificationSettingsForm({
  value,
  onChange,
  onSave,
  isSaving = false,
}: NotificationSettingsFormProps) {
  function setToggle(
    eventType: EventType,
    channel: NotificationChannel,
    enabled: boolean
  ) {
    onChange({
      ...value,
      matrix: {
        ...value.matrix,
        [eventType]: {
          ...value.matrix[eventType],
          [channel]: enabled,
        },
      },
    });
  }

  function setRecipientEmails(eventType: EventType, emails: string[]) {
    onChange({
      ...value,
      recipientEmails: {
        ...value.recipientEmails,
        [eventType]: emails,
      },
    });
  }

  // Determine which events have email channel enabled
  const emailEnabledEvents = ALL_EVENTS.filter(
    (e) => value.matrix[e]?.email
  );

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-secondary-900 mb-5">
        Cài đặt thông báo
      </h2>

      {/* Matrix table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary-100">
              <th className="text-left text-xs font-semibold text-secondary-500 pb-3 pr-4 w-64">
                Sự kiện
              </th>
              {ALL_CHANNELS.map((ch) => (
                <th
                  key={ch}
                  className="text-center text-xs font-semibold text-secondary-500 pb-3 px-4 whitespace-nowrap"
                >
                  {CHANNEL_LABELS[ch]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-50">
            {ALL_EVENTS.map((eventType) => (
              <tr key={eventType} className="hover:bg-secondary-50 transition-colors">
                <td className="py-3 pr-4 text-sm text-secondary-800 font-medium">
                  {EVENT_LABELS[eventType]}
                </td>
                {ALL_CHANNELS.map((channel) => (
                  <td key={channel} className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <Toggle
                        size="sm"
                        checked={value.matrix[eventType]?.[channel] ?? false}
                        onChange={(e) =>
                          setToggle(eventType, channel, e.target.checked)
                        }
                        aria-label={`${EVENT_LABELS[eventType]} — ${CHANNEL_LABELS[channel]}`}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Email recipient inputs for email-enabled events */}
      {emailEnabledEvents.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold text-secondary-600 uppercase tracking-wide">
            Người nhận email
          </p>
          {emailEnabledEvents.map((eventType) => (
            <EmailRecipientsRow
              key={eventType}
              eventType={eventType}
              emails={value.recipientEmails[eventType] ?? []}
              onUpdate={(emails) => setRecipientEmails(eventType, emails)}
            />
          ))}
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end mt-6 pt-4 border-t border-secondary-100">
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          isLoading={isSaving}
          disabled={isSaving}
        >
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
}
