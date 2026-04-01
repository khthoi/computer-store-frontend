// ─── Rich Text Editor — public API ───────────────────────────────────────────
//
// CKEditor 5 references browser globals (document, window) at module level.
// Every consumer MUST wrap this import with dynamic() to prevent SSR errors:
//
//   import dynamic from "next/dynamic";
//
//   const RichTextEditor = dynamic(
//     () => import("@/src/components/editor").then((m) => ({ default: m.RichTextEditor })),
//     { ssr: false }
//   );

export { RichTextEditor } from "@/src/components/editor/RichTextEditor";
export type { RichTextEditorProps } from "@/src/components/editor/RichTextEditor";
