"use client";

import { ControlGroup } from "@/components/Global/ControlGroup/ControlGroup";
import { SliderControl } from "@/components/Global/SliderControl/SliderControl";
import { useEditorStore } from "@/store/editorStore";
import styles from "./CameraControls.module.scss";

export function CameraControls() {
  const camera = useEditorStore((state) => state.camera);
  const setCamera = useEditorStore((state) => state.setCamera);

  return (
    <ControlGroup title="Camera controls">
      <div className={styles.controls}>
        <SliderControl label="Scene zoom" max={1.8} min={0.45} onChange={(zoom) => setCamera({ zoom })} step={0.01} value={Number(camera.zoom.toFixed(2))} />
        <SliderControl label="Move X" max={40} min={-40} onChange={(x) => setCamera({ x })} suffix="%" value={camera.x} />
        <SliderControl label="Move Y" max={40} min={-40} onChange={(y) => setCamera({ y })} suffix="%" value={camera.y} />
        <SliderControl label="Tilt" max={55} min={-55} onChange={(rotationX) => setCamera({ rotationX })} suffix="deg" value={camera.rotationX} />
        <SliderControl label="Yaw" max={55} min={-55} onChange={(rotationY) => setCamera({ rotationY })} suffix="deg" value={camera.rotationY} />
        <SliderControl label="Roll" max={30} min={-30} onChange={(rotationZ) => setCamera({ rotationZ })} suffix="deg" value={camera.rotationZ} />
        <SliderControl label="Perspective" max={70} min={28} onChange={(perspective) => setCamera({ perspective })} suffix="deg" value={camera.perspective} />
      </div>
    </ControlGroup>
  );
}
