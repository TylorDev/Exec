"use client";

import { Eye, EyeOff, Redo2, Undo2 } from "lucide-react";
import { IconButton } from "@/components/IconButton/IconButton";
import { ThreeMockupPreview } from "@/components/ThreeMockupPreview/ThreeMockupPreview";
import { useEditorStore } from "@/store/editorStore";
import { getBackgroundCss, getSceneResolution } from "@/utils/scene";
import styles from "./ScenePreview.module.scss";

interface ScenePreviewProps {
  sceneRef: React.RefObject<HTMLDivElement | null>;
}

export function ScenePreview({ sceneRef }: ScenePreviewProps) {
  const frame = useEditorStore((state) => state.frame);
  const camera = useEditorStore((state) => state.camera);
  const mockup = useEditorStore((state) => state.mockup);
  const ui = useEditorStore((state) => state.ui);
  const pastCount = useEditorStore((state) => state.past.length);
  const futureCount = useEditorStore((state) => state.future.length);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const setHideUi = useEditorStore((state) => state.setHideUi);
  const resolution = getSceneResolution(frame);
  const background = getBackgroundCss(frame);
  const ratio = resolution.width / resolution.height;

  return (
    <main className={styles.preview}>
      <div className={styles.toolbar}>
        <IconButton disabled={pastCount === 0} icon={<Undo2 />} label="Undo" onClick={undo} />
        <IconButton disabled={futureCount === 0} icon={<Redo2 />} label="Redo" onClick={redo} />
        <IconButton icon={ui.hideUi ? <Eye /> : <EyeOff />} label={ui.hideUi ? "Show UI" : "Hide UI"} onClick={() => setHideUi(!ui.hideUi)} />
      </div>
      <div className={styles.stage}>
        <div
          className={styles.scene}
          ref={sceneRef}
          style={{
            aspectRatio: `${resolution.width} / ${resolution.height}`,
            background,
            maxWidth: ratio >= 1 ? "min(100%, 980px)" : "min(72vh, 560px)",
          }}
        >
          <div className={styles.backgroundEffects} style={{ backdropFilter: `blur(${frame.blur}px)` }} />
          {frame.noise > 0 ? <div className={styles.noise} style={{ opacity: frame.noise / 100 }} /> : null}
          {frame.overlayUrl ? <img alt="" className={styles.overlay} src={frame.overlayUrl} style={{ opacity: frame.overlayOpacity / 100 }} /> : null}
          <div
            className={styles.camera}
          >
            {mockup.hideImage ? null : (
              <ThreeMockupPreview
                borderRadius={mockup.borderRadius}
                camera={camera}
                imageName={mockup.imageName}
                imageUrl={mockup.imageUrl}
                mode={mockup.mode}
                shadow={mockup.shadow}
                variant="scene"
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
