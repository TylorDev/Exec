"use client";

import { Trash2 } from "lucide-react";
import { BACKGROUNDS } from "@/data/backgrounds";
import { RESOLUTIONS } from "@/data/resolutions";
import { Button } from "@/components/Button/Button";
import { BackgroundImagePicker } from "@/components/BackgroundImagePicker/BackgroundImagePicker";
import { BackgroundLibrary } from "@/components/BackgroundLibrary/BackgroundLibrary";
import { ControlGroup } from "@/components/ControlGroup/ControlGroup";
import { Field } from "@/components/Field/Field";
import { LightJoystick } from "@/components/LightJoystick/LightJoystick";
import { MediaDropArea } from "@/components/MediaDropArea/MediaDropArea";
import { PanelTabs } from "@/components/PanelTabs/PanelTabs";
import { ScrollPanel } from "@/components/ScrollPanel/ScrollPanel";
import { SegmentedControl } from "@/components/SegmentedControl/SegmentedControl";
import { SelectControl } from "@/components/SelectControl/SelectControl";
import { SliderControl } from "@/components/SliderControl/SliderControl";
import { StylePicker } from "@/components/StylePicker/StylePicker";
import { ToggleControl } from "@/components/ToggleControl/ToggleControl";
import { useEditorStore } from "@/store/editorStore";
import type { AspectRatioId, BackgroundMode, MockupMode, ShadowLevel } from "@/types/editor";
import styles from "./LeftPanel.module.scss";

export function LeftPanel() {
  const { mockup, frame, ui } = useEditorStore();
  const setMockupMode = useEditorStore((state) => state.setMockupMode);
  const setMockupStyle = useEditorStore((state) => state.setMockupStyle);
  const setBorderRadius = useEditorStore((state) => state.setBorderRadius);
  const setBorderWidth = useEditorStore((state) => state.setBorderWidth);
  const setShadow = useEditorStore((state) => state.setShadow);
  const setShadowBlur = useEditorStore((state) => state.setShadowBlur);
  const setShadowDirection = useEditorStore((state) => state.setShadowDirection);
  const setShadowOpacity = useEditorStore((state) => state.setShadowOpacity);
  const setShadowSpread = useEditorStore((state) => state.setShadowSpread);
  const setGlassBlur = useEditorStore((state) => state.setGlassBlur);
  const setGlassColor = useEditorStore((state) => state.setGlassColor);
  const setGlassRefraction = useEditorStore((state) => state.setGlassRefraction);
  const setGlassSpecular = useEditorStore((state) => state.setGlassSpecular);
  const setGlassThickness = useEditorStore((state) => state.setGlassThickness);
  const setHideImage = useEditorStore((state) => state.setHideImage);
  const setFrame = useEditorStore((state) => state.setFrame);
  const setOverlay = useEditorStore((state) => state.setOverlay);

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span>Exec</span>
          <strong>Scene editor</strong>
        </div>
      </div>
      <PanelTabs />
      {ui.activeTab === "mockup" ? (
        <ScrollPanel className={styles.scroll}>
          <ControlGroup title="Select mode">
            <SegmentedControl<MockupMode>
              label="Mockup mode"
              onChange={setMockupMode}
              options={[
                { label: "Screenshot", value: "screenshot" },
                { label: "Browser", value: "browser" },
              ]}
              value={mockup.mode}
            />
          </ControlGroup>
          <ControlGroup title="Media">
            <MediaDropArea />
          </ControlGroup>
          <ControlGroup title="Style">
            <StylePicker onChange={setMockupStyle} value={mockup.style} />
            <SliderControl label="Border radius" max={64} min={0} onChange={setBorderRadius} suffix="px" value={mockup.borderRadius} />
            <SliderControl label="Border thickness" max={40} min={0} onChange={setBorderWidth} suffix="px" value={mockup.borderWidth} />
            {mockup.style === "true-liquid-glass-heavy" ? (
              <>
                <SliderControl label="Glass refraction" max={160} min={0} onChange={setGlassRefraction} suffix="%" value={mockup.glassRefraction} />
                <SliderControl label="Glass thickness" max={80} min={8} onChange={setGlassThickness} suffix="px" value={mockup.glassThickness} />
                <SliderControl label="Specular highlight" max={100} min={0} onChange={setGlassSpecular} suffix="%" value={mockup.glassSpecular} />
                <SliderControl label="Glass blur" max={30} min={0} onChange={setGlassBlur} suffix="px" value={mockup.glassBlur} />
                <div className={styles.colorInput}>
                  <Field label="Glass color">
                    <input onChange={(event) => setGlassColor(event.target.value)} type="color" value={mockup.glassColor} />
                  </Field>
                </div>
              </>
            ) : null}
            <SelectControl<ShadowLevel>
              label="Shadow"
              onChange={setShadow}
              options={[
                { label: "None", value: "none" },
                { label: "Soft", value: "soft" },
                { label: "Medium", value: "medium" },
                { label: "Strong", value: "strong" },
              ]}
              value={mockup.shadow}
            />
            <SliderControl label="Shadow opacity" max={100} min={0} onChange={setShadowOpacity} suffix="%" value={mockup.shadowOpacity} />
            <SliderControl label="Shadow blur" max={120} min={0} onChange={setShadowBlur} suffix="px" value={mockup.shadowBlur} />
            <SliderControl label="Shadow spread" max={40} min={-20} onChange={setShadowSpread} suffix="px" value={mockup.shadowSpread} />
            <LightJoystick onChange={setShadowDirection} x={mockup.shadowX} y={mockup.shadowY} />
            <ToggleControl checked={mockup.hideImage} label="Hide image" onChange={setHideImage} />
          </ControlGroup>
        </ScrollPanel>
      ) : (
        <ScrollPanel className={styles.scroll}>
          <ControlGroup title="Aspect ratio">
            <SelectControl<AspectRatioId>
              label="Resolution"
              onChange={(aspectRatio) => setFrame({ aspectRatio })}
              options={RESOLUTIONS.map((resolution) => ({ label: resolution.label, value: resolution.id }))}
              value={frame.aspectRatio}
            />
            {frame.aspectRatio === "custom" ? (
              <div className={styles.customGrid}>
                <Field label="Width">
                  <input onChange={(event) => setFrame({ customWidth: Number(event.target.value) })} type="number" value={frame.customWidth} />
                </Field>
                <Field label="Height">
                  <input onChange={(event) => setFrame({ customHeight: Number(event.target.value) })} type="number" value={frame.customHeight} />
                </Field>
              </div>
            ) : null}
          </ControlGroup>
          <ControlGroup title="Background effects">
            <SliderControl label="Blur" max={40} min={0} onChange={(blur) => setFrame({ blur })} suffix="px" value={frame.blur} />
            <SliderControl label="Noise" max={40} min={0} onChange={(noise) => setFrame({ noise })} suffix="%" value={frame.noise} />
          </ControlGroup>
          <ControlGroup title="Shadow overlay">
            <MediaDropArea kind="overlay" />
            <SliderControl
              label="Overlay opacity"
              max={100}
              min={0}
              onChange={(overlayOpacity) => setFrame({ overlayOpacity })}
              suffix="%"
              value={frame.overlayOpacity}
            />
            <Button disabled={!frame.overlayUrl} icon={<Trash2 />} onClick={() => setOverlay(null)} variant="ghost">
              Remove overlay
            </Button>
          </ControlGroup>
          <ControlGroup title="Background mode">
            <SegmentedControl<BackgroundMode>
              label="Mode"
              onChange={(backgroundMode) => setFrame({ backgroundMode })}
              options={[
                { label: "Transparent", value: "transparent" },
                { label: "Solid", value: "solid" },
                { label: "Image", value: "image" },
              ]}
              value={frame.backgroundMode}
            />
            {frame.backgroundMode === "solid" ? (
              <div className={styles.colorInput}>
                <Field label="Color">
                  <input onChange={(event) => setFrame({ solidColor: event.target.value })} type="color" value={frame.solidColor} />
                </Field>
              </div>
            ) : null}
            {frame.backgroundMode === "image" ? (
              <>
                <BackgroundImagePicker />
                <MediaDropArea kind="background" />
              </>
            ) : null}
          </ControlGroup>
          <ControlGroup title="Background library">
            <BackgroundLibrary />
            <span className={styles.hint}>{BACKGROUNDS.length} placeholder presets ready.</span>
          </ControlGroup>
        </ScrollPanel>
      )}
    </aside>
  );
}
