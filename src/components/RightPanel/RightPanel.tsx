"use client";

import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button/Button";
import { ControlGroup } from "@/components/ControlGroup/ControlGroup";
import { CssMockupPreview } from "@/components/CssMockupPreview/CssMockupPreview";
import { ScrollPanel } from "@/components/ScrollPanel/ScrollPanel";
import { SelectControl } from "@/components/SelectControl/SelectControl";
import { SliderControl } from "@/components/SliderControl/SliderControl";
import { CAMERA_PRESETS, getActiveCameraPreset } from "@/data/cameraPresets";
import { useEditorStore } from "@/store/editorStore";
import { canEncodeExportFormat, exportScene, getExportErrorMessage } from "@/utils/exportScene";
import { getSceneResolution } from "@/utils/scene";
import type { ExportFormat } from "@/types/editor";
import styles from "./RightPanel.module.scss";

interface RightPanelProps {
  sceneRef: React.RefObject<HTMLDivElement | null>;
}

const BASE_FORMAT_OPTIONS: Array<{ label: string; value: ExportFormat }> = [
  { label: "PNG", value: "png" },
  { label: "JPG", value: "jpg" },
  { label: "JPEG", value: "jpeg" },
  { label: "WebP", value: "webp" },
  { label: "AVIF", value: "avif" },
];

export function RightPanel({ sceneRef }: RightPanelProps) {
  const frame = useEditorStore((state) => state.frame);
  const camera = useEditorStore((state) => state.camera);
  const mockup = useEditorStore((state) => state.mockup);
  const exportSettings = useEditorStore((state) => state.exportSettings);
  const setCamera = useEditorStore((state) => state.setCamera);
  const applyCameraPreset = useEditorStore((state) => state.applyCameraPreset);
  const setExportFormat = useEditorStore((state) => state.setExportFormat);
  const setExportQuality = useEditorStore((state) => state.setExportQuality);
  const setExportStatus = useEditorStore((state) => state.setExportStatus);
  const resolution = getSceneResolution(frame);
  const activePreset = getActiveCameraPreset(camera);
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
      const previewWidth = sceneRef.current.getBoundingClientRect().width || resolution.width;
      await exportScene({
        format: exportSettings.format,
        height: resolution.height,
        previewWidth,
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
    <aside className={styles.panel}>
      <ScrollPanel className={styles.scroll}>
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
        <ControlGroup title="Camera controls">
          <SliderControl label="Scene zoom" max={1.8} min={0.45} onChange={(zoom) => setCamera({ zoom })} step={0.01} value={Number(camera.zoom.toFixed(2))} />
          <SliderControl label="Move X" max={40} min={-40} onChange={(x) => setCamera({ x })} suffix="%" value={camera.x} />
          <SliderControl label="Move Y" max={40} min={-40} onChange={(y) => setCamera({ y })} suffix="%" value={camera.y} />
          <SliderControl label="Tilt" max={55} min={-55} onChange={(rotationX) => setCamera({ rotationX })} suffix="deg" value={camera.rotationX} />
          <SliderControl label="Yaw" max={55} min={-55} onChange={(rotationY) => setCamera({ rotationY })} suffix="deg" value={camera.rotationY} />
          <SliderControl label="Roll" max={30} min={-30} onChange={(rotationZ) => setCamera({ rotationZ })} suffix="deg" value={camera.rotationZ} />
          <SliderControl label="Perspective" max={70} min={28} onChange={(perspective) => setCamera({ perspective })} suffix="deg" value={camera.perspective} />
          <div className={styles.presets} suppressHydrationWarning>
            {CAMERA_PRESETS.map((preset) => (
              <button
                aria-pressed={activePreset === preset.value}
                className={styles.presetCard}
                key={preset.value}
                onClick={() => applyCameraPreset(preset.value)}
                type="button"
              >
                <span className={styles.presetPreview}>
                  <CssMockupPreview camera={preset.camera} variant="card" />
                </span>
                <span className={styles.presetMeta}>
                  <strong>{preset.label}</strong>
                  <small>{preset.description}</small>
                </span>
              </button>
            ))}
          </div>
        </ControlGroup>
      </ScrollPanel>
    </aside>
  );
}
