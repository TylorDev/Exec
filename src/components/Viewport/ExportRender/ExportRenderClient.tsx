"use client";

import { useEffect, useRef, useState } from "react";
import { CssMockupPreview } from "@/components/Viewport/CssMockupPreview/CssMockupPreview";
import { useEditorStore } from "@/store/editorStore";
import type { ServerExportPayload } from "@/types/export";
import { getCanonicalExportScale } from "@/utils/exportScale";
import { getBackgroundCss } from "@/utils/scene";
import styles from "@/components/Viewport/ScenePreview/ScenePreview.module.scss";

declare global {
  interface Window {
    renderExecExport?: (payload: ServerExportPayload) => Promise<void>;
  }
}

const waitForLayoutFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

const waitForImages = async (root: HTMLElement) => {
  const images = Array.from(root.querySelectorAll("img"));

  await Promise.all(
    images.map(async (image) => {
      if (typeof image.decode === "function") {
        await image.decode().catch(() => undefined);
      }
    }),
  );
};

const waitForReady = async (root: HTMLElement) => {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await waitForLayoutFrame();
  await waitForImages(root);
  await waitForLayoutFrame();
  await waitForLayoutFrame();
};

export function ExportRenderClient() {
  const [payload, setPayload] = useState<ServerExportPayload | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const pending = useRef<{ reject: (error: unknown) => void; resolve: () => void } | null>(null);
  const frame = useEditorStore((state) => state.frame);
  const activeLayerCount = useEditorStore((state) => state.activeLayerCount);
  const layers = useEditorStore((state) => state.layers);
  const visibleLayers = layers.filter((layer) => layer.id <= activeLayerCount && layer.isVisible);

  useEffect(() => {
    window.renderExecExport = (nextPayload) =>
      new Promise<void>((resolve, reject) => {
        pending.current = { reject, resolve };
        useEditorStore.setState({
          activeLayerCount: nextPayload.snapshot.activeLayerCount,
          activeLayerId: nextPayload.snapshot.activeLayerId,
          exportSettings: nextPayload.snapshot.exportSettings,
          frame: nextPayload.snapshot.frame,
          layers: nextPayload.snapshot.layers,
          ui: nextPayload.snapshot.ui,
        });
        setPayload(nextPayload);
      });

    return () => {
      delete window.renderExecExport;
    };
  }, []);

  useEffect(() => {
    const root = sceneRef.current;
    const waiter = pending.current;
    if (!payload || !root || !waiter) return;

    pending.current = null;
    waitForReady(root).then(waiter.resolve).catch(waiter.reject);
  }, [payload, frame, layers, activeLayerCount]);

  if (!payload) {
    return null;
  }

  const exportScale = getCanonicalExportScale(payload.width, payload.height);
  const background = getBackgroundCss(frame);

  return (
    <div
      className={styles.scene}
      data-export-scene="true"
      ref={sceneRef}
      style={
        {
          "--scene-export-scale": exportScale,
          "--scene-mockup-image-max-height": "none",
          "--scene-mockup-width": "72%",
          aspectRatio: `${payload.width} / ${payload.height}`,
          background,
          boxShadow: "none",
          height: `${payload.height}px`,
          maxHeight: "none",
          maxWidth: "none",
          minHeight: `${payload.height}px`,
          minWidth: "0",
          width: `${payload.width}px`,
        } as React.CSSProperties
      }
    >
      <div className={styles.backgroundEffects} style={{ backdropFilter: `blur(${frame.blur * exportScale}px)` }} />
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
  );
}
