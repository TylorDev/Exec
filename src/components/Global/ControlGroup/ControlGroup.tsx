import type { ReactNode } from "react";
import styles from "./ControlGroup.module.scss";

interface ControlGroupProps {
  title: string;
  children: ReactNode;
}

export function ControlGroup({ title, children }: ControlGroupProps) {
  return (
    <section className={styles.group}>
      <h2>{title}</h2>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
