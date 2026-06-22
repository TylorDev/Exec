"use client";

import { ControlGroup } from "@/components/Global/ControlGroup/ControlGroup";
import { BackgroundLibrary } from "@/components/LeftPanel/FrameSections/BackgroundLibrary/BackgroundLibrary";
import { BACKGROUNDS } from "@/data/backgrounds";
import styles from "./BackgroundLibrarySection.module.scss";

export function BackgroundLibrarySection() {
  return (
    <ControlGroup title="Background library">
      <BackgroundLibrary />
      <span className={styles.hint}>{BACKGROUNDS.length} placeholder presets ready.</span>
    </ControlGroup>
  );
}
