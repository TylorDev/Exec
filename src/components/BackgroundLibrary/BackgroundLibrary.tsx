"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { BACKGROUND_CATEGORIES, BACKGROUNDS } from "@/data/backgrounds";
import { ScrollPanel } from "@/components/ScrollPanel/ScrollPanel";
import { useEditorStore } from "@/store/editorStore";
import styles from "./BackgroundLibrary.module.scss";

export function BackgroundLibrary() {
  const selectedBackgroundId = useEditorStore((state) => state.frame.selectedBackgroundId);
  const setFrame = useEditorStore((state) => state.setFrame);
  const setBackgroundImage = useEditorStore((state) => state.setBackgroundImage);

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
              setFrame({ selectedBackgroundId: value, backgroundMode: "image" });
              setBackgroundImage(null);
            }}
            type="single"
            value={selectedBackgroundId}
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
