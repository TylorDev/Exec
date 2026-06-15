"use client";

import { Trash2 } from "lucide-react";
import { BACKGROUNDS } from "@/data/backgrounds";
import { RESOLUTIONS } from "@/data/resolutions";
import { Button } from "@/components/Button/Button";
import { BackgroundLibrary } from "@/components/BackgroundLibrary/BackgroundLibrary";
import { ControlGroup } from "@/components/ControlGroup/ControlGroup";
import { Field } from "@/components/Field/Field";
import { MediaDropArea } from "@/components/MediaDropArea/MediaDropArea";
import { PanelTabs } from "@/components/PanelTabs/PanelTabs";
import { ScrollPanel } from "@/components/ScrollPanel/ScrollPanel";
import { SegmentedControl } from "@/components/SegmentedControl/SegmentedControl";
import { SelectControl } from "@/components/SelectControl/SelectControl";
import { SliderControl } from "@/components/SliderControl/SliderControl";
import { ToggleControl } from "@/components/ToggleControl/ToggleControl";
import { useEditorStore } from "@/store/editorStore";
import type { AspectRatioId, BackgroundMode, MockupMode, ShadowLevel } from "@/types/editor";
import styles from "./LeftPanel.module.scss";

export function LeftPanel() {
  const { mockup, frame, ui } = useEditorStore();
  const setMockupMode = useEditorStore((state) => state.setMockupMode);
  const setBorderRadius = useEditorStore((state) => state.setBorderRadius);
  const setShadow = useEditorStore((state) => state.setShadow);
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
            <SelectControl
              label="Frame style"
              onChange={() => undefined}
              options={[{ label: "Thick Blur Frame", value: "thick-blur-frame" }]}
              value={mockup.style}
            />
            <SliderControl label="Border radius" max={64} min={0} onChange={setBorderRadius} suffix="px" value={mockup.borderRadius} />
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
