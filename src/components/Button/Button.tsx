import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({ asChild = false, children, className = "", icon, variant = "secondary", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp className={`${styles.button} ${styles[variant]} ${className}`} {...props}>
      {icon}
      <span>{children}</span>
    </Comp>
  );
}
