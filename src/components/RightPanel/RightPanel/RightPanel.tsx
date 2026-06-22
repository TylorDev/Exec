"use client";

import { ScrollPanel } from "@/components/Global/ScrollPanel/ScrollPanel";
import { CameraControls } from "@/components/RightPanel/CameraControls/CameraControls";
import { Export } from "@/components/RightPanel/Export/Export";
import { Presets } from "@/components/RightPanel/Presets/Presets";
import styles from "./RightPanel.module.scss";

interface RightPanelProps {
  sceneRef: React.RefObject<HTMLDivElement | null>;
}

export function RightPanel({ sceneRef }: RightPanelProps) {
  return (
    <aside className={styles.panel}>
      <ScrollPanel className={styles.scroll}>
        <Export sceneRef={sceneRef} />
        <CameraControls />
        <Presets />
      </ScrollPanel>
    </aside>
  );
}
