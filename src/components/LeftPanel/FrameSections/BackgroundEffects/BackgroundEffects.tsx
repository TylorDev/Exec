"use client";

import { ControlGroup } from "@/components/Global/ControlGroup/ControlGroup";
import { SliderControl } from "@/components/Global/SliderControl/SliderControl";
import { useEditorStore } from "@/store/editorStore";
import styles from "./BackgroundEffects.module.scss";

export function BackgroundEffects() {
  const blur = useEditorStore((state) => state.frame.blur);
  const noise = useEditorStore((state) => state.frame.noise);
  const setFrame = useEditorStore((state) => state.setFrame);

  return (
    <ControlGroup title="Background effects">
      <div className={styles.content}>
        <SliderControl label="Blur" max={40} min={0} onChange={(nextBlur) => setFrame({ blur: nextBlur })} suffix="px" value={blur} />
        <SliderControl label="Noise" max={40} min={0} onChange={(nextNoise) => setFrame({ noise: nextNoise })} suffix="%" value={noise} />
      </div>
    </ControlGroup>
  );
}
