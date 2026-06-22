"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/Global/Button/Button";
import { ControlGroup } from "@/components/Global/ControlGroup/ControlGroup";
import { SliderControl } from "@/components/Global/SliderControl/SliderControl";
import { MediaDropArea } from "@/components/LeftPanel/MockupSections/MediaDropArea/MediaDropArea";
import { useEditorStore } from "@/store/editorStore";
import styles from "./ShadowOverlay.module.scss";

export function ShadowOverlay() {
  const overlayOpacity = useEditorStore((state) => state.frame.overlayOpacity);
  const overlayUrl = useEditorStore((state) => state.frame.overlayUrl);
  const setFrame = useEditorStore((state) => state.setFrame);
  const setOverlay = useEditorStore((state) => state.setOverlay);

  return (
    <ControlGroup title="Shadow overlay">
      <div className={styles.content}>
        <MediaDropArea kind="overlay" />
        <SliderControl
          label="Overlay opacity"
          max={100}
          min={0}
          onChange={(nextOverlayOpacity) => setFrame({ overlayOpacity: nextOverlayOpacity })}
          suffix="%"
          value={overlayOpacity}
        />
        <Button disabled={!overlayUrl} icon={<Trash2 />} onClick={() => setOverlay(null)} variant="ghost">
          Remove overlay
        </Button>
      </div>
    </ControlGroup>
  );
}
