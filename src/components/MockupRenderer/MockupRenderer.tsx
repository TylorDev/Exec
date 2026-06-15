"use client";

import { Monitor } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import styles from "./MockupRenderer.module.scss";

const styleClass = {
  bevel: styles.bevel,
  "liquid-glass": styles.liquidGlass,
  minimal: styles.minimal,
  outline: styles.outline,
  "soft-glow": styles.softGlow,
  "solid-border": styles.solidBorder,
  stack: styles.stack,
  "thick-blur-frame": styles.thickBlurFrame,
};

interface MockupRendererProps {
  variant?: "scene" | "card";
}

export function MockupRenderer({ variant = "scene" }: MockupRendererProps) {
  const mockup = useEditorStore((state) => state.mockup);

  if (mockup.hideImage) return null;

  const frameStyle = {
    "--mockup-border-width": `${mockup.borderWidth}px`,
    "--mockup-shadow-blur": `${mockup.shadowBlur}px`,
    "--mockup-shadow-opacity": `${mockup.shadow === "none" ? 0 : mockup.shadowOpacity / 100}`,
    "--mockup-shadow-spread": `${mockup.shadowSpread}px`,
    "--mockup-shadow-x": `${mockup.shadowX}px`,
    "--mockup-shadow-y": `${mockup.shadowY}px`,
    borderRadius: `${mockup.borderRadius}px`,
  } as React.CSSProperties;
  const imageStyle = { borderRadius: `${mockup.borderRadius}px` };

  if (!mockup.imageUrl) {
    return (
      <div className={`${styles.empty} ${styles[variant]}`}>
        <Monitor />
        <span>Upload a screenshot</span>
      </div>
    );
  }

  const image = <img alt={mockup.imageName ?? "Uploaded mockup"} src={mockup.imageUrl} style={imageStyle} />;

  const frameClasses = `${styles.mockup} ${styleClass[mockup.style]} ${styles[variant]}`;

  if (mockup.mode === "browser") {
    return (
      <div className={`${frameClasses} ${styles.browser}`} style={frameStyle}>
        <div className={styles.blurLayer} />
        <div className={styles.stackLayer} />
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
    <div className={`${frameClasses} ${styles.screenshot}`} style={frameStyle}>
      <div className={styles.blurLayer} />
      <div className={styles.stackLayer} />
      <div className={styles.content}>{image}</div>
    </div>
  );
}
