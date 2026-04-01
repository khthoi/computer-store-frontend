"use client";

import "@/src/components/editor/styles/editor.css";
import dynamic from "next/dynamic";

// ─── SpecificationItemEditor ──────────────────────────────────────────────────
//
// Lightweight wrapper around RichTextEditor for per-spec-item values.
// Uses the full CKEditor toolbar — no need for a cut-down variant.
//
// CKEditor references browser globals, so it must be loaded client-side only.

const RichTextEditor = dynamic(
  () =>
    import("@/src/components/editor").then((m) => ({ default: m.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-20 animate-pulse rounded-lg bg-secondary-100" />
    ),
  }
);

interface SpecificationItemEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function SpecificationItemEditor({
  value,
  onChange,
  placeholder = "Enter specification value…",
}: SpecificationItemEditorProps) {
  // `value` seeds the editor once on mount. CKEditor's <CKEditor data={value}>
  // is not a true controlled input — subsequent prop changes do not re-apply
  // the content. This is intentional: it prevents cursor-jumping when sibling
  // form fields change and trigger parent re-renders.
  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      minHeight={150}
    />
  );
}
