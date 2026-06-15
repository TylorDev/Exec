import type { ExportFormat } from "@/types/editor";

const MIME_BY_FORMAT: Record<ExportFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
};

export interface ExportSceneOptions {
  node: HTMLElement;
  width: number;
  height: number;
  format: ExportFormat;
  quality: number;
  transparent: boolean;
}

const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("The browser could not create this image."));
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

export async function exportScene({ node, width, height, format, quality, transparent }: ExportSceneOptions) {
  const { toCanvas } = await import("html-to-image");
  const mimeType = MIME_BY_FORMAT[format];
  const canvas = await toCanvas(node, {
    cacheBust: true,
    pixelRatio: 1,
    width,
    height,
    canvasWidth: width,
    canvasHeight: height,
    backgroundColor: transparent ? undefined : undefined,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: "none",
    },
  });
  const blob = await canvasToBlob(canvas, mimeType, quality);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `exec-export.${format}`;
  link.click();
  URL.revokeObjectURL(url);
}
