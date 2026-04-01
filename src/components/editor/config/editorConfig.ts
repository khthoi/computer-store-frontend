// ─── CKEditor 5 Classic Build — base configuration ───────────────────────────
//
// @ckeditor/ckeditor5-build-classic bundles all plugins — no individual
// plugin imports are needed or possible here.
//
// Bundled plugins: Bold, Italic, Heading, Link, List, Indent, BlockQuote,
// Image/ImageUpload/ImageCaption/ImageStyle/ImageToolbar, Table, MediaEmbed,
// Essentials, Autoformat, PasteFromOffice, TextTransformation.
//
// NOT in this build: Alignment, FontColor, FontSize, FontFamily,
// Underline, Strikethrough, CodeBlock, HorizontalLine.

// ─── Toolbar ──────────────────────────────────────────────────────────────────

const TOOLBAR_ITEMS = [
  "heading",
  "|",
  "bold",
  "italic",
  "|",
  "link",
  "bulletedList",
  "numberedList",
  "indent",
  "outdent",
  "|",
  "blockQuote",
  "|",
  "uploadImage",
  "insertTable",
  "mediaEmbed",
  "|",
  "undo",
  "redo",
];

// ─── Base config ──────────────────────────────────────────────────────────────
//
// The upload adapter is NOT included here — it is injected per-instance via
// `extraPlugins` in RichTextEditor.tsx so each form can use its own preset.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BASE_EDITOR_CONFIG: Record<string, any> = {
  toolbar: {
    items: TOOLBAR_ITEMS,
    shouldNotGroupWhenFull: true,
  },

  heading: {
    options: [
      { model: "paragraph", title: "Normal", class: "" },
      { model: "heading1", view: "h1", title: "Heading 1", class: "" },
      { model: "heading2", view: "h2", title: "Heading 2", class: "" },
      { model: "heading3", view: "h3", title: "Heading 3", class: "" },
    ],
  },

  image: {
    toolbar: [
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
      "|",
      "toggleImageCaption",
      "imageTextAlternative",
    ],
  },

  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },

  mediaEmbed: {
    // Store the media URL in data rather than an iframe preview.
    previewsInData: false,
  },
};
