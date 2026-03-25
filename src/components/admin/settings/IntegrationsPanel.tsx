"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnectionStatus = "connected" | "disconnected" | "error";

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: ConnectionStatus;
  configFields?: { key: string; label: string; type: "text" | "password" }[];
}

interface IntegrationsPanelProps {
  integrations: Integration[];
  onConnect: (id: string, credentials?: Record<string, string>) => void;
  onDisconnect: (id: string) => void;
}

// ─── Status badge helper ──────────────────────────────────────────────────────

const STATUS_STYLES: Record<ConnectionStatus, string> = {
  connected: "bg-success-50 text-success-700 border-success-200",
  disconnected: "bg-secondary-100 text-secondary-600 border-secondary-200",
  error: "bg-error-50 text-error-700 border-error-200",
};

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  connected: "Đã kết nối",
  disconnected: "Chưa kết nối",
  error: "Lỗi kết nối",
};

// ─── Single integration card ──────────────────────────────────────────────────

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (id: string, credentials?: Record<string, string>) => void;
  onDisconnect: (id: string) => void;
}

function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
}: IntegrationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const hasConfigFields =
    integration.configFields && integration.configFields.length > 0;

  function handleConnectClick() {
    if (hasConfigFields && !expanded) {
      setExpanded(true);
      return;
    }
    onConnect(integration.id, hasConfigFields ? credentials : undefined);
    setExpanded(false);
    setCredentials({});
  }

  function handleDisconnectConfirm() {
    onDisconnect(integration.id);
    setShowDisconnectConfirm(false);
  }

  const actionButton =
    integration.status === "connected" ? (
      <>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowDisconnectConfirm(true)}
        >
          Ngắt kết nối
        </Button>
        <ConfirmDialog
          isOpen={showDisconnectConfirm}
          onClose={() => setShowDisconnectConfirm(false)}
          onConfirm={handleDisconnectConfirm}
          title={`Ngắt kết nối ${integration.name}`}
          description={`Bạn có chắc muốn ngắt kết nối tích hợp ${integration.name}? Các tính năng sử dụng tích hợp này sẽ ngừng hoạt động.`}
          variant="warning"
          confirmLabel="Ngắt kết nối"
          cancelLabel="Huỷ"
        />
      </>
    ) : integration.status === "error" ? (
      <Button variant="ghost" size="sm" onClick={handleConnectClick}>
        Thử lại
      </Button>
    ) : (
      <Button variant="primary" size="sm" onClick={handleConnectClick}>
        Kết nối
      </Button>
    );

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-4 shadow-sm flex flex-col gap-3">
      {/* Logo + name + status */}
      <div className="flex items-start gap-3">
        {/* Logo placeholder */}
        <div
          className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center shrink-0 text-secondary-400"
          aria-hidden="true"
        >
          <GlobeAltIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-secondary-900 truncate">
              {integration.name}
            </p>
            <span
              className={[
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border",
                STATUS_STYLES[integration.status],
              ].join(" ")}
            >
              {STATUS_LABELS[integration.status]}
            </span>
          </div>
          <p className="text-xs text-secondary-400 mt-0.5 line-clamp-2">
            {integration.description}
          </p>
        </div>
      </div>

      {/* Inline config form (for disconnected with configFields) */}
      {expanded && hasConfigFields && integration.status !== "connected" && (
        <div className="space-y-2 border-t border-secondary-100 pt-3">
          {integration.configFields!.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              type={field.type}
              value={credentials[field.key] ?? ""}
              onChange={(e) =>
                setCredentials({ ...credentials, [field.key]: e.target.value })
              }
              placeholder={`Nhập ${field.label.toLowerCase()}...`}
              size="sm"
            />
          ))}

          <div className="flex gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setExpanded(false);
                setCredentials({});
              }}
            >
              Huỷ
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConnectClick}
            >
              Xác nhận kết nối
            </Button>
          </div>
        </div>
      )}

      {/* Action button */}
      {!expanded && <div className="flex justify-end">{actionButton}</div>}
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

/**
 * IntegrationsPanel — grid of integration cards for managing third-party services.
 *
 * Default integrations if none provided: Google Analytics, Facebook Pixel,
 * Mailchimp, Shopify POS, etc. (pass them from the parent page).
 */
export function IntegrationsPanel({
  integrations,
  onConnect,
  onDisconnect,
}: IntegrationsPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-secondary-900">
            Tích hợp bên thứ ba
          </h2>
          <p className="text-xs text-secondary-400 mt-0.5">
            Kết nối cửa hàng với các dịch vụ bên ngoài
          </p>
        </div>
      </div>

      {integrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-12 text-center">
          <GlobeAltIcon
            className="w-10 h-10 text-secondary-300 mx-auto mb-3"
            aria-hidden="true"
          />
          <p className="text-sm text-secondary-500">
            Chưa có tích hợp nào được cấu hình
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
