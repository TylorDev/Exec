"use client";

import { Monitor } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { createLiquidGlassMaps, type LiquidGlassMaps } from "@/utils/liquidGlass";
import styles from "./MockupRenderer.module.scss";

const styleClass = {
  bevel: styles.bevel,
  "liquid-glass": styles.liquidGlass,
  "true-liquid-glass-heavy": styles.trueLiquidGlassHeavy,
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

const hexToRgb = (hexColor: string, fallback = { red: 137, green: 247, blue: 220 }) => {
  const normalized = hexColor.replace("#", "").trim();
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) return fallback;

  return {
    red: Number.parseInt(value.slice(0, 2), 16),
    green: Number.parseInt(value.slice(2, 4), 16),
    blue: Number.parseInt(value.slice(4, 6), 16),
  };
};

export function MockupRenderer({ variant = "scene" }: MockupRendererProps) {
  const mockup = useEditorStore((state) => state.mockup);
  const frameRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const filterId = useMemo(() => `true-liquid-glass-${reactId.replace(/:/g, "")}`, [reactId]);
  const [maps, setMaps] = useState<LiquidGlassMaps | null>(null);
  const isTrueLiquidGlass = mockup.style === "true-liquid-glass-heavy";

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame || !isTrueLiquidGlass || !mockup.imageUrl || typeof ResizeObserver === "undefined") {
      setMaps(null);
      return;
    }

    let animationFrame = 0;
    const updateMaps = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const rect = frame.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;

        setMaps(
          createLiquidGlassMaps({
            width: rect.width,
            height: rect.height,
            borderRadius: mockup.borderRadius,
            bezelWidth: Math.max(1, mockup.borderWidth),
            glassRefraction: mockup.glassRefraction,
            glassThickness: mockup.glassThickness,
            glassSpecular: mockup.glassSpecular,
            glassColor: mockup.glassColor,
            glassHighlightsEnabled: mockup.glassHighlightsEnabled,
            glassLightColor: mockup.glassLightColor,
          }),
        );
      });
    };

    const resizeObserver = new ResizeObserver(updateMaps);
    resizeObserver.observe(frame);
    updateMaps();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [
    filterId,
    isTrueLiquidGlass,
    mockup.borderRadius,
    mockup.borderWidth,
    mockup.glassRefraction,
    mockup.glassSpecular,
    mockup.glassThickness,
    mockup.glassColor,
    mockup.glassHighlightsEnabled,
    mockup.glassLightColor,
    mockup.imageUrl,
  ]);

  if (mockup.hideImage) return null;

  const glassColor = hexToRgb(mockup.glassColor);
  const glassLightColor = hexToRgb(mockup.glassLightColor, { red: 255, green: 255, blue: 255 });
  const frameStyle = {
    "--glass-blur-base": `${mockup.glassBlur}px`,
    "--glass-color": mockup.glassColor,
    "--glass-color-rgb": `${glassColor.red}, ${glassColor.green}, ${glassColor.blue}`,
    "--glass-highlight-opacity": mockup.glassHighlightsEnabled ? 1 : 0,
    "--glass-light-color": mockup.glassLightColor,
    "--glass-light-rgb": `${glassLightColor.red}, ${glassLightColor.green}, ${glassLightColor.blue}`,
    "--liquid-glass-filter": maps ? `url("#${filterId}")` : "none",
    "--mockup-border-radius-base": `${mockup.borderRadius}px`,
    "--mockup-border-width-base": `${mockup.borderWidth}px`,
    "--mockup-shadow-blur-base": `${mockup.shadowBlur}px`,
    "--mockup-shadow-opacity": `${mockup.shadow === "none" ? 0 : mockup.shadowOpacity / 100}`,
    "--mockup-shadow-spread-base": `${mockup.shadowSpread}px`,
    "--mockup-shadow-x-base": `${mockup.shadowX}px`,
    "--mockup-shadow-y-base": `${mockup.shadowY}px`,
  } as React.CSSProperties;
  const imageStyle = { borderRadius: "var(--mockup-border-radius)" };
  const liquidGlassData = isTrueLiquidGlass
    ? {
        "data-glass-color": mockup.glassColor,
        "data-glass-highlights-enabled": String(mockup.glassHighlightsEnabled),
        "data-glass-light-color": mockup.glassLightColor,
        "data-glass-refraction": mockup.glassRefraction,
        "data-glass-specular": mockup.glassSpecular,
        "data-glass-thickness": mockup.glassThickness,
        "data-liquid-glass-map": "true",
      }
    : {};

  if (!mockup.imageUrl) {
    return (
      <div className={`${styles.empty} ${styles[variant]}`}>
        <Monitor />
        <span>Upload a screenshot</span>
      </div>
    );
  }

  const image = <img alt={mockup.imageName ?? "Uploaded mockup"} data-export-image="mockup" src={mockup.imageUrl} style={imageStyle} />;

  const frameClasses = `${styles.mockup} ${styleClass[mockup.style]} ${styles[variant]}`;
  const filterSvg = isTrueLiquidGlass && maps ? (
    <svg aria-hidden="true" className={styles.filterSvg} focusable="false">
      <filter
        colorInterpolationFilters="sRGB"
        filterUnits="objectBoundingBox"
        height="1"
        id={filterId}
        primitiveUnits="objectBoundingBox"
        width="1"
        x="0"
        y="0"
      >
        <feImage
          height="1"
          href={maps.displacementMapUrl}
          preserveAspectRatio="none"
          result="displacement_map"
          width="1"
          x="0"
          y="0"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="displacement_map"
          result="refracted"
          scale={maps.scale}
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feImage
          height="1"
          href={maps.specularMapUrl}
          preserveAspectRatio="none"
          result="specular_map"
          width="1"
          x="0"
          y="0"
        />
        <feBlend in="refracted" in2="specular_map" mode="screen" />
      </filter>
    </svg>
  ) : null;

  if (mockup.mode === "browser") {
    return (
      <div className={`${frameClasses} ${styles.browser}`} ref={frameRef} style={frameStyle} {...liquidGlassData}>
        {filterSvg}
        <div className={styles.blurLayer} data-liquid-glass-blur-layer={isTrueLiquidGlass ? "true" : undefined} />
        <div className={styles.stackLayer} />
        <div className={styles.content}>
          <div className={styles.browserBar} data-browser-bar="true">
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
    <div className={`${frameClasses} ${styles.screenshot}`} ref={frameRef} style={frameStyle} {...liquidGlassData}>
      {filterSvg}
      <div className={styles.blurLayer} data-liquid-glass-blur-layer={isTrueLiquidGlass ? "true" : undefined} />
      <div className={styles.stackLayer} />
      <div className={styles.content}>{image}</div>
    </div>
  );
}
