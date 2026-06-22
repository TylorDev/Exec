"use client";

import { AspectRatio } from "@/components/LeftPanel/FrameSections/AspectRatio/AspectRatio";
import { BackgroundEffects } from "@/components/LeftPanel/FrameSections/BackgroundEffects/BackgroundEffects";
import { BackgroundLibrarySection } from "@/components/LeftPanel/FrameSections/BackgroundLibrarySection/BackgroundLibrarySection";
import { BackgroundMode } from "@/components/LeftPanel/FrameSections/BackgroundMode/BackgroundMode";
import { ShadowOverlay } from "@/components/LeftPanel/FrameSections/ShadowOverlay/ShadowOverlay";
import styles from "./FrameLayout.module.scss";

export function FrameLayout() {
  return (
    <div className={styles.layout}>
      <AspectRatio />
      <BackgroundEffects />
      <ShadowOverlay />
      <BackgroundMode />
      <BackgroundLibrarySection />
    </div>
  );
}
