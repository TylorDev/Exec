"use client";

import { CssMockupPreview } from "@/components/Viewport/CssMockupPreview/CssMockupPreview";
import { CAMERA_PRESETS, getActiveCameraPreset } from "@/data/cameraPresets";
import { useEditorStore } from "@/store/editorStore";
import styles from "./Presets.module.scss";

export function Presets() {
  const activeLayer = useEditorStore((state) => state.layers.find((layer) => layer.id === state.activeLayerId) ?? state.layers[0]);
  const applyCameraPreset = useEditorStore((state) => state.applyCameraPreset);
  const activePreset = getActiveCameraPreset(activeLayer.transform);

  return (
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
            <CssMockupPreview mockup={activeLayer.mockup} transform={preset.transform} variant="card" />
          </span>
          <span className={styles.presetMeta}>
            <strong>{preset.label}</strong>
            <small>{preset.description}</small>
          </span>
        </button>
      ))}
    </div>
  );
}
