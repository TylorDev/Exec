"use client";

import { Eye, EyeOff, Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconButton } from "@/components/Global/IconButton/IconButton";
import { CssMockupPreview } from "@/components/Viewport/CssMockupPreview/CssMockupPreview";
import { useEditorStore } from "@/store/editorStore";
import { getBackgroundCss, getSceneResolution } from "@/utils/scene";
import styles from "./ScenePreview.module.scss";

interface ScenePreviewProps {
  sceneRef: React.RefObject<HTMLDivElement | null>;
}

const VIEWPORT_ZOOM_STEP = 0.1;
const MIN_VIEWPORT_ZOOM = 0.5;
const MAX_VIEWPORT_ZOOM = 2;

export function ScenePreview({ sceneRef }: ScenePreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ height: 0, width: 0 });
  const [viewportZoom, setViewportZoom] = useState(1);
  const [isFitWidth, setIsFitWidth] = useState(false);
  const frame = useEditorStore((state) => state.frame);
  const activeLayerCount = useEditorStore((state) => state.activeLayerCount);
  const layers = useEditorStore((state) => state.layers);
  const ui = useEditorStore((state) => state.ui);
  const pastCount = useEditorStore((state) => state.past.length);
  const futureCount = useEditorStore((state) => state.future.length);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const setHideUi = useEditorStore((state) => state.setHideUi);
  const resolution = getSceneResolution(frame);
  const background = getBackgroundCss(frame);
  const visibleLayers = layers.filter((layer) => layer.id <= activeLayerCount && layer.isVisible);
  const ratio = resolution.width / resolution.height;
  const baseSize = useMemo(() => {
    const fallbackWidth = ratio >= 1 ? 980 : 560;
    const availableWidth = Math.max(0, stageSize.width);
    const availableHeight = Math.max(0, stageSize.height);
    const widthLimit = isFitWidth ? availableWidth : Math.min(availableWidth, ratio >= 1 ? 980 : availableHeight * 0.72, fallbackWidth);
    const heightLimit = availableHeight > 0 ? availableHeight : widthLimit / ratio;
    const baseWidth = isFitWidth ? Math.max(260, widthLimit || fallbackWidth) : Math.max(260, Math.min(widthLimit || fallbackWidth, heightLimit * ratio));
    const baseHeight = baseWidth / ratio;

    return {
      height: baseHeight,
      width: baseWidth,
    };
  }, [isFitWidth, ratio, stageSize.height, stageSize.width]);
  const viewportSize = useMemo(
    () => ({
      height: baseSize.height * viewportZoom,
      width: baseSize.width * viewportZoom,
    }),
    [baseSize.height, baseSize.width, viewportZoom],
  );
  const updateViewportZoom = (direction: -1 | 1) => {
    setViewportZoom((currentZoom) => {
      const nextZoom = currentZoom + direction * VIEWPORT_ZOOM_STEP;
      return Number(Math.min(MAX_VIEWPORT_ZOOM, Math.max(MIN_VIEWPORT_ZOOM, nextZoom)).toFixed(2));
    });
  };
  const toggleFitWidth = () => {
    setIsFitWidth((current) => {
      const next = !current;
      if (next) setViewportZoom(1);
      return next;
    });
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateStageSize = () => {
      const rect = stage.getBoundingClientRect();
      const styles = window.getComputedStyle(stage);
      const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const verticalPadding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

      setStageSize({
        height: Math.max(0, rect.height - verticalPadding),
        width: Math.max(0, rect.width - horizontalPadding),
      });
    };
    const observer = new ResizeObserver(updateStageSize);

    updateStageSize();
    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles.preview}>
      <div className={styles.toolbar}>
        <IconButton disabled={pastCount === 0} icon={<Undo2 />} label="Undo" onClick={undo} />
        <IconButton disabled={futureCount === 0} icon={<Redo2 />} label="Redo" onClick={redo} />
        <IconButton disabled={viewportZoom <= MIN_VIEWPORT_ZOOM} icon={<ZoomOut />} label="Zoom out preview" onClick={() => updateViewportZoom(-1)} />
        <IconButton disabled={viewportZoom >= MAX_VIEWPORT_ZOOM} icon={<ZoomIn />} label="Zoom in preview" onClick={() => updateViewportZoom(1)} />
        <IconButton
          aria-pressed={isFitWidth}
          icon={<Maximize2 />}
          label={isFitWidth ? "Use default preview width" : "Fit scene to width"}
          onClick={toggleFitWidth}
        />
        <IconButton icon={ui.hideUi ? <Eye /> : <EyeOff />} label={ui.hideUi ? "Show UI" : "Hide UI"} onClick={() => setHideUi(!ui.hideUi)} />
      </div>
      <div className={styles.stage} ref={stageRef}>
        <div className={styles.sceneViewport} style={{ height: `${viewportSize.height}px`, width: `${viewportSize.width}px` }}>
          <div
            className={styles.scene}
            ref={sceneRef}
            style={{
              "--scene-mockup-image-max-height": "none",
              "--scene-mockup-width": "min(72%, 960px)",
              aspectRatio: `${resolution.width} / ${resolution.height}`,
              background,
              height: `${baseSize.height}px`,
              transform: `scale(${viewportZoom})`,
              width: `${baseSize.width}px`,
            } as React.CSSProperties}
          >
            <div className={styles.backgroundEffects} style={{ backdropFilter: `blur(${frame.blur}px)` }} />
            {frame.noise > 0 ? <div className={styles.noise} style={{ opacity: frame.noise / 100 }} /> : null}
            {frame.overlayUrl ? <img alt="" className={styles.overlay} data-export-image="overlay" src={frame.overlayUrl} style={{ opacity: frame.overlayOpacity / 100 }} /> : null}
            <div className={styles.camera}>
              {visibleLayers.map((layer) =>
                layer.mockup.hideImage ? null : (
                  <div className={styles.layer} key={layer.id} style={{ zIndex: 10 + layer.id }}>
                    <CssMockupPreview mockup={layer.mockup} transform={layer.transform} variant="scene" />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
