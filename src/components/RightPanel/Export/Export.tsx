"use client";

import { Download } from "lucide-react";
import { useEffect, useMemo, useState, type RefObject } from "react";
import { Button } from "@/components/Global/Button/Button";
import { ControlGroup } from "@/components/Global/ControlGroup/ControlGroup";
import { SelectControl } from "@/components/Global/SelectControl/SelectControl";
import { SliderControl } from "@/components/Global/SliderControl/SliderControl";
import { useEditorStore } from "@/store/editorStore";
import { canEncodeExportFormat, exportScene, getExportErrorMessage } from "@/utils/exportScene";
import { getSceneResolution } from "@/utils/scene";
import type { ExportFormat, RenderEngine } from "@/types/editor";
import styles from "./Export.module.scss";

interface ExportProps {
  sceneRef: RefObject<HTMLDivElement | null>;
}

const BASE_FORMAT_OPTIONS: Array<{ label: string; value: ExportFormat }> = [
  { label: "PNG", value: "png" },
  { label: "JPG", value: "jpg" },
  { label: "JPEG", value: "jpeg" },
  { label: "WebP", value: "webp" },
  { label: "AVIF", value: "avif" },
];

const RENDER_ENGINE_OPTIONS: Array<{ label: string; value: RenderEngine }> = [
  { label: "Chromium/Playwright", value: "chromium" },
  { label: "Canvas/WebGL", value: "canvas" },
];

export function Export({ sceneRef }: ExportProps) {
  const frame = useEditorStore((state) => state.frame);
  const camera = useEditorStore((state) => state.camera);
  const mockup = useEditorStore((state) => state.mockup);
  const exportSettings = useEditorStore((state) => state.exportSettings);
  const setExportFormat = useEditorStore((state) => state.setExportFormat);
  const setExportQuality = useEditorStore((state) => state.setExportQuality);
  const setExportRenderEngine = useEditorStore((state) => state.setExportRenderEngine);
  const setExportStatus = useEditorStore((state) => state.setExportStatus);
  const resolution = getSceneResolution(frame);
  const [formatSupport, setFormatSupport] = useState<Partial<Record<ExportFormat, boolean>>>({
    jpeg: true,
    jpg: true,
    png: true,
  });

  useEffect(() => {
    let active = true;

    const detectSupport = async () => {
      const entries = await Promise.all(BASE_FORMAT_OPTIONS.map(async (option) => [option.value, await canEncodeExportFormat(option.value)] as const));
      if (!active) return;

      const nextSupport = Object.fromEntries(entries) as Record<ExportFormat, boolean>;
      setFormatSupport(nextSupport);
    };

    detectSupport();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (formatSupport[exportSettings.format] !== false) return;

    setExportFormat("png");
    setExportStatus({
      error: `${exportSettings.format.toUpperCase()} export is not supported by this browser. Switched to PNG.`,
      isExporting: false,
    });
  }, [exportSettings.format, formatSupport, setExportFormat, setExportStatus]);

  const formatOptions = useMemo(
    () =>
      BASE_FORMAT_OPTIONS.map((option) => {
        const supported = formatSupport[option.value] ?? true;
        return {
          ...option,
          description: supported ? undefined : "not supported",
          disabled: !supported,
        };
      }),
    [formatSupport],
  );

  const handleExport = async () => {
    if (!sceneRef.current) return;
    if (formatSupport[exportSettings.format] === false) {
      setExportStatus({
        error: `${exportSettings.format.toUpperCase()} export is not supported by this browser. Select another format.`,
        isExporting: false,
      });
      return;
    }
    setExportStatus({ error: null, isExporting: true });
    try {
      await exportScene({
        format: exportSettings.format,
        height: resolution.height,
        quality: exportSettings.quality,
        snapshot: {
          camera,
          exportSettings,
          frame,
          mockup,
          ui: useEditorStore.getState().ui,
        },
        transparent: frame.backgroundMode === "transparent",
        width: resolution.width,
      });
      setExportStatus({ error: null, isExporting: false });
    } catch (error) {
      console.error("Export failed", error);
      setExportStatus({
        error: getExportErrorMessage(error),
        isExporting: false,
      });
    }
  };

  return (
    <ControlGroup title="Export">
      <div className={styles.resolution}>
        <span>Output</span>
        <strong>
          {resolution.width} x {resolution.height}
        </strong>
      </div>
      <SelectControl<ExportFormat>
        label="Format"
        onChange={setExportFormat}
        options={formatOptions}
        value={exportSettings.format}
      />
      <SelectControl<RenderEngine>
        label="Render engine"
        onChange={setExportRenderEngine}
        options={RENDER_ENGINE_OPTIONS}
        value={exportSettings.renderEngine}
      />
      <SliderControl
        label="Quality"
        max={1}
        min={0.2}
        onChange={setExportQuality}
        step={0.01}
        value={Number(exportSettings.quality.toFixed(2))}
      />
      <Button disabled={exportSettings.isExporting} icon={<Download />} onClick={handleExport} variant="primary">
        {exportSettings.isExporting ? "Exporting" : "Export image"}
      </Button>
      {exportSettings.error ? <p className={styles.error}>{exportSettings.error}</p> : null}
    </ControlGroup>
  );
}
