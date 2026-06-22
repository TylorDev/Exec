"use client";

import { MockupRenderer } from "@/components/Viewport/MockupRenderer/MockupRenderer";
import type { LayerTransform, MockupState } from "@/types/editor";
import styles from "./CssMockupPreview.module.scss";

interface CssMockupPreviewProps {
  className?: string;
  mockup: MockupState;
  transform: LayerTransform;
  variant?: "scene" | "card";
}

export function CssMockupPreview({ className = "", mockup, transform, variant = "scene" }: CssMockupPreviewProps) {
  return (
    <div
      className={`${styles.preview} ${styles[variant]} ${className}`}
      style={{ "--camera-perspective-base": `${transform.perspective * 18}px` } as React.CSSProperties}
    >
      <div
        className={styles.transform}
        style={{
          transform: `translate3d(${transform.positionX}%, ${transform.positionY}%, calc(${transform.positionZ}px * var(--scene-export-scale, 1))) scale(${transform.scale}) rotateX(${transform.rotationX}deg) rotateY(${transform.rotationY}deg) rotateZ(${transform.rotationZ}deg)`,
        }}
      >
        <MockupRenderer mockup={mockup} variant={variant} />
      </div>
    </div>
  );
}
