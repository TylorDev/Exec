import * as ScrollArea from "@radix-ui/react-scroll-area";
import type { ReactNode } from "react";
import styles from "./ScrollPanel.module.scss";

interface ScrollPanelProps {
  children: ReactNode;
  className?: string;
}

export function ScrollPanel({ children, className = "" }: ScrollPanelProps) {
  return (
    <ScrollArea.Root className={`${styles.root} ${className}`}>
      <ScrollArea.Viewport className={styles.viewport}>{children}</ScrollArea.Viewport>
      <ScrollArea.Scrollbar className={styles.scrollbar} orientation="vertical">
        <ScrollArea.Thumb className={styles.thumb} />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}
