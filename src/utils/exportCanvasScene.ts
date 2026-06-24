import { BACKGROUNDS } from "@/data/backgrounds";
import type { EditorSnapshot, ExportFormat, FrameState, LayerState, MockupState } from "@/types/editor";
import { getCanonicalExportScale } from "@/utils/exportScale";
import { createLiquidGlassMaps } from "@/utils/liquidGlass";

interface ExportCanvasSceneOptions {
  format: ExportFormat;
  height: number;
  quality: number;
  snapshot: EditorSnapshot;
  transparent: boolean;
  width: number;
}

interface Rect {
  height: number;
  width: number;
  x: number;
  y: number;
}

const MIME_BY_FORMAT: Record<ExportFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clampByte = (value: number) => clamp(Math.round(value), 0, 255);

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load an image for canvas export."));
    image.src = src;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, format: ExportFormat, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`${format.toUpperCase()} export is not supported by this browser.`));
          return;
        }

        resolve(blob);
      },
      MIME_BY_FORMAT[format],
      quality,
    );
  });

const downloadBlob = (blob: Blob, format: ExportFormat) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `exec-export.${format}`;
  link.click();
  URL.revokeObjectURL(url);
};

const hexToRgb = (hexColor: string, fallback: [number, number, number] = [137, 247, 220]) => {
  const normalized = hexColor.replace("#", "").trim();
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) return fallback;

  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ] as [number, number, number];
};

const parseCssColors = (css: string) => {
  const matches = css.match(/#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)/g);
  return matches?.filter((color) => color !== "transparent") ?? ["#11131b"];
};

const createGradient = (context: CanvasRenderingContext2D, css: string, width: number, height: number) => {
  const colors = parseCssColors(css);
  const gradient = css.includes("radial-gradient")
    ? context.createRadialGradient(width * 0.5, height * 0.45, 0, width * 0.5, height * 0.45, Math.max(width, height) * 0.7)
    : context.createLinearGradient(0, 0, width, height);

  colors.forEach((color, index) => {
    gradient.addColorStop(colors.length === 1 ? 0 : index / (colors.length - 1), color);
  });

  return gradient;
};

const coverImageRect = (image: HTMLImageElement, rect: Rect): Rect => {
  const imageRatio = image.naturalWidth / Math.max(1, image.naturalHeight);
  const rectRatio = rect.width / Math.max(1, rect.height);
  const width = imageRatio > rectRatio ? rect.height * imageRatio : rect.width;
  const height = imageRatio > rectRatio ? rect.height : rect.width / imageRatio;

  return {
    height,
    width,
    x: rect.x + (rect.width - width) / 2,
    y: rect.y + (rect.height - height) / 2,
  };
};

const roundedRect = (context: CanvasRenderingContext2D, rect: Rect, radius: number) => {
  const safeRadius = clamp(radius, 0, Math.min(rect.width, rect.height) / 2);
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;

  context.beginPath();
  context.moveTo(rect.x + safeRadius, rect.y);
  context.lineTo(right - safeRadius, rect.y);
  context.quadraticCurveTo(right, rect.y, right, rect.y + safeRadius);
  context.lineTo(right, bottom - safeRadius);
  context.quadraticCurveTo(right, bottom, right - safeRadius, bottom);
  context.lineTo(rect.x + safeRadius, bottom);
  context.quadraticCurveTo(rect.x, bottom, rect.x, bottom - safeRadius);
  context.lineTo(rect.x, rect.y + safeRadius);
  context.quadraticCurveTo(rect.x, rect.y, rect.x + safeRadius, rect.y);
  context.closePath();
};

const drawRoundedImage = (context: CanvasRenderingContext2D, image: HTMLImageElement, rect: Rect, radius: number) => {
  context.save();
  roundedRect(context, rect, radius);
  context.clip();
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  context.restore();
};

const drawBackground = async (context: CanvasRenderingContext2D, frame: FrameState, width: number, height: number, transparent: boolean) => {
  if (transparent || frame.backgroundMode === "transparent") {
    context.clearRect(0, 0, width, height);
    return;
  }

  if (frame.backgroundMode === "solid") {
    context.fillStyle = frame.solidColor;
    context.fillRect(0, 0, width, height);
    return;
  }

  if (frame.backgroundImageUrl) {
    const image = await loadImage(frame.backgroundImageUrl);
    const rect = coverImageRect(image, { height, width, x: 0, y: 0 });
    context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    return;
  }

  const preset = BACKGROUNDS.find((background) => background.id === frame.selectedBackgroundId) ?? BACKGROUNDS[0];
  context.fillStyle = preset.css.includes("gradient") ? createGradient(context, preset.css, width, height) : preset.css;
  context.fillRect(0, 0, width, height);
};

const createBlurredCanvas = (source: HTMLCanvasElement, blur: number) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable.");

  canvas.width = source.width;
  canvas.height = source.height;
  context.filter = `blur(${Math.max(0, blur)}px) saturate(1.35)`;
  context.drawImage(source, 0, 0);
  return canvas;
};

const drawNoise = (context: CanvasRenderingContext2D, width: number, height: number, opacity: number) => {
  if (opacity <= 0) return;

  context.save();
  context.globalAlpha = opacity;
  context.fillStyle = "rgba(255, 255, 255, 0.42)";
  for (let y = 0; y < height; y += 5) {
    for (let x = 0; x < width; x += 5) {
      if ((x * 17 + y * 31) % 23 < 8) context.fillRect(x, y, 1, 1);
    }
  }
  context.restore();
};

const drawFrameShadow = (context: CanvasRenderingContext2D, rect: Rect, radius: number, mockup: MockupState, scale: number) => {
  const shadowOpacity = mockup.shadow === "none" ? 0 : mockup.shadowOpacity / 100;
  if (shadowOpacity <= 0) return;

  context.save();
  context.shadowBlur = mockup.shadowBlur * scale;
  context.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`;
  context.shadowOffsetX = mockup.shadowX * scale;
  context.shadowOffsetY = mockup.shadowY * scale;
  context.fillStyle = "rgba(0, 0, 0, 0.02)";
  roundedRect(context, rect, radius);
  context.fill();
  context.restore();
};

const getFrameFill = (mockup: MockupState) => {
  if (mockup.style === "solid-border") return "rgba(16, 19, 27, 0.96)";
  if (mockup.style === "bevel") return "rgba(34, 38, 49, 0.86)";
  if (mockup.style === "outline") return "rgba(255, 255, 255, 0.03)";
  if (mockup.style === "soft-glow") return "rgba(255, 255, 255, 0.08)";
  if (mockup.style === "liquid-glass") return "rgba(190, 255, 236, 0.16)";
  if (mockup.style === "stack") return "rgba(255, 255, 255, 0.12)";
  return "rgba(255, 255, 255, 0.12)";
};

const drawStandardFrame = (context: CanvasRenderingContext2D, rect: Rect, radius: number, borderWidth: number, mockup: MockupState) => {
  if (mockup.style === "minimal") return;

  context.save();
  roundedRect(context, rect, radius);
  context.fillStyle = getFrameFill(mockup);
  context.fill();
  context.lineWidth = Math.max(1, borderWidth * (mockup.style === "outline" ? 0.18 : 0.12));
  context.strokeStyle = mockup.style === "solid-border" || mockup.style === "outline" ? "rgba(255, 255, 255, 0.76)" : "rgba(255, 255, 255, 0.22)";
  roundedRect(context, rect, radius);
  context.stroke();

  if (mockup.style === "stack") {
    context.globalAlpha = 0.35;
    roundedRect(context, { ...rect, x: rect.x + borderWidth * 0.5, y: rect.y + borderWidth * 0.5 }, radius);
    context.stroke();
  }

  context.restore();
};

const getImageDataFromUrl = async (url: string, width: number, height: number) => {
  const image = await loadImage(url);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable.");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
};

const sampleImageData = (imageData: ImageData, x: number, y: number) => {
  const sampleX = clamp(Math.round(x), 0, imageData.width - 1);
  const sampleY = clamp(Math.round(y), 0, imageData.height - 1);
  const index = (sampleY * imageData.width + sampleX) * 4;

  return [
    imageData.data[index],
    imageData.data[index + 1],
    imageData.data[index + 2],
    imageData.data[index + 3],
  ] as const;
};

const drawHeavyGlass = async (
  context: CanvasRenderingContext2D,
  baseCanvas: HTMLCanvasElement,
  rect: Rect,
  sampleRect: Rect,
  radius: number,
  borderWidth: number,
  mockup: MockupState,
  scale: number,
) => {
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const maps = createLiquidGlassMaps({
    width,
    height,
    borderRadius: radius,
    bezelWidth: Math.max(1, borderWidth),
    glassRefraction: mockup.glassRefraction,
    glassThickness: mockup.glassThickness * scale,
    glassSpecular: mockup.glassSpecular,
    glassColor: mockup.glassColor,
    glassHighlightsEnabled: mockup.glassHighlightsEnabled,
    glassLightColor: mockup.glassLightColor,
  });
  const blurredCanvas = createBlurredCanvas(baseCanvas, mockup.glassBlur * scale);
  const blurredContext = blurredCanvas.getContext("2d");
  if (!blurredContext) throw new Error("Canvas 2D context is unavailable.");

  const backgroundData = blurredContext.getImageData(0, 0, blurredCanvas.width, blurredCanvas.height);
  const displacementData = await getImageDataFromUrl(maps.displacementMapUrl, maps.width, maps.height);
  const specularData = await getImageDataFromUrl(maps.specularMapUrl, maps.width, maps.height);
  const glassCanvas = document.createElement("canvas");
  const glassContext = glassCanvas.getContext("2d");
  if (!glassContext) throw new Error("Canvas 2D context is unavailable.");

  glassCanvas.width = width;
  glassCanvas.height = height;
  const glassData = glassContext.createImageData(width, height);
  const glassColor = hexToRgb(mockup.glassColor);
  const lightColor = hexToRgb(mockup.glassLightColor, [255, 255, 255]);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const outputIndex = (y * width + x) * 4;
      const mapX = clamp(Math.round((x / Math.max(1, width - 1)) * (maps.width - 1)), 0, maps.width - 1);
      const mapY = clamp(Math.round((y / Math.max(1, height - 1)) * (maps.height - 1)), 0, maps.height - 1);
      const mapIndex = (mapY * maps.width + mapX) * 4;
      const vectorX = (displacementData.data[mapIndex] - 128) / 127;
      const vectorY = (displacementData.data[mapIndex + 1] - 128) / 127;
      const sampleX = sampleRect.x + (x / width) * sampleRect.width + vectorX * maps.scale;
      const sampleY = sampleRect.y + (y / height) * sampleRect.height + vectorY * maps.scale;
      const [red, green, blue, alpha] = sampleImageData(backgroundData, sampleX, sampleY);
      const specularAlpha = specularData.data[mapIndex + 3] / 255;
      const tintAmount = 0.14;

      glassData.data[outputIndex] = clampByte(red * (1 - tintAmount) + glassColor[0] * tintAmount + lightColor[0] * specularAlpha * 0.44);
      glassData.data[outputIndex + 1] = clampByte(green * (1 - tintAmount) + glassColor[1] * tintAmount + lightColor[1] * specularAlpha * 0.44);
      glassData.data[outputIndex + 2] = clampByte(blue * (1 - tintAmount) + glassColor[2] * tintAmount + lightColor[2] * specularAlpha * 0.44);
      glassData.data[outputIndex + 3] = clampByte(alpha * (0.68 + specularAlpha * 0.24));
    }
  }

  glassContext.putImageData(glassData, 0, 0);
  context.save();
  roundedRect(context, rect, radius);
  context.clip();
  context.drawImage(glassCanvas, rect.x, rect.y, rect.width, rect.height);

  const highlight = context.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
  highlight.addColorStop(0, `rgba(${lightColor.join(",")}, ${mockup.glassHighlightsEnabled ? 0.34 : 0.04})`);
  highlight.addColorStop(0.35, `rgba(${glassColor.join(",")}, 0.12)`);
  highlight.addColorStop(1, `rgba(${glassColor.join(",")}, 0.22)`);
  context.fillStyle = highlight;
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
  context.restore();

  context.lineWidth = Math.max(2, borderWidth * 0.2);
  context.strokeStyle = `rgba(${glassColor.join(",")}, 0.7)`;
  roundedRect(context, rect, radius);
  context.stroke();
};

const drawBrowserBar = (context: CanvasRenderingContext2D, rect: Rect, radius: number, scale: number) => {
  const dotRadius = Math.max(3, 4.5 * scale);
  const y = rect.y + rect.height / 2;
  const left = rect.x + 14 * scale;

  context.save();
  roundedRect(context, rect, radius);
  context.clip();
  context.fillStyle = "rgba(9, 12, 22, 0.78)";
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
  ["#ff5f57", "#ffbd2e", "#28c840"].forEach((color, index) => {
    context.beginPath();
    context.fillStyle = color;
    context.arc(left + index * dotRadius * 2.6, y, dotRadius, 0, Math.PI * 2);
    context.fill();
  });
  roundedRect(context, { height: rect.height * 0.52, width: rect.width - 76 * scale, x: rect.x + 62 * scale, y: rect.y + rect.height * 0.24 }, rect.height * 0.25);
  context.fillStyle = "rgba(255, 255, 255, 0.08)";
  context.fill();
  context.restore();
};

const getMockupRects = (image: HTMLImageElement, mockup: MockupState, width: number, height: number, scale: number) => {
  const borderWidth = mockup.style === "minimal" ? 0 : mockup.borderWidth * scale;
  const browserBarHeight = mockup.mode === "browser" ? 34 * scale : 0;
  const maxOuterWidth = width * 0.72;
  const availableContentWidth = Math.max(1, maxOuterWidth - borderWidth * 2);
  const imageRatio = image.naturalWidth / Math.max(1, image.naturalHeight);
  const contentWidth = availableContentWidth;
  const contentHeight = contentWidth / imageRatio + browserBarHeight;
  const outerWidth = contentWidth + borderWidth * 2;
  const outerHeight = contentHeight + borderWidth * 2;

  return {
    borderWidth,
    browserBarHeight,
    imageRect: {
      height: contentWidth / imageRatio,
      width: contentWidth,
      x: -contentWidth / 2,
      y: -contentHeight / 2 + browserBarHeight,
    },
    outerRect: {
      height: outerHeight,
      width: outerWidth,
      x: -outerWidth / 2,
      y: -outerHeight / 2,
    },
  };
};

const drawMockup = async (context: CanvasRenderingContext2D, baseCanvas: HTMLCanvasElement, image: HTMLImageElement, layer: LayerState, width: number, height: number) => {
  const { mockup, transform } = layer;
  const scale = getCanonicalExportScale(width, height);
  const radius = mockup.borderRadius * scale;
  const rects = getMockupRects(image, mockup, width, height, scale);
  const centerX = width / 2 + (transform.positionX / 100) * rects.outerRect.width;
  const centerY = height / 2 + (transform.positionY / 100) * rects.outerRect.height;
  const totalScale = transform.scale;
  const rotation = (transform.rotationZ * Math.PI) / 180;

  context.save();
  context.translate(centerX, centerY);
  context.rotate(rotation);
  context.scale(totalScale, totalScale);

  drawFrameShadow(context, rects.outerRect, radius, mockup, scale);

  if (mockup.style === "true-liquid-glass-heavy") {
    const sampleRect = {
      height: rects.outerRect.height * totalScale,
      width: rects.outerRect.width * totalScale,
      x: centerX + rects.outerRect.x * totalScale,
      y: centerY + rects.outerRect.y * totalScale,
    };
    await drawHeavyGlass(context, baseCanvas, rects.outerRect, sampleRect, radius, rects.borderWidth, mockup, scale);
  } else {
    drawStandardFrame(context, rects.outerRect, radius, rects.borderWidth, mockup);
  }

  if (mockup.mode === "browser") {
    drawBrowserBar(
      context,
      {
        height: rects.browserBarHeight,
        width: rects.imageRect.width,
        x: rects.imageRect.x,
        y: rects.outerRect.y + rects.borderWidth,
      },
      Math.max(0, radius - rects.borderWidth),
      scale,
    );
  }

  const innerRadius = Math.max(0, radius - rects.borderWidth);
  drawRoundedImage(context, image, rects.imageRect, innerRadius);
  context.restore();
};

export async function exportCanvasScene(options: ExportCanvasSceneOptions) {
  if (options.format === "avif") {
    throw new Error("AVIF export is not supported by the Canvas/WebGL engine yet.");
  }

  const visibleLayers = options.snapshot.layers.filter((layer) => layer.id <= options.snapshot.activeLayerCount && layer.isVisible);
  const layer = visibleLayers.find((visibleLayer) => visibleLayer.mockup.imageUrl && !visibleLayer.mockup.hideImage);

  if (visibleLayers.length > 1) {
    throw new Error("Canvas/WebGL export supports one layer only. Use Chromium/Playwright for multi-layer scenes.");
  }

  if (!layer?.mockup.imageUrl) {
    throw new Error("Upload a screenshot before exporting.");
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable.");

  canvas.width = options.width;
  canvas.height = options.height;

  await drawBackground(context, options.snapshot.frame, options.width, options.height, options.transparent);

  if (options.snapshot.frame.blur > 0) {
    const blurredCanvas = createBlurredCanvas(canvas, options.snapshot.frame.blur * getCanonicalExportScale(options.width, options.height));
    context.clearRect(0, 0, options.width, options.height);
    context.drawImage(blurredCanvas, 0, 0);
  }

  drawNoise(context, options.width, options.height, options.snapshot.frame.noise / 100);

  if (options.snapshot.frame.overlayUrl) {
    const overlay = await loadImage(options.snapshot.frame.overlayUrl);
    const rect = coverImageRect(overlay, { height: options.height, width: options.width, x: 0, y: 0 });
    context.save();
    context.globalAlpha = options.snapshot.frame.overlayOpacity / 100;
    context.drawImage(overlay, rect.x, rect.y, rect.width, rect.height);
    context.restore();
  }

  const backgroundCanvas = document.createElement("canvas");
  const backgroundContext = backgroundCanvas.getContext("2d");
  if (!backgroundContext) throw new Error("Canvas 2D context is unavailable.");
  backgroundCanvas.width = canvas.width;
  backgroundCanvas.height = canvas.height;
  backgroundContext.drawImage(canvas, 0, 0);

  const mockupImage = await loadImage(layer.mockup.imageUrl);
  await drawMockup(context, backgroundCanvas, mockupImage, layer, options.width, options.height);

  const blob = await canvasToBlob(canvas, options.format, options.quality);
  downloadBlob(blob, options.format);
}
