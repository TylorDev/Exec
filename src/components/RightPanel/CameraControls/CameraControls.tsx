"use client";

import { ControlGroup } from "@/components/Global/ControlGroup/ControlGroup";
import { SegmentedControl } from "@/components/Global/SegmentedControl/SegmentedControl";
import { SliderControl } from "@/components/Global/SliderControl/SliderControl";
import { useEditorStore } from "@/store/editorStore";
import type { LayerCount, LayerId } from "@/types/editor";
import styles from "./CameraControls.module.scss";

const LAYOUT_OPTIONS: Array<{ label: string; value: `${LayerCount}` }> = [
  { label: "1 Layer", value: "1" },
  { label: "2 Layers", value: "2" },
  { label: "3 Layers", value: "3" },
];

export function CameraControls() {
  const activeLayerCount = useEditorStore((state) => state.activeLayerCount);
  const activeLayerId = useEditorStore((state) => state.activeLayerId);
  const activeLayer = useEditorStore((state) => state.layers.find((layer) => layer.id === state.activeLayerId) ?? state.layers[0]);
  const applyLayerLayout = useEditorStore((state) => state.applyLayerLayout);
  const setActiveLayerId = useEditorStore((state) => state.setActiveLayerId);
  const setActiveLayerTransform = useEditorStore((state) => state.setActiveLayerTransform);
  const layerOptions = Array.from({ length: activeLayerCount }, (_, index) => {
    const id = (index + 1) as LayerId;
    return { label: `Layer ${id}`, value: String(id) as `${LayerId}` };
  });
  const transform = activeLayer.transform;

  return (
    <ControlGroup title="Layer controls">
      <div className={styles.controls}>
        <SegmentedControl
          label="Layout"
          onChange={(value) => applyLayerLayout(Number(value) as LayerCount)}
          options={LAYOUT_OPTIONS}
          value={String(activeLayerCount) as `${LayerCount}`}
        />
        <SegmentedControl
          label="Layer"
          onChange={(value) => setActiveLayerId(Number(value) as LayerId)}
          options={layerOptions}
          value={String(activeLayerId) as `${LayerId}`}
        />
        <SliderControl label="Scale" max={1.8} min={0.45} onChange={(scale) => setActiveLayerTransform({ scale })} step={0.01} value={Number(transform.scale.toFixed(2))} />
        <SliderControl label="Position X" max={40} min={-40} onChange={(positionX) => setActiveLayerTransform({ positionX })} suffix="%" value={transform.positionX} />
        <SliderControl label="Position Y" max={40} min={-40} onChange={(positionY) => setActiveLayerTransform({ positionY })} suffix="%" value={transform.positionY} />
        <SliderControl label="Position Z" max={180} min={-180} onChange={(positionZ) => setActiveLayerTransform({ positionZ })} suffix="px" value={transform.positionZ} />
        <SliderControl label="Rotation X" max={55} min={-55} onChange={(rotationX) => setActiveLayerTransform({ rotationX })} suffix="deg" value={transform.rotationX} />
        <SliderControl label="Rotation Y" max={55} min={-55} onChange={(rotationY) => setActiveLayerTransform({ rotationY })} suffix="deg" value={transform.rotationY} />
        <SliderControl label="Rotation Z" max={30} min={-30} onChange={(rotationZ) => setActiveLayerTransform({ rotationZ })} suffix="deg" value={transform.rotationZ} />
        <SliderControl label="Perspective" max={70} min={28} onChange={(perspective) => setActiveLayerTransform({ perspective })} suffix="deg" value={transform.perspective} />
      </div>
    </ControlGroup>
  );
}
