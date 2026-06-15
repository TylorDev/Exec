"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/Button/Button";
import { ControlGroup } from "@/components/ControlGroup/ControlGroup";
import { CssMockupPreview } from "@/components/CssMockupPreview/CssMockupPreview";
import { ScrollPanel } from "@/components/ScrollPanel/ScrollPanel";
import { SelectControl } from "@/components/SelectControl/SelectControl";
import { SliderControl } from "@/components/SliderControl/SliderControl";
import { CAMERA_PRESETS, getActiveCameraPreset } from "@/data/cameraPresets";
import { useEditorStore } from "@/store/editorStore";
import { exportScene } from "@/utils/exportScene";
import { getSceneResolution } from "@/utils/scene";
import type { ExportFormat } from "@/types/editor";
import styles from "./RightPanel.module.scss";

interface RightPanelProps {
  sceneRef: React.RefObject<HTMLDivElement | null>;
}

export function RightPanel({ sceneRef }: RightPanelProps) {
  const frame = useEditorStore((state) => state.frame);
  const camera = useEditorStore((state) => state.camera);
  const exportSettings = useEditorStore((state) => state.exportSettings);
  const setCamera = useEditorStore((state) => state.setCamera);
  const applyCameraPreset = useEditorStore((state) => state.applyCameraPreset);
  const setExportFormat = useEditorStore((state) => state.setExportFormat);
  const setExportQuality = useEditorStore((state) => state.setExportQuality);
  const setExportStatus = useEditorStore((state) => state.setExportStatus);
  const resolution = getSceneResolution(frame);
  const activePreset = getActiveCameraPreset(camera);

  const handleExport = async () => {
    if (!sceneRef.current) return;
    setExportStatus({ error: null, isExporting: true });
    try {
      await exportScene({
        node: sceneRef.current,
        width: resolution.width,
        height: resolution.height,
        format: exportSettings.format,
        quality: exportSettings.quality,
        transparent: frame.backgroundMode === "transparent",
      });
      setExportStatus({ error: null, isExporting: false });
    } catch (error) {
      setExportStatus({
        error: error instanceof Error ? error.message : "Export failed.",
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
            options={[
              { label: "PNG", value: "png" },
              { label: "JPG", value: "jpg" },
              { label: "JPEG", value: "jpeg" },
              { label: "WebP", value: "webp" },
              { label: "AVIF", value: "avif" },
            ]}
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
