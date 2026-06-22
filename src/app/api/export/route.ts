import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium, type Browser } from "playwright-core";
import { NextRequest, NextResponse } from "next/server";
import type { ExportFormat } from "@/types/editor";
import type { ServerExportPayload } from "@/types/export";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const runtime = "nodejs";

const MIME_BY_FORMAT: Record<ExportFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
};

const SUPPORTED_SERVER_FORMATS = new Set<ExportFormat>(["png", "jpg", "jpeg", "webp"]);

const getOrigin = (request: NextRequest) => {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    return `${forwardedProto ?? "https"}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
};

const getScreenshotFormat = (format: ExportFormat): "jpeg" | "png" | "webp" => {
  if (format === "jpg" || format === "jpeg") return "jpeg";
  if (format === "webp") return "webp";
  return "png";
};

const launchBrowser = async () => {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (executablePath) {
    return playwrightChromium.launch({ executablePath, headless: true });
  }

  try {
    return await playwrightChromium.launch({ channel: "chrome", headless: true });
  } catch {
    return playwrightChromium.launch({ channel: "msedge", headless: true });
  }
};

const validatePayload = (payload: ServerExportPayload) => {
  if (!SUPPORTED_SERVER_FORMATS.has(payload.format)) {
    throw new Error("This export format is not supported by the Chromium server export yet.");
  }

  if (!Number.isFinite(payload.width) || !Number.isFinite(payload.height) || payload.width < 1 || payload.height < 1) {
    throw new Error("Invalid export size.");
  }

  const visibleLayers = payload.snapshot.layers.filter((layer) => layer.id <= payload.snapshot.activeLayerCount);

  if (!visibleLayers.some((layer) => layer.mockup.imageUrl && !layer.mockup.hideImage)) {
    throw new Error("Upload a screenshot before exporting.");
  }
};

const captureScene = async (browser: Browser, request: NextRequest, payload: ServerExportPayload) => {
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: {
      height: payload.height,
      width: payload.width,
    },
  });

  const renderUrl = new URL("/export/render", getOrigin(request));
  await page.goto(renderUrl.toString(), { waitUntil: "networkidle" });
  await page.waitForFunction(() => typeof window.renderExecExport === "function");
  await page.evaluate((nextPayload) => window.renderExecExport?.(nextPayload), payload);
  await page.locator('[data-export-scene="true"]').waitFor({ state: "visible" });

  if (payload.transparent && payload.format === "png") {
    const transparentClient = await page.context().newCDPSession(page);
    await transparentClient.send("Emulation.setDefaultBackgroundColorOverride", {
      color: { a: 0, b: 0, g: 0, r: 0 },
    });
    await transparentClient.detach();
  }

  const client = await page.context().newCDPSession(page);
  const result = await client.send("Page.captureScreenshot", {
    captureBeyondViewport: false,
    clip: {
      height: payload.height,
      scale: 1,
      width: payload.width,
      x: 0,
      y: 0,
    },
    format: getScreenshotFormat(payload.format),
    fromSurface: true,
    quality: payload.format === "png" ? undefined : Math.round(payload.quality * 100),
  });
  await client.detach();
  await page.close();

  return Buffer.from(result.data, "base64");
};

export async function POST(request: NextRequest) {
  let browser: Browser | null = null;

  try {
    const payload = (await request.json()) as ServerExportPayload;
    validatePayload(payload);

    browser = await launchBrowser();
    const image = await captureScene(browser, request, payload);

    return new NextResponse(image, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="exec-export.${payload.format}"`,
        "Content-Type": MIME_BY_FORMAT[payload.format],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
