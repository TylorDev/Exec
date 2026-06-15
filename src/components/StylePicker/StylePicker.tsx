"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { MOCKUP_STYLES } from "@/data/mockupStyles";
import type { MockupStyle } from "@/types/editor";
import styles from "./StylePicker.module.scss";

interface StylePickerProps {
  onChange: (style: MockupStyle) => void;
  value: MockupStyle;
}

export function StylePicker({ onChange, value }: StylePickerProps) {
  return (
    <div className={styles.wrapper}>
      <span>Frame style</span>
      <ToggleGroup.Root
        aria-label="Frame style"
        className={styles.grid}
        onValueChange={(nextValue) => {
          if (nextValue) onChange(nextValue as MockupStyle);
        }}
        type="single"
        value={value}
      >
        {MOCKUP_STYLES.map((option) => {
          const Icon = option.icon;
          return (
            <ToggleGroup.Item className={styles.item} key={option.id} value={option.id}>
              <Icon />
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </ToggleGroup.Item>
          );
        })}
      </ToggleGroup.Root>
    </div>
  );
}
