import * as Switch from "@radix-ui/react-switch";
import { Field } from "@/components/Field/Field";
import styles from "./ToggleControl.module.scss";

interface ToggleControlProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleControl({ label, checked, onChange }: ToggleControlProps) {
  return (
    <div className={styles.row}>
      <Field label={label}>
        <Switch.Root checked={checked} className={styles.switch} onCheckedChange={onChange}>
          <Switch.Thumb className={styles.thumb} />
        </Switch.Root>
      </Field>
    </div>
  );
}
