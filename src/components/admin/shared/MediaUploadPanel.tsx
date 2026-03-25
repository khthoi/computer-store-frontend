"use client";

import { useRef } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaImage {
  id: string;
  url: string;
  alt?: string;
  /** 0–100 — when defined and < 100, shows a progress bar overlay */
  uploadProgress?: number;
}

export interface MediaUploadPanelProps {
  images: MediaImage[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  /** Optional drag-and-drop reorder callback — wiring up DnD library is up to the consumer */
  onReorder?: (newOrder: MediaImage[]) => void;
  maxImages?: number;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * MediaUploadPanel — image grid for product media management.
 *
 * - Existing images: show with hover overlay (remove button + progress bar).
 * - Add slot: dashed border with native file input (hidden, triggered by overlay).
 * - Helper text below the grid.
 */
export function MediaUploadPanel({
  images,
  onAdd,
  onRemove,
  maxImages = 10,
  className = "",
}: MediaUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = images.length < maxImages;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      onAdd(files);
    }
    // Reset so same files can be re-added
    e.target.value = "";
  };

  return (
    <div className={className}>
      {/* Image grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {/* Existing image slots */}
        {images.map((img) => {
          const isUploading =
            img.uploadProgress !== undefined && img.uploadProgress < 100;

          return (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-secondary-200 bg-secondary-50"
            >
              {/* Image */}
              <img
                src={img.url}
                alt={img.alt ?? "Ảnh sản phẩm"}
                className="h-full w-full object-cover"
                loading="lazy"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-start justify-end bg-secondary-900/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Xóa ảnh"
                  onClick={() => onRemove(img.id)}
                  className="m-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-secondary-700 shadow-sm transition-colors hover:bg-error-50 hover:text-error-600 focus:outline-none focus:ring-2 focus:ring-error-500"
                >
                  <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              {/* Upload progress bar */}
              {isUploading && (
                <>
                  {/* Dark overlay while uploading */}
                  <div className="absolute inset-0 bg-secondary-900/30" />
                  {/* Progress bar at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-secondary-200/60">
                    <div
                      className="h-full bg-primary-500 transition-all duration-200"
                      style={{ width: `${img.uploadProgress}%` }}
                    />
                  </div>
                  {/* Progress text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full bg-secondary-900/60 px-2 py-0.5 text-xs font-medium text-white">
                      {img.uploadProgress}%
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Add slot */}
        {canAddMore && (
          <div
            className="relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-secondary-300 bg-secondary-50 transition-colors hover:border-primary-300 hover:bg-primary-50/40"
            onClick={() => fileInputRef.current?.click()}
            title={`Thêm ảnh (tối đa ${maxImages})`}
          >
            <PlusIcon className="h-6 w-6 text-secondary-400" aria-hidden="true" />
            <span className="text-xs text-secondary-400">Thêm ảnh</span>

            {/* Native file input — invisible, layered on top */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Chọn ảnh để tải lên"
            />
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="mt-2 text-xs italic text-secondary-400">
        Kéo để sắp xếp lại thứ tự. Tối đa {maxImages} ảnh.
      </p>
    </div>
  );
}
