import * as Slider from "@radix-ui/react-slider";
import { Field } from "@/components/Field/Field";
import styles from "./SliderControl.module.scss";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}

export function SliderControl({ label, value, min, max, step = 1, suffix = "", onChange }: SliderControlProps) {
  return (
    <Field
      label={label}
      value={
        <>
          {value}
          {suffix}
        </>
      }
    >
      <Slider.Root
        className={styles.root}
        max={max}
        min={min}
        onValueChange={([nextValue]) => onChange(nextValue)}
        step={step}
        value={[value]}
      >
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label={label} className={styles.thumb} />
      </Slider.Root>
    </Field>
  );
}
