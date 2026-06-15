"use client";

import { useRef } from "react";
import { Button } from "@/components/Button/Button";
import { LeftPanel } from "@/components/LeftPanel/LeftPanel";
import { RightPanel } from "@/components/RightPanel/RightPanel";
import { ScenePreview } from "@/components/ScenePreview/ScenePreview";
import { useEditorStore } from "@/store/editorStore";
import styles from "./MainLayout.module.scss";

export function MainLayout() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const hideUi = useEditorStore((state) => state.ui.hideUi);
  const setHideUi = useEditorStore((state) => state.setHideUi);

  return (
    <div className={`${styles.shell} ${hideUi ? styles.clean : ""}`}>
      {!hideUi ? <LeftPanel /> : null}
      <ScenePreview sceneRef={sceneRef} />
      {!hideUi ? <RightPanel sceneRef={sceneRef} /> : null}
      {hideUi ? (
        <div className={styles.restore}>
          <Button onClick={() => setHideUi(false)} variant="primary">
            Show UI
          </Button>
        </div>
      ) : null}
    </div>
  );
}
