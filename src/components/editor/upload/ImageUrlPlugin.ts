// ─── ImageUrlPlugin ───────────────────────────────────────────────────────────
//
// CKEditor extraPlugin that intercepts clipboard paste events.
// When the pasted plain text is a valid image URL it inserts the image
// directly — no upload API call is made.
//
// All other paste events fall through to CKEditor's normal clipboard pipeline.

const IMAGE_URL_REGEX =
  /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|bmp|avif|tiff?)(\?[^\s]*)?$/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ImageUrlPlugin {
  static readonly pluginName = "ImageUrlPlugin" as const;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly editor: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(editor: any) {
    this.editor = editor;
  }

  init(): void {
    const editor = this.editor;

    // Listen at high priority so this runs before CKEditor's own clipboard
    // handler. If we handle the event we call evt.stop() to cancel the default.
    editor.editing.view.document.on(
      "clipboardInput",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (evt: any, data: any) => {
        const text = (data.dataTransfer.getData("text/plain") ?? "").trim();

        if (!IMAGE_URL_REGEX.test(text)) return;

        // Stop default paste pipeline — we handle insertion ourselves.
        evt.stop();

        editor.model.change((writer: any) => {
          // imageBlock is the block-level model element registered by the Image plugin.
          const imageElement = writer.createElement("imageBlock", {
            src: text,
          });
          editor.model.insertContent(
            imageElement,
            editor.model.document.selection
          );
        });
      },
      { priority: "high" }
    );
  }
}
