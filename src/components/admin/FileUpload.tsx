"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from "react";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentIcon,
  PhotoIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedFile {
  /** Browser-generated unique ID */
  id: string;
  file: File;
  /** Object URL for image previews */
  previewUrl?: string;
  error?: string;
}

export interface FileUploadProps {
  /**
   * MIME types accepted (e.g. ["image/jpeg", "image/png"]).
   * Maps to the `accept` attribute on the hidden file input.
   */
  accept?: string[];
  /** Allow selecting multiple files
   * @default false
   */
  multiple?: boolean;
  /** Max individual file size in bytes
   * @default 5 * 1024 * 1024  (5 MB)
   */
  maxFileSizeBytes?: number;
  /** Max total number of files
   * @default 10
   */
  maxFiles?: number;
  /** Called with the valid accepted File objects whenever the list changes */
  onChange?: (files: File[]) => void;
  /** Pre-populate with existing file entries (controlled) */
  value?: UploadedFile[];
  /**
   * Hint text shown beneath the dropzone.
   * @default "PNG, JPG, GIF up to 5 MB"
   */
  hint?: string;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let counter = 0;
function uid() { return `fu-${++counter}`; }

function isImageMime(mime: string) {
  return mime.startsWith("image/");
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FileUpload — drag-and-drop + click file upload with image previews,
 * multi-file support, and size/type validation.
 *
 * ```tsx
 * <FileUpload
 *   accept={["image/jpeg", "image/png", "image/webp"]}
 *   multiple
 *   maxFileSizeBytes={5 * 1024 * 1024}
 *   maxFiles={6}
 *   onChange={(files) => setUploadedFiles(files)}
 *   hint="JPG, PNG, WEBP up to 5 MB each"
 * />
 * ```
 */
export function FileUpload({
  accept,
  multiple = false,
  maxFileSizeBytes = 5 * 1024 * 1024,
  maxFiles = 10,
  onChange,
  value,
  hint,
  className = "",
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;

  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>([]);
  const files = isControlled ? value : internalFiles;

  const [isDragging, setIsDragging] = useState(false);

  // Revoke preview URLs on unmount to free memory
  useEffect(() => {
    return () => {
      internalFiles.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      const remaining = maxFiles - files.length;
      if (remaining <= 0) return;

      const toAdd: UploadedFile[] = list.slice(0, remaining).map((file) => {
        // Type validation
        if (accept && accept.length > 0 && !accept.includes(file.type)) {
          return {
            id: uid(),
            file,
            error: `File type "${file.type}" is not allowed.`,
          };
        }
        // Size validation
        if (file.size > maxFileSizeBytes) {
          return {
            id: uid(),
            file,
            error: `File exceeds the ${formatBytes(maxFileSizeBytes)} limit (${formatBytes(file.size)}).`,
          };
        }
        return {
          id: uid(),
          file,
          previewUrl: isImageMime(file.type)
            ? URL.createObjectURL(file)
            : undefined,
        };
      });

      const next = [...files, ...toAdd];
      if (!isControlled) setInternalFiles(next);
      onChange?.(next.filter((f) => !f.error).map((f) => f.file));
    },
    [accept, files, isControlled, maxFiles, maxFileSizeBytes, onChange]
  );

  const removeFile = useCallback(
    (id: string) => {
      const target = files.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);

      const next = files.filter((f) => f.id !== id);
      if (!isControlled) setInternalFiles(next);
      onChange?.(next.filter((f) => !f.error).map((f) => f.file));

      // Reset input so the same file can be re-added
      if (inputRef.current) inputRef.current.value = "";
    },
    [files, isControlled, onChange]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
    },
    [processFiles]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    // Only set false if leaving the dropzone container (not a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const isFull = files.length >= maxFiles;
  const acceptAttr = accept?.join(",");

  const defaultHint =
    hint ??
    [
      accept ? accept.map((a) => a.split("/")[1]?.toUpperCase()).join(", ") : "Any file",
      `up to ${formatBytes(maxFileSizeBytes)}`,
      multiple ? `(max ${maxFiles} files)` : "",
    ]
      .filter(Boolean)
      .join(" • ");

  return (
    <div className={["flex flex-col gap-3", className].filter(Boolean).join(" ")}>
      {/* Drop zone */}
      {!isFull && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Click or drag files to upload"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-150",
            isDragging
              ? "border-primary-400 bg-primary-50"
              : "border-secondary-300 bg-secondary-50 hover:border-primary-300 hover:bg-primary-50/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          ].join(" ")}
        >
          <CloudArrowUpIcon
            className={[
              "w-10 h-10 transition-colors",
              isDragging ? "text-primary-500" : "text-secondary-400",
            ].join(" ")}
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-secondary-700">
              <span className="text-primary-600">Click to upload</span>
              {" "}or drag and drop
            </p>
            <p className="mt-1 text-xs text-secondary-400">{defaultHint}</p>
          </div>

          {/* Hidden file input */}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={acceptAttr}
            multiple={multiple}
            onChange={handleInputChange}
            className="sr-only"
            tabIndex={-1}
          />
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul role="list" className="flex flex-col gap-2">
          {files.map((f) => {
            const hasError = !!f.error;
            const isImage = f.previewUrl != null;

            return (
              <li
                key={f.id}
                className={[
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                  hasError
                    ? "border-error-200 bg-error-50"
                    : "border-secondary-200 bg-white",
                ].join(" ")}
              >
                {/* Preview / icon */}
                {isImage && !hasError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.previewUrl}
                    alt={f.file.name}
                    className="h-10 w-10 shrink-0 rounded-md border border-secondary-100 object-cover"
                  />
                ) : (
                  <span
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
                      hasError
                        ? "border-error-200 bg-error-50 text-error-500"
                        : "border-secondary-100 bg-secondary-50 text-secondary-400",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {hasError ? (
                      <ExclamationCircleIcon className="w-5 h-5" />
                    ) : isImageMime(f.file.type) ? (
                      <PhotoIcon className="w-5 h-5" />
                    ) : (
                      <DocumentIcon className="w-5 h-5" />
                    )}
                  </span>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={[
                      "truncate text-sm font-medium",
                      hasError ? "text-error-700" : "text-secondary-800",
                    ].join(" ")}
                  >
                    {f.file.name}
                  </p>
                  {hasError ? (
                    <p className="text-xs text-error-600">{f.error}</p>
                  ) : (
                    <p className="text-xs text-secondary-400">
                      {formatBytes(f.file.size)}
                    </p>
                  )}
                </div>

                {/* Status icon */}
                {!hasError && (
                  <CheckCircleIcon
                    className="w-4 h-4 shrink-0 text-success-500"
                    aria-hidden="true"
                  />
                )}

                {/* Remove button */}
                <button
                  type="button"
                  aria-label={`Remove ${f.file.name}`}
                  onClick={() => removeFile(f.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <XMarkIcon className="w-4 h-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Capacity indicator */}
      {multiple && maxFiles > 1 && (
        <p className="text-right text-xs text-secondary-400">
          {files.length} / {maxFiles} files
        </p>
      )}
    </div>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name               Type                      Default      Description
 * ──────────────────────────────────────────────────────────────────────────────
 * accept             string[]                  —            Allowed MIME types
 * multiple           boolean                   false        Allow multiple file selection
 * maxFileSizeBytes   number                    5 MB         Per-file size limit in bytes
 * maxFiles           number                    10           Total file count limit
 * onChange           (files: File[]) => void   —            Valid files change callback
 * value              UploadedFile[]            —            Controlled file list
 * hint               string                    auto         Hint text beneath dropzone
 * className          string                    ""           Extra classes on root div
 */
