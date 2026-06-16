import type { ExportFormat } from "@/types/editor";

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
  if (format === "png" || format === "jpg" || format === "jpeg") return Promise.resolve(true);
  if (format === "avif") {
    return import("@jsquash/avif")
      .then(() => true)
      .catch(() => false);
  }

  return new Promise<boolean>((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    canvas.toBlob((blob) => resolve(blob?.type === getExportMimeType(format)), getExportMimeType(format), 0.8);
  });
}

export interface ExportSceneOptions {
  node: HTMLElement;
  width: number;
  height: number;
  format: ExportFormat;
  quality: number;
  transparent: boolean;
}

export function getExportErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const cause = error.cause instanceof Error ? ` Cause: ${error.cause.name}: ${error.cause.message}` : "";
    return `${error.name}: ${error.message}${cause}`;
  }

  if (error instanceof Event) {
    const target = error.target instanceof HTMLElement ? ` on ${error.target.tagName.toLowerCase()}` : "";
    return `Event error: ${error.type}${target}`;
  }

  if (typeof error === "string") return error;

  try {
    return `Unknown export error: ${JSON.stringify(error)}`;
  } catch {
    return "Unknown export error. Inspect DevTools console for the original value.";
  }
}

const wrapExportError = (phase: string, error: unknown) => new Error(`${phase}: ${getExportErrorMessage(error)}`, { cause: error });

const getExportImageName = (image: HTMLImageElement) => image.dataset.exportImage ?? image.alt ?? "unknown image";

const validateExportImages = async (node: HTMLElement) => {
  const images = Array.from(node.querySelectorAll("img"));

  await Promise.all(
    images.map(async (image) => {
      const name = getExportImageName(image);

      try {
        if (typeof image.decode === "function") {
          await image.decode();
        }
      } catch (error) {
        const detail = image.src.startsWith("blob:") ? " The local blob URL may be unreadable or revoked." : "";
        throw wrapExportError(`Image load failed: ${name}.${detail}`, error);
      }

      if (!image.complete || image.naturalWidth === 0) {
        const detail = image.src.startsWith("blob:") ? " The local blob URL may be unreadable or revoked." : "";
        throw new Error(`Image load failed: ${name}. The image is incomplete or has no readable dimensions.${detail}`);
      }
    }),
  );
};

const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("The browser could not create this image. The format may be unsupported, the canvas may be tainted, or an image may still be loading."));
          return;
        }

        if (mimeType !== "image/png" && blob.type !== mimeType) {
          reject(new Error(`${mimeType.replace("image/", "").toUpperCase()} export is not supported by this browser.`));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });

const canEncodeWithCanvas = (format: ExportFormat, quality: number) =>
  new Promise<boolean>((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    canvas.toBlob((blob) => resolve(blob?.type === getExportMimeType(format)), getExportMimeType(format), quality);
  });

const canvasToImageData = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  try {
    return context.getImageData(0, 0, canvas.width, canvas.height);
  } catch (error) {
    throw wrapExportError("Canvas pixel read failed. The canvas may be tainted by an image source.", error);
  }
};

const canvasToAvifBlob = async (canvas: HTMLCanvasElement, quality: number) => {
  if (await canEncodeWithCanvas("avif", quality)) {
    return canvasToBlob(canvas, getExportMimeType("avif"), quality);
  }

  let encode: typeof import("@jsquash/avif").encode;

  try {
    ({ encode } = await import("@jsquash/avif"));
  } catch (error) {
    throw wrapExportError("AVIF encoder load failed", error);
  }

  const imageData = canvasToImageData(canvas);

  try {
    const buffer = await encode(imageData, { quality: Math.round(quality * 100) });
    return new Blob([buffer], { type: getExportMimeType("avif") });
  } catch (error) {
    throw wrapExportError("AVIF encoding failed", error);
  }
};

export async function exportScene({ node, width, height, format, quality, transparent }: ExportSceneOptions) {
  let toCanvas: typeof import("html-to-image").toCanvas;

  try {
    ({ toCanvas } = await import("html-to-image"));
  } catch (error) {
    throw wrapExportError("Export library load failed", error);
  }

  const mimeType = getExportMimeType(format);
  let canvas: HTMLCanvasElement;

  try {
    await validateExportImages(node);
    canvas = await toCanvas(node, {
      cacheBust: false,
      pixelRatio: 1,
      width,
      height,
      canvasWidth: width,
      canvasHeight: height,
      backgroundColor: transparent ? undefined : undefined,
      style: {
        height: `${height}px`,
        maxHeight: `${height}px`,
        maxWidth: `${width}px`,
        minHeight: `${height}px`,
        minWidth: `${width}px`,
        transform: "none",
        width: `${width}px`,
      },
    });
  } catch (error) {
    throw wrapExportError("Render failed", error);
  }

  let blob: Blob;

  try {
    blob = format === "avif" ? await canvasToAvifBlob(canvas, quality) : await canvasToBlob(canvas, mimeType, quality);
  } catch (error) {
    throw wrapExportError("Canvas conversion failed", error);
  }

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exec-export.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    throw wrapExportError("Download failed", error);
  }
}
