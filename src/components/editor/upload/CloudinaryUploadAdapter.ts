// ─── Cloudinary Upload Adapter for CKEditor 5 ────────────────────────────────
//
// No "use client" directive — this file has no React imports and is safe for
// both the server and the browser module graph.

// ─── Local type shims ─────────────────────────────────────────────────────────
// Replaces imports from "ckeditor5" which is no longer a direct dependency.

interface FileLoader {
  file: Promise<File | null>;
}

interface UploadResponse {
  default: string;
  [key: string]: string;
}

interface UploadAdapter {
  upload(): Promise<UploadResponse>;
  abort(): void;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface CloudinaryConfig {
  uploadPreset: string;
  cloudName: string;
}

// ─── Plugin factory ───────────────────────────────────────────────────────────

/**
 * Returns a CKEditor 5 plugin class that wires the FileRepository to use our
 * Cloudinary adapter. Pass the returned class in `extraPlugins`.
 *
 * CKEditor requires plugin classes to have a static `pluginName` and optionally
 * a static `requires` array (used to ensure dependencies are loaded first).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildUploadPlugin(config: CloudinaryConfig): new (editor: any) => any {
  return class CloudinaryUploadPlugin {
    static readonly pluginName = "CloudinaryUploadPlugin" as const;

    // Declare FileRepository as a required dependency so CKEditor guarantees
    // it is loaded before this plugin is initialised.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get requires(): any[] {
      return ["FileRepository"];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(editor: any) {
      editor.plugins.get("FileRepository").createUploadAdapter = (
        loader: FileLoader
      ): UploadAdapter => new CloudinaryUploadAdapter(loader, config);
    }
  };
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

class CloudinaryUploadAdapter implements UploadAdapter {
  private readonly loader: FileLoader;
  private readonly config: CloudinaryConfig;
  private controller = new AbortController();

  constructor(loader: FileLoader, config: CloudinaryConfig) {
    this.loader = loader;
    this.config = config;
  }

  async upload(): Promise<UploadResponse> {
    const file = await this.loader.file;
    if (!file) throw new Error("No file to upload.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", this.config.uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`,
      { method: "POST", body: formData, signal: this.controller.signal }
    );

    if (!res.ok) {
      throw new Error(
        `Cloudinary upload failed: ${res.status} ${res.statusText}`
      );
    }

    const data = (await res.json()) as { secure_url: string };
    // CKEditor reads the `default` key as the URL to insert into the content.
    return { default: data.secure_url };
  }

  abort(): void {
    this.controller.abort();
    this.controller = new AbortController();
  }
}
