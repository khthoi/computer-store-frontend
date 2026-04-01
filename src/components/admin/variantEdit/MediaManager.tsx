"use client";

import { useRef, useState } from "react";
import {
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CloudArrowUpIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Badge } from "@/src/components/ui/Badge";
import type { VariantMedia, MediaType } from "@/src/types/product.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const UPLOAD_API = "http://localhost:3002/cloudinary/uploads";

const IMAGE_URL_REGEX =
  /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|bmp|avif|tiff?)(\?[^\s]*)?$/i;

const TYPE_OPTIONS = [
  { value: "main",    label: "Main"    },
  { value: "gallery", label: "Gallery" },
  { value: "360",     label: "360°"    },
];

const TYPE_BADGE: Record<MediaType, React.ReactNode> = {
  main:    <Badge variant="primary" size="sm">Main</Badge>,
  gallery: <Badge variant="default" size="sm">Gallery</Badge>,
  "360":   <Badge variant="warning" size="sm">360°</Badge>,
};

// ─── MediaManager ─────────────────────────────────────────────────────────────

interface MediaManagerProps {
  variantId: string;
  media: VariantMedia[];
  onChange: (media: VariantMedia[]) => void;
}

export function MediaManager({ variantId, media, onChange }: MediaManagerProps) {
  const sorted = [...media].sort((a, b) => a.order - b.order);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [libraryOpen, setLibraryOpen]         = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadConfirm, setUploadConfirm]     = useState<{ file: File; previewUrl: string } | null>(null);
  const [isUploading, setIsUploading]         = useState(false);
  const [uploadError, setUploadError]         = useState("");
  const [isDragging, setIsDragging]           = useState(false);

  // ── Add-form state ────────────────────────────────────────────────────────
  const [urlInput, setUrlInput] = useState("");
  const [urlType, setUrlType]   = useState<MediaType>("gallery");
  const [urlAlt, setUrlAlt]     = useState("");
  const [urlError, setUrlError] = useState("");

  // ── Helpers ───────────────────────────────────────────────────────────────

  function addItem(item: Omit<VariantMedia, "id" | "variantId" | "order">) {
    const maxOrder = media.reduce((m, x) => Math.max(m, x.order), 0);
    onChange([
      ...media,
      { ...item, id: `media-new-${Date.now()}`, variantId, order: maxOrder + 1 },
    ]);
  }

  // ── Add by URL ────────────────────────────────────────────────────────────

  function handleAddUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) { setUrlError("URL is required."); return; }
    setUrlError("");
    addItem({ url: trimmed, type: urlType, altText: urlAlt.trim() || undefined });
    setUrlInput("");
    setUrlAlt("");
    setUrlType("gallery");
  }

  // ── Shared: stage a file for confirmation before uploading ───────────────

  function stageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploadError("");
    setUploadConfirm({ file, previewUrl: URL.createObjectURL(file) });
  }

  // ── Paste handling ────────────────────────────────────────────────────────

  function handlePaste(e: React.ClipboardEvent) {
    const file = e.clipboardData.files[0];
    if (file && file.type.startsWith("image/")) {
      e.preventDefault();
      stageFile(file);
      return;
    }
    // Let text paste propagate — the input onChange captures the URL
  }

  // ── File input (Browse button) ────────────────────────────────────────────

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) stageFile(file);
    // Reset so re-selecting the same file fires onChange again
    e.target.value = "";
  }

  // ── Drag-and-drop ─────────────────────────────────────────────────────────

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only reset if leaving the drop zone itself, not a child element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) stageFile(file);
  }

  // ── File upload to backend ────────────────────────────────────────────────

  async function handleConfirmUpload() {
    if (!uploadConfirm) return;
    setIsUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", uploadConfirm.file);
      const res = await fetch(UPLOAD_API, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

      const data = (await res.json()) as Record<string, unknown>;
      const url =
        (data.url as string) ??
        (data.secure_url as string) ??
        ((data.data as Record<string, string> | undefined)?.url) ??
        ((data.data as Record<string, string> | undefined)?.secure_url);

      if (!url) throw new Error("Response missing image URL.");

      addItem({
        url,
        type: "gallery",
        altText: uploadConfirm.file.name.replace(/\.[^.]+$/, "") || undefined,
      });
      URL.revokeObjectURL(uploadConfirm.previewUrl);
      setUploadConfirm(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  function dismissUploadConfirm() {
    if (uploadConfirm) URL.revokeObjectURL(uploadConfirm.previewUrl);
    setUploadConfirm(null);
    setUploadError("");
  }

  // ── Reorder ───────────────────────────────────────────────────────────────

  function swapOrders(idA: string, idB: string) {
    const a = media.find((m) => m.id === idA)!;
    const b = media.find((m) => m.id === idB)!;
    onChange(
      media.map((m) => {
        if (m.id === idA) return { ...m, order: b.order };
        if (m.id === idB) return { ...m, order: a.order };
        return m;
      })
    );
  }

  function handleMoveUp(id: string) {
    const idx = sorted.findIndex((m) => m.id === id);
    if (idx <= 0) return;
    swapOrders(sorted[idx].id, sorted[idx - 1].id);
  }

  function handleMoveDown(id: string) {
    const idx = sorted.findIndex((m) => m.id === id);
    if (idx < 0 || idx >= sorted.length - 1) return;
    swapOrders(sorted[idx].id, sorted[idx + 1].id);
  }

  function handleEdit(updated: VariantMedia) {
    onChange(media.map((m) => (m.id === updated.id ? updated : m)));
  }

  function handleRemove(id: string) {
    onChange(media.filter((m) => m.id !== id));
    setConfirmDeleteId(null);
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      {/* ── Card header ── */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary-500">
          Media
          {media.length > 0 && (
            <span className="ml-1.5 font-normal text-secondary-400">({media.length})</span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Manage Media
        </button>
      </div>

      {/* ── Compact thumbnail preview ── */}
      {sorted.length === 0 ? (
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-secondary-200 py-10 text-secondary-400 transition-colors hover:border-primary-300 hover:text-primary-500"
        >
          <PhotoIcon className="mb-2 h-10 w-10" aria-hidden="true" />
          <span className="text-sm">No media. Click to add images.</span>
        </button>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setLibraryOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLibraryOpen(true); }}
          aria-label="Open media library"
          className="grid cursor-pointer grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-8"
        >
          {sorted.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-secondary-200 bg-secondary-50"
            >
              {item.url ? (
                <img src={item.url} alt={item.altText ?? ""} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <PhotoIcon className="h-5 w-5 text-secondary-300" />
                </div>
              )}
              <span className="absolute bottom-0.5 left-0.5 rounded bg-black/50 px-1 py-0.5 font-mono text-[8px] text-white">
                {item.type}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* Media Library Modal                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      <Modal
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        title="Media Library"
        size="xl"
        animated
      >
        <div className="space-y-5">
          {/* ── Add Image panel ── */}
          {/* Hidden file input — triggered by the Browse button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileInputChange}
          />

          <div
            className={[
              "rounded-xl border-2 border-dashed p-4 transition-colors",
              isDragging
                ? "border-primary-400 bg-primary-50"
                : "border-secondary-300 bg-secondary-50",
            ].join(" ")}
            onPaste={handlePaste}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
                Add Image
              </p>
              {/* Browse button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-2.5 py-1 text-xs font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
              >
                <ArrowUpTrayIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Browse file
              </button>
            </div>

            {/* Drop zone hint */}
            <div
              className={[
                "mb-3 flex items-center justify-center rounded-lg border border-dashed py-3 text-sm transition-colors",
                isDragging
                  ? "border-primary-300 text-primary-600"
                  : "border-secondary-200 text-secondary-400",
              ].join(" ")}
            >
              <CloudArrowUpIcon className="mr-2 h-5 w-5 shrink-0" aria-hidden="true" />
              {isDragging ? "Drop image here" : "Drag & drop an image, or use Browse / Ctrl+V"}
            </div>

            {/* URL input row */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Image URL"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                  onPaste={handlePaste}
                  placeholder="Or paste an image URL here…"
                  errorMessage={urlError}
                  size="sm"
                />
              </div>
              <div className="w-36 shrink-0">
                <Select
                  label="Type"
                  options={TYPE_OPTIONS}
                  value={urlType}
                  onChange={(v) => setUrlType(v as MediaType)}
                  size="sm"
                />
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddUrl}
                className="shrink-0"
              >
                <PlusIcon className="h-4 w-4" />
                Add
              </Button>
            </div>

            {/* URL preview + alt text */}
            {urlInput && IMAGE_URL_REGEX.test(urlInput) && (
              <div className="mt-3 flex items-start gap-3 rounded-lg border border-secondary-200 bg-white p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-secondary-200 bg-secondary-50">
                  <img
                    src={urlInput}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Alt text"
                    value={urlAlt}
                    onChange={(e) => setUrlAlt(e.target.value)}
                    placeholder="Describe the image…"
                    size="sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Media list ── */}
          {sorted.length === 0 ? (
            <p className="py-8 text-center text-sm text-secondary-400">
              No media added yet. Use the form above to add images.
            </p>
          ) : (
            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {sorted.map((item, index) => (
                <MediaItemRow
                  key={item.id}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === sorted.length - 1}
                  onMoveUp={() => handleMoveUp(item.id)}
                  onMoveDown={() => handleMoveDown(item.id)}
                  onRemove={() => setConfirmDeleteId(item.id)}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* ── File upload confirmation modal ── */}
      <Modal
        isOpen={uploadConfirm !== null}
        onClose={dismissUploadConfirm}
        title="Upload Image"
        size="sm"
        animated
        footer={
          <>
            <button
              type="button"
              onClick={dismissUploadConfirm}
              className="rounded-lg border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              Cancel
            </button>
            <Button variant="primary" isLoading={isUploading} onClick={handleConfirmUpload}>
              <CloudArrowUpIcon className="mr-1 h-4 w-4" aria-hidden="true" />
              Upload &amp; Add
            </Button>
          </>
        }
      >
        {uploadConfirm && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <img
                src={uploadConfirm.previewUrl}
                alt="Upload preview"
                className="max-h-52 max-w-full rounded-lg border border-secondary-200 object-contain"
              />
            </div>
            <p className="text-center text-sm text-secondary-600">
              Upload this image to the media library?
            </p>
            {uploadError && (
              <p className="text-center text-xs text-error-600">{uploadError}</p>
            )}
          </div>
        )}
      </Modal>

      {/* ── Confirm delete modal ── */}
      <Modal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Remove media item?"
        size="sm"
        animated
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="rounded-lg border border-secondary-200 bg-white px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              Cancel
            </button>
            <Button variant="danger" onClick={() => handleRemove(confirmDeleteId!)}>
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-secondary-600">
          This media item will be removed from the variant. This cannot be undone without re-adding it.
        </p>
      </Modal>
    </div>
  );
}

// ─── MediaItemRow ─────────────────────────────────────────────────────────────

interface MediaItemRowProps {
  item: VariantMedia;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onEdit: (item: VariantMedia) => void;
}

function MediaItemRow({
  item,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
  onEdit,
}: MediaItemRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-secondary-200 bg-white p-3 shadow-sm">
      {/* Thumbnail */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-secondary-200 bg-secondary-50">
        {item.url ? (
          <img src={item.url} alt={item.altText ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PhotoIcon className="h-6 w-6 text-secondary-300" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 py-0.5 font-mono text-[9px] font-semibold text-white">
          #{item.order}
        </span>
      </div>

      {/* Editable fields */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              label="Alt text"
              value={item.altText ?? ""}
              onChange={(e) => onEdit({ ...item, altText: e.target.value })}
              placeholder="Describe image…"
              size="sm"
            />
          </div>
          <div className="w-32 shrink-0">
            <Select
              label="Type"
              options={TYPE_OPTIONS}
              value={item.type}
              onChange={(v) => onEdit({ ...item, type: v as MediaType })}
              size="sm"
            />
          </div>
        </div>
        <div>{TYPE_BADGE[item.type]}</div>
      </div>

      {/* Move + delete */}
      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          title="Move up"
          className="flex h-7 w-7 items-center justify-center rounded border border-secondary-200 text-secondary-500 transition-colors hover:bg-secondary-50 hover:text-secondary-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowUpIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          title="Move down"
          className="flex h-7 w-7 items-center justify-center rounded border border-secondary-200 text-secondary-500 transition-colors hover:bg-secondary-50 hover:text-secondary-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          title="Remove"
          className="mt-auto flex h-7 w-7 items-center justify-center rounded border border-error-200 text-error-500 transition-colors hover:bg-error-50 hover:text-error-700"
        >
          <TrashIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
