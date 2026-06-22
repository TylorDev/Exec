import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { Field } from "@/components/Global/Field/Field";
import styles from "./SelectControl.module.scss";

interface Option<T extends string> {
  description?: string;
  disabled?: boolean;
  label: string;
  value: T;
}

interface SelectControlProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SelectControl<T extends string>({ label, options, value, onChange }: SelectControlProps<T>) {
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <Field label={label}>
      <Select.Root onValueChange={(nextValue) => onChange(nextValue as T)} value={value}>
        <Select.Trigger aria-label={label} className={styles.trigger}>
          <Select.Value>{selectedLabel}</Select.Value>
          <Select.Icon className={styles.icon}>
            <ChevronDown />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className={styles.content} position="popper" sideOffset={8}>
            <Select.Viewport className={styles.viewport}>
              {options.map((option) => (
                <Select.Item className={styles.item} disabled={option.disabled} key={option.value} value={option.value}>
                  <Select.ItemText>{option.description ? `${option.label} (${option.description})` : option.label}</Select.ItemText>
                  <Select.ItemIndicator className={styles.indicator}>
                    <Check />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </Field>
  );
}
