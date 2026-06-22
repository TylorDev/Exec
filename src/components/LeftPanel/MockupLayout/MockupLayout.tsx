"use client";

import { FrameStyles } from "@/components/LeftPanel/MockupSections/FrameStyles/FrameStyles";
import { MediaSection } from "@/components/LeftPanel/MockupSections/MediaSection/MediaSection";
import { MockupMode } from "@/components/LeftPanel/MockupSections/MockupMode/MockupMode";
import styles from "./MockupLayout.module.scss";

export function MockupLayout() {
  return (
    <div className={styles.layout}>
      <MockupMode />
      <MediaSection />
      <FrameStyles />
    </div>
  );
}
