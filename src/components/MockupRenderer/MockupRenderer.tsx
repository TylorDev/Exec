"use client";

import { Monitor } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import styles from "./MockupRenderer.module.scss";

const shadowClass = {
  none: "",
  soft: styles.soft,
  medium: styles.medium,
  strong: styles.strong,
};

interface MockupRendererProps {
  variant?: "scene" | "card";
}

export function MockupRenderer({ variant = "scene" }: MockupRendererProps) {
  const mockup = useEditorStore((state) => state.mockup);

  if (mockup.hideImage) return null;

  const radiusStyle = { borderRadius: `${mockup.borderRadius}px` };

  if (!mockup.imageUrl) {
    return (
      <div className={`${styles.empty} ${styles[variant]}`}>
        <Monitor />
        <span>Upload a screenshot</span>
      </div>
    );
  }

  const image = <img alt={mockup.imageName ?? "Uploaded mockup"} src={mockup.imageUrl} style={radiusStyle} />;

  if (mockup.mode === "browser") {
    return (
      <div className={`${styles.mockup} ${styles.browser} ${styles.thickBlurFrame} ${shadowClass[mockup.shadow]} ${styles[variant]}`} style={radiusStyle}>
        <div className={styles.blurLayer} />
        <div className={styles.content}>
          <div className={styles.browserBar}>
            <i />
            <i />
            <i />
            <span>exec.local</span>
          </div>
          {image}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mockup} ${styles.screenshot} ${styles.thickBlurFrame} ${shadowClass[mockup.shadow]} ${styles[variant]}`} style={radiusStyle}>
      <div className={styles.blurLayer} />
      <div className={styles.content}>{image}</div>
    </div>
  );
}
