"use client";

import { ControlGroup } from "@/components/Global/ControlGroup/ControlGroup";
import { Field } from "@/components/Global/Field/Field";
import { SelectControl } from "@/components/Global/SelectControl/SelectControl";
import { RESOLUTIONS } from "@/data/resolutions";
import { useEditorStore } from "@/store/editorStore";
import type { AspectRatioId } from "@/types/editor";
import styles from "./AspectRatio.module.scss";

export function AspectRatio() {
  const frame = useEditorStore((state) => state.frame);
  const setFrame = useEditorStore((state) => state.setFrame);

  return (
    <ControlGroup title="Aspect ratio">
      <SelectControl<AspectRatioId>
        label="Resolution"
        onChange={(aspectRatio) => setFrame({ aspectRatio })}
        options={RESOLUTIONS.map((resolution) => ({ label: resolution.label, value: resolution.id }))}
        value={frame.aspectRatio}
      />
      {frame.aspectRatio === "custom" ? (
        <div className={styles.customGrid}>
          <Field label="Width">
            <input onChange={(event) => setFrame({ customWidth: Number(event.target.value) })} type="number" value={frame.customWidth} />
          </Field>
          <Field label="Height">
            <input onChange={(event) => setFrame({ customHeight: Number(event.target.value) })} type="number" value={frame.customHeight} />
          </Field>
        </div>
      ) : null}
    </ControlGroup>
  );
}
