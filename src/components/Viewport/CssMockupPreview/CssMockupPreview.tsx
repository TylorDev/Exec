"use client";

import { MockupRenderer } from "@/components/Viewport/MockupRenderer/MockupRenderer";
import type { CameraState } from "@/types/editor";
import styles from "./CssMockupPreview.module.scss";

interface CssMockupPreviewProps {
  camera: CameraState;
  className?: string;
  variant?: "scene" | "card";
}

export function CssMockupPreview({ camera, className = "", variant = "scene" }: CssMockupPreviewProps) {
  return (
    <div
      className={`${styles.preview} ${styles[variant]} ${className}`}
      style={{ "--camera-perspective-base": `${camera.perspective * 18}px` } as React.CSSProperties}
    >
      <div
        className={styles.transform}
        style={{
          transform: `translate3d(${camera.x}%, ${camera.y}%, 0) scale(${camera.zoom}) rotateX(${camera.rotationX}deg) rotateY(${camera.rotationY}deg) rotateZ(${camera.rotationZ}deg)`,
        }}
      >
        <MockupRenderer variant={variant} />
      </div>
    </div>
  );
}
