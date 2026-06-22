"use client";

import { ControlGroup } from "@/components/Global/ControlGroup/ControlGroup";
import { Field } from "@/components/Global/Field/Field";
import { SelectControl } from "@/components/Global/SelectControl/SelectControl";
import { SliderControl } from "@/components/Global/SliderControl/SliderControl";
import { ToggleControl } from "@/components/Global/ToggleControl/ToggleControl";
import { LightJoystick } from "@/components/LeftPanel/MockupSections/LightJoystick/LightJoystick";
import { StylePicker } from "@/components/LeftPanel/MockupSections/StylePicker/StylePicker";
import { useEditorStore } from "@/store/editorStore";
import type { ShadowLevel } from "@/types/editor";
import styles from "./FrameStyles.module.scss";

export function FrameStyles() {
  const mockup = useEditorStore((state) => state.mockup);
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
  const setGlassHighlightsEnabled = useEditorStore((state) => state.setGlassHighlightsEnabled);
  const setGlassLightColor = useEditorStore((state) => state.setGlassLightColor);
  const setGlassRefraction = useEditorStore((state) => state.setGlassRefraction);
  const setGlassSpecular = useEditorStore((state) => state.setGlassSpecular);
  const setGlassThickness = useEditorStore((state) => state.setGlassThickness);
  const setHideImage = useEditorStore((state) => state.setHideImage);

  return (
    <ControlGroup title="Frame Styles">
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
          <ToggleControl checked={mockup.glassHighlightsEnabled} label="Glass reflections" onChange={setGlassHighlightsEnabled} />
          <div className={styles.colorInput}>
            <Field label="Reflection color">
              <input
                disabled={!mockup.glassHighlightsEnabled}
                onChange={(event) => setGlassLightColor(event.target.value)}
                type="color"
                value={mockup.glassLightColor}
              />
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
  );
}
