// ─── Backend Upload Adapter for CKEditor 5 ───────────────────────────────────
//
// Posts image files to the backend API at /cloudinary/uploads.
// No "use client" — no React imports; safe for both server and browser graph.

const UPLOAD_API = "http://localhost:3002/cloudinary/uploads";

// ─── Local type shims ─────────────────────────────────────────────────────────

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

// ─── Plugin factory ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildUploadPlugin(): new (editor: any) => any {
  return class BackendUploadPlugin {
    static readonly pluginName = "BackendUploadPlugin" as const;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get requires(): any[] {
      return ["FileRepository"];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(editor: any) {
      editor.plugins.get("FileRepository").createUploadAdapter = (
        loader: FileLoader
      ): UploadAdapter => new BackendUploadAdapter(loader);
    }
  };
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

class BackendUploadAdapter implements UploadAdapter {
  private readonly loader: FileLoader;
  private controller = new AbortController();

  constructor(loader: FileLoader) {
    this.loader = loader;
  }

  async upload(): Promise<UploadResponse> {
    const file = await this.loader.file;
    if (!file) throw new Error("No file to upload.");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(UPLOAD_API, {
      method: "POST",
      body: formData,
      signal: this.controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
    }

    // Accept common response shapes from NestJS Cloudinary handlers.
    const data = (await res.json()) as Record<string, unknown>;
    const url =
      (data.url as string) ??
      (data.secure_url as string) ??
      ((data.data as Record<string, string> | undefined)?.url) ??
      ((data.data as Record<string, string> | undefined)?.secure_url);

    if (!url) throw new Error("Upload response missing image URL.");

    // CKEditor reads `default` as the URL to insert.
    return { default: url };
  }

  abort(): void {
    this.controller.abort();
    this.controller = new AbortController();
  }
}
