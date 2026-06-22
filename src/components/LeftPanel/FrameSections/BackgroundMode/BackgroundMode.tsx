"use client";

import { ControlGroup } from "@/components/Global/ControlGroup/ControlGroup";
import { Field } from "@/components/Global/Field/Field";
import { SegmentedControl } from "@/components/Global/SegmentedControl/SegmentedControl";
import { BackgroundImagePicker } from "@/components/LeftPanel/FrameSections/BackgroundImagePicker/BackgroundImagePicker";
import { MediaDropArea } from "@/components/LeftPanel/MockupSections/MediaDropArea/MediaDropArea";
import { useEditorStore } from "@/store/editorStore";
import type { BackgroundMode as BackgroundModeValue } from "@/types/editor";
import styles from "./BackgroundMode.module.scss";

export function BackgroundMode() {
  const frame = useEditorStore((state) => state.frame);
  const setFrame = useEditorStore((state) => state.setFrame);

  return (
    <ControlGroup title="Background mode">
      <SegmentedControl<BackgroundModeValue>
        label="Mode"
        onChange={(backgroundMode) => setFrame({ backgroundMode })}
        options={[
          { label: "Transparent", value: "transparent" },
          { label: "Solid", value: "solid" },
          { label: "Image", value: "image" },
        ]}
        value={frame.backgroundMode}
      />
      {frame.backgroundMode === "solid" ? (
        <div className={styles.colorInput}>
          <Field label="Color">
            <input onChange={(event) => setFrame({ solidColor: event.target.value })} type="color" value={frame.solidColor} />
          </Field>
        </div>
      ) : null}
      {frame.backgroundMode === "image" ? (
        <>
          <BackgroundImagePicker />
          <MediaDropArea kind="background" />
        </>
      ) : null}
    </ControlGroup>
  );
}
