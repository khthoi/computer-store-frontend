"use client";

import "@/src/components/editor/styles/editor.css";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ClipboardDocumentIcon, CheckIcon, BeakerIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";

// ─── Dynamic import — CKEditor must be client-only ────────────────────────────

const RichTextEditor = dynamic(
  () =>
    import("@/src/components/editor").then((m) => ({ default: m.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 animate-pulse items-center justify-center rounded-xl bg-secondary-100">
        <span className="text-sm text-secondary-400">Loading editor…</span>
      </div>
    ),
  }
);

// ─── EditorDebugPage ──────────────────────────────────────────────────────────

const INITIAL_HTML = `<h2>CKEditor 5 — Feature Demo</h2>
<p>Edit this content to test all supported formats, then click <strong>Compile Output</strong> to inspect the HTML.</p>
<blockquote><p>Try headings, font size, font family, colours, lists, code blocks, alignment, links, horizontal line, and media embed.</p></blockquote>
<p><strong>Bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>.</p>
<ul><li>Bullet item one</li><li>Bullet item two</li></ul>
<ol><li>Ordered item one</li><li>Ordered item two</li></ol>`;

export function EditorDebugPage() {
  // Store the latest HTML in a ref to avoid re-rendering on every keystroke.
  // The "Compile Output" button snapshots it into state to trigger display.
  const latestHtmlRef = useRef<string>(INITIAL_HTML);

  const [outputHtml, setOutputHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleChange(html: string) {
    latestHtmlRef.current = html;
  }

  function handleCompile() {
    setOutputHtml(latestHtmlRef.current);
  }

  async function handleCopy() {
    if (!outputHtml) return;
    try {
      await navigator.clipboard.writeText(outputHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available (e.g. non-HTTPS context)
    }
  }

  const isEmpty = !outputHtml;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BeakerIcon className="h-5 w-5 text-primary-500" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-secondary-900">
              Rich Text Editor — Debug
            </h1>
          </div>
          <p className="mt-1 text-sm text-secondary-500">
            Write content in the editor, then click{" "}
            <strong>Compile Output</strong> to inspect the raw HTML and the
            rendered preview.
          </p>
        </div>
        <Badge variant="warning" size="sm">Dev only</Badge>
      </div>

      {/* ── Editor section ── */}
      <section className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
          Editor
        </h2>

        <RichTextEditor
          value={INITIAL_HTML}
          onChange={handleChange}
          placeholder="Start writing to test all editor features…"
          minHeight={320}
        />

        <div className="mt-4 flex justify-end">
          <Button variant="primary" onClick={handleCompile}>
            Compile Output
          </Button>
        </div>
      </section>

      {/* ── Output panels — revealed after first compile ── */}
      {outputHtml !== null && (
        <div className="space-y-6">
          {/* ── 1. Raw HTML ── */}
          <section className="rounded-xl border border-secondary-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-secondary-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-secondary-700">
                Raw HTML Output
              </h2>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy to clipboard"
                className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-1.5 text-xs font-medium text-secondary-600 transition-colors hover:bg-secondary-50 hover:text-secondary-800"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-3.5 w-3.5 text-success-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="p-4">
              {isEmpty ? (
                <p className="text-sm italic text-secondary-400">
                  (empty — editor produced no content)
                </p>
              ) : (
                <pre className="overflow-x-auto rounded-lg bg-secondary-900 p-4 text-xs leading-relaxed text-green-300">
                  <code>{outputHtml}</code>
                </pre>
              )}
            </div>
          </section>

          {/* ── 2. Rendered HTML preview ── */}
          <section className="rounded-xl border border-secondary-200 bg-white shadow-sm">
            <div className="border-b border-secondary-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-secondary-700">
                Rendered Preview
              </h2>
              <p className="mt-0.5 text-xs text-secondary-400">
                Rendered with <code>rte-preview</code> styles — identical to
                production display sites (spec rows, description view mode).
              </p>
            </div>

            <div className="p-4">
              {isEmpty ? (
                <p className="text-sm italic text-secondary-400">
                  No content to preview.
                </p>
              ) : (
                <div
                  className="rte-preview min-h-[80px] rounded-lg border border-secondary-100 bg-secondary-50 px-4"
                  dangerouslySetInnerHTML={{ __html: outputHtml }}
                />
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
