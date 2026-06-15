import * as Label from "@radix-ui/react-label";
import type { ReactNode } from "react";
import styles from "./Field.module.scss";

interface FieldProps {
  children: ReactNode;
  htmlFor?: string;
  label: string;
  value?: ReactNode;
}

export function Field({ children, htmlFor, label, value }: FieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.header}>
        <Label.Root className={styles.label} htmlFor={htmlFor}>
          {label}
        </Label.Root>
        {value !== undefined ? <span className={styles.value}>{value}</span> : null}
      </div>
      {children}
    </div>
  );
}
