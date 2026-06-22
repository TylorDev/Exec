"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { BACKGROUND_CATEGORIES, BACKGROUNDS } from "@/data/backgrounds";
import { ScrollPanel } from "@/components/Global/ScrollPanel/ScrollPanel";
import { useEditorStore } from "@/store/editorStore";
import styles from "./BackgroundLibrary.module.scss";

export function BackgroundLibrary() {
  const { backgroundImageUrl, selectedBackgroundId } = useEditorStore((state) => state.frame);
  const selectBackgroundPreset = useEditorStore((state) => state.selectBackgroundPreset);

  return (
    <ScrollPanel className={styles.library}>
      {BACKGROUND_CATEGORIES.map((category) => (
        <section key={category}>
          <h3>{category}</h3>
          <ToggleGroup.Root
            aria-label={`${category} backgrounds`}
            className={styles.grid}
            onValueChange={(value) => {
              if (!value) return;
              selectBackgroundPreset(value);
            }}
            type="single"
            value={backgroundImageUrl ? "" : selectedBackgroundId}
          >
            {BACKGROUNDS.filter((background) => background.category === category).map((background) => (
              <ToggleGroup.Item
                className={styles.item}
                key={background.id}
                value={background.id}
              >
                <i style={{ background: background.preview }} />
                <span>{background.label}</span>
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </section>
      ))}
    </ScrollPanel>
  );
}
