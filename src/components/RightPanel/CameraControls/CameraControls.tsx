"use client";

import { Blend, Box, ChevronDown, Circle, Eye, EyeOff, Hash, Lock, Plus, Shield, Tag, Unlock, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/Global/Button/Button";
import { ControlGroup } from "@/components/Global/ControlGroup/ControlGroup";
import { SegmentedControl } from "@/components/Global/SegmentedControl/SegmentedControl";
import { SliderControl } from "@/components/Global/SliderControl/SliderControl";
import { useEditorStore } from "@/store/editorStore";
import type { LayerCount, LayerId, LayerState, LayerTransform } from "@/types/editor";
import styles from "./CameraControls.module.scss";

const LAYOUT_OPTIONS: Array<{ label: string; value: `${LayerCount}` }> = [
  { label: "1 Layer", value: "1" },
  { label: "2 Layers", value: "2" },
  { label: "3 Layers", value: "3" },
];

const PLACEHOLDER_CONTROLS = [
  { icon: Tag, label: "Placeholder control 1" },
  { icon: Hash, label: "Placeholder control 2" },
  { icon: Shield, label: "Placeholder control 3" },
  { icon: Wand2, label: "Placeholder control 4" },
  { icon: Blend, label: "Placeholder control 5" },
  { icon: Box, label: "Placeholder control 6" },
];

const LAYER_SWATCHES: Record<LayerId, string> = {
  1: "#3f4cff",
  2: "#ffffff",
  3: "#32d296",
};

const getInitialExpandedLayers = (): Record<LayerId, boolean> => ({
  1: true,
  2: false,
  3: false,
});

interface LayerTransformControlsProps {
  layer: LayerState;
  onChange: (transform: Partial<LayerTransform>) => void;
}

function LayerTransformControls({ layer, onChange }: LayerTransformControlsProps) {
  const { transform } = layer;

  return (
    <div className={styles.layerControls}>
      <SliderControl disabled={layer.isLocked} label="Position X" max={40} min={-40} onChange={(positionX) => onChange({ positionX })} suffix="%" value={transform.positionX} />
      <SliderControl disabled={layer.isLocked} label="Position Y" max={40} min={-40} onChange={(positionY) => onChange({ positionY })} suffix="%" value={transform.positionY} />
      <SliderControl disabled={layer.isLocked} label="Position Z" max={180} min={-180} onChange={(positionZ) => onChange({ positionZ })} suffix="px" value={transform.positionZ} />
      <SliderControl disabled={layer.isLocked} label="Scale" max={1.8} min={0.45} onChange={(scale) => onChange({ scale })} step={0.01} value={Number(transform.scale.toFixed(2))} />
      <SliderControl disabled={layer.isLocked} label="Rotation X" max={55} min={-55} onChange={(rotationX) => onChange({ rotationX })} suffix="deg" value={transform.rotationX} />
      <SliderControl disabled={layer.isLocked} label="Rotation Y" max={55} min={-55} onChange={(rotationY) => onChange({ rotationY })} suffix="deg" value={transform.rotationY} />
      <SliderControl disabled={layer.isLocked} label="Rotation Z" max={30} min={-30} onChange={(rotationZ) => onChange({ rotationZ })} suffix="deg" value={transform.rotationZ} />
      <SliderControl disabled={layer.isLocked} label="Perspective" max={70} min={28} onChange={(perspective) => onChange({ perspective })} suffix="deg" value={transform.perspective} />
    </div>
  );
}

export function CameraControls() {
  const [expandedLayers, setExpandedLayers] = useState(getInitialExpandedLayers);
  const activeLayerCount = useEditorStore((state) => state.activeLayerCount);
  const activeLayerId = useEditorStore((state) => state.activeLayerId);
  const layers = useEditorStore((state) => state.layers);
  const addLayer = useEditorStore((state) => state.addLayer);
  const applyLayerLayout = useEditorStore((state) => state.applyLayerLayout);
  const setActiveLayerId = useEditorStore((state) => state.setActiveLayerId);
  const setActiveLayerTransform = useEditorStore((state) => state.setActiveLayerTransform);
  const toggleLayerLocked = useEditorStore((state) => state.toggleLayerLocked);
  const toggleLayerVisibility = useEditorStore((state) => state.toggleLayerVisibility);
  const visibleLayerRows = layers.filter((layer) => layer.id <= activeLayerCount);
  const canAddLayer = activeLayerCount < 3;

  const toggleExpanded = (layerId: LayerId) => {
    setExpandedLayers((current) => ({
      ...current,
      [layerId]: !current[layerId],
    }));
  };

  const handleAddLayer = () => {
    if (!canAddLayer) return;
    const nextLayerId = (activeLayerCount + 1) as LayerId;
    addLayer();
    setExpandedLayers((current) => ({
      ...current,
      [nextLayerId]: true,
    }));
  };

  const updateLayerTransform = (layerId: LayerId, transform: Partial<LayerTransform>) => {
    setActiveLayerId(layerId);
    setActiveLayerTransform(transform);
  };

  return (
    <ControlGroup title="Layer controls">
      <div className={styles.controls}>
        <SegmentedControl
          label="Layout"
          onChange={(value) => applyLayerLayout(Number(value) as LayerCount)}
          options={LAYOUT_OPTIONS}
          value={String(activeLayerCount) as `${LayerCount}`}
        />
        <Button disabled={!canAddLayer} icon={<Plus />} onClick={handleAddLayer} type="button" variant="secondary">
          New Layer
        </Button>
        <div className={styles.layerList}>
          {visibleLayerRows.map((layer) => {
            const isExpanded = expandedLayers[layer.id];
            const isActive = activeLayerId === layer.id;

            return (
              <section className={styles.layerItem} data-active={isActive} data-hidden={!layer.isVisible} data-locked={layer.isLocked} key={layer.id}>
                <div className={styles.layerHeader} onClick={() => setActiveLayerId(layer.id)} role="presentation">
                  <button
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? "Collapse" : "Expand"} ${layer.name}`}
                    className={styles.expandButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleExpanded(layer.id);
                    }}
                    type="button"
                  >
                    <ChevronDown />
                  </button>
                  <span aria-hidden="true" className={styles.swatch} style={{ background: LAYER_SWATCHES[layer.id] }} />
                  <button className={styles.layerName} onClick={() => setActiveLayerId(layer.id)} type="button">
                    {layer.name}
                  </button>
                  <div className={styles.placeholderControls} aria-label={`${layer.name} placeholder controls`}>
                    {PLACEHOLDER_CONTROLS.map((control) => {
                      const Icon = control.icon;
                      return (
                        <label className={styles.placeholderToggle} key={control.label}>
                          <input aria-label={`${layer.name} ${control.label}`} checked={false} onChange={() => undefined} type="checkbox" />
                          <Icon aria-hidden="true" />
                        </label>
                      );
                    })}
                  </div>
                  <button
                    aria-label={layer.isVisible ? `Hide ${layer.name}` : `Show ${layer.name}`}
                    aria-pressed={!layer.isVisible}
                    className={styles.iconAction}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleLayerVisibility(layer.id);
                    }}
                    title={layer.isVisible ? "Hide layer" : "Show layer"}
                    type="button"
                  >
                    {layer.isVisible ? <Eye /> : <EyeOff />}
                  </button>
                  <button
                    aria-label={layer.isLocked ? `Unlock ${layer.name}` : `Lock ${layer.name}`}
                    aria-pressed={layer.isLocked}
                    className={styles.iconAction}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleLayerLocked(layer.id);
                    }}
                    title={layer.isLocked ? "Unlock layer" : "Lock layer"}
                    type="button"
                  >
                    {layer.isLocked ? <Lock /> : <Unlock />}
                  </button>
                </div>
                {isExpanded ? (
                  <div className={styles.layerBody}>
                    {layer.isLocked ? (
                      <p className={styles.lockedNotice}>
                        <Lock aria-hidden="true" /> Layer locked
                      </p>
                    ) : null}
                    <LayerTransformControls layer={layer} onChange={(transform) => updateLayerTransform(layer.id, transform)} />
                  </div>
                ) : null}
              </section>
            );
          })}
          {visibleLayerRows.length === 0 ? (
            <div className={styles.emptyLayers}>
              <Circle aria-hidden="true" />
              <span>No layers</span>
            </div>
          ) : null}
        </div>
      </div>
    </ControlGroup>
  );
}
