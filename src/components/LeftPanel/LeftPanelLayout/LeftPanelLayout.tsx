"use client";

import { ScrollPanel } from "@/components/Global/ScrollPanel/ScrollPanel";
import { LeftPanelContent } from "@/components/LeftPanel/LeftPanelContent/LeftPanelContent";
import { PanelTabs } from "@/components/LeftPanel/LeftPanelLayout/PanelTabs/PanelTabs";
import styles from "./LeftPanelLayout.module.scss";

export function LeftPanelLayout() {
  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span>Exec</span>
          <strong>Scene editor</strong>
        </div>
      </div>
      <PanelTabs />
      <ScrollPanel className={styles.scroll}>
        <LeftPanelContent />
      </ScrollPanel>
    </aside>
  );
}
