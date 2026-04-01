import type { Metadata } from "next";
import { EditorDebugPage } from "./EditorDebugPage";

// ─── Route config ──────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editor Debug — Admin Dev Tools",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function EditorDebugRoute() {
  return <EditorDebugPage />;
}
