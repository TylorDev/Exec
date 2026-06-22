import * as ToggleGroup from "@radix-ui/react-toggle-group";
import styles from "./SegmentedControl.module.scss";

interface Option<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className={styles.wrapper}>
      <span>{label}</span>
      <ToggleGroup.Root
        aria-label={label}
        className={styles.control}
        onValueChange={(nextValue) => {
          if (nextValue) onChange(nextValue as T);
        }}
        type="single"
        value={value}
      >
        {options.map((option) => (
          <ToggleGroup.Item className={styles.item} key={option.value} value={option.value}>
            {option.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    </div>
  );
}
