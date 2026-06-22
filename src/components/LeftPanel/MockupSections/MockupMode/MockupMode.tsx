"use client";

import { ControlGroup } from "@/components/Global/ControlGroup/ControlGroup";
import { SegmentedControl } from "@/components/Global/SegmentedControl/SegmentedControl";
import { useEditorStore } from "@/store/editorStore";
import type { MockupMode as MockupModeValue } from "@/types/editor";
import styles from "./MockupMode.module.scss";

export function MockupMode() {
  const mode = useEditorStore((state) => state.mockup.mode);
  const setMockupMode = useEditorStore((state) => state.setMockupMode);

  return (
    <ControlGroup title="Select mode">
      <div className={styles.content}>
        <SegmentedControl<MockupModeValue>
          label="Mockup mode"
          onChange={setMockupMode}
          options={[
            { label: "Screenshot", value: "screenshot" },
            { label: "Browser", value: "browser" },
          ]}
          value={mode}
        />
      </div>
    </ControlGroup>
  );
}
