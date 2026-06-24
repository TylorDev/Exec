import type { EditorSnapshot, ExportFormat } from "@/types/editor";
import type { ServerExportPayload } from "@/types/export";
import { exportCanvasScene } from "@/utils/exportCanvasScene";

const MIME_BY_FORMAT: Record<ExportFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
};

export function getExportMimeType(format: ExportFormat) {
  return MIME_BY_FORMAT[format];
}

export function canEncodeExportFormat(format: ExportFormat) {
  return Promise.resolve(format !== "avif");
}

export interface ExportSceneOptions {
  format: ExportFormat;
  height: number;
  quality: number;
  snapshot: EditorSnapshot;
  transparent: boolean;
  width: number;
}

export function getExportErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return `Unknown export error: ${JSON.stringify(error)}`;
  } catch {
    return "Unknown export error. Inspect DevTools console for the original value.";
  }
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image data."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not convert image to a data URL."));
        return;
      }

      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

const serializeAssetUrl = async (url: string | null) => {
  if (!url?.startsWith("blob:")) return url;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not read a local image for export.");
  return blobToDataUrl(await response.blob());
};

const makeSerializableSnapshot = async (snapshot: EditorSnapshot): Promise<EditorSnapshot> => ({
  ...snapshot,
  exportSettings: {
    ...snapshot.exportSettings,
    error: null,
    isExporting: false,
  },
  frame: {
    ...snapshot.frame,
    backgroundImageUrl: await serializeAssetUrl(snapshot.frame.backgroundImageUrl),
    backgroundImages: [],
    overlayUrl: await serializeAssetUrl(snapshot.frame.overlayUrl),
  },
  layers: await Promise.all(
    snapshot.layers.map(async (layer) => ({
      ...layer,
      mockup: {
        ...layer.mockup,
        imageUrl: await serializeAssetUrl(layer.mockup.imageUrl),
      },
      transform: { ...layer.transform },
    })),
  ),
});

const downloadBlob = (blob: Blob, format: ExportFormat) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `exec-export.${format}`;
  link.click();
  URL.revokeObjectURL(url);
};

const getServerError = async (response: Response) => {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Export failed with status ${response.status}.`;
  } catch {
    return `Export failed with status ${response.status}.`;
  }
};

export async function exportScene(options: ExportSceneOptions) {
  const visibleLayers = options.snapshot.layers.filter((layer) => layer.id <= options.snapshot.activeLayerCount && layer.isVisible);

  if (!visibleLayers.some((layer) => layer.mockup.imageUrl && !layer.mockup.hideImage)) {
    throw new Error("Upload a screenshot before exporting.");
  }

  if (options.format === "avif") {
    throw new Error("AVIF export is not supported by the Chromium server export yet.");
  }

  if (options.snapshot.exportSettings.renderEngine === "canvas" && visibleLayers.length > 1) {
    throw new Error("Canvas/WebGL export supports one layer only. Use Chromium/Playwright for multi-layer scenes.");
  }

  const payload: ServerExportPayload = {
    ...options,
    snapshot: await makeSerializableSnapshot(options.snapshot),
  };

  if (payload.snapshot.exportSettings.renderEngine === "canvas") {
    await exportCanvasScene(payload);
    return;
  }

  const response = await fetch("/api/export", {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await getServerError(response));
  }

  downloadBlob(await response.blob(), options.format);
}
