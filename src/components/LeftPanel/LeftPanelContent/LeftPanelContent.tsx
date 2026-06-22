"use client";

import { FrameLayout } from "@/components/LeftPanel/FrameLayout/FrameLayout";
import { MockupLayout } from "@/components/LeftPanel/MockupLayout/MockupLayout";
import { useEditorStore } from "@/store/editorStore";
import styles from "./LeftPanelContent.module.scss";

export function LeftPanelContent() {
  const activeTab = useEditorStore((state) => state.ui.activeTab);

  if (activeTab === "mockup") {
    return (
      <div className={styles.content}>
        <MockupLayout />
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <FrameLayout />
    </div>
  );
}
