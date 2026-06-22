"use client";

import { ControlGroup } from "@/components/Global/ControlGroup/ControlGroup";
import { MediaDropArea } from "@/components/LeftPanel/MockupSections/MediaDropArea/MediaDropArea";
import styles from "./MediaSection.module.scss";

export function MediaSection() {
  return (
    <ControlGroup title="Media">
      <div className={styles.content}>
        <MediaDropArea />
      </div>
    </ControlGroup>
  );
}
