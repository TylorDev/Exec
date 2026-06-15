"use client";

import { RotateCcw } from "lucide-react";
import { useRef } from "react";
import { IconButton } from "@/components/IconButton/IconButton";
import styles from "./LightJoystick.module.scss";

interface LightJoystickProps {
  max?: number;
  onChange: (x: number, y: number) => void;
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function LightJoystick({ max = 80, onChange, x, y }: LightJoystickProps) {
  const padRef = useRef<HTMLDivElement>(null);

  const updateFromPointer = (clientX: number, clientY: number) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const half = rect.width / 2;
    const localX = clientX - rect.left - half;
    const localY = clientY - rect.top - half;
    const nextX = Math.round(clamp((localX / half) * max, -max, max));
    const nextY = Math.round(clamp((localY / half) * max, -max, max));
    onChange(nextX, nextY);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span>Light direction</span>
        <IconButton icon={<RotateCcw />} label="Center light" onClick={() => onChange(0, 32)} />
      </div>
      <div
        className={styles.pad}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 1) return;
          updateFromPointer(event.clientX, event.clientY);
        }}
        ref={padRef}
        role="presentation"
      >
        <span className={styles.axisX} />
        <span className={styles.axisY} />
        <span
          className={styles.handle}
          style={{
            left: `${50 + (x / max) * 50}%`,
            top: `${50 + (y / max) * 50}%`,
          }}
        />
      </div>
      <div className={styles.values}>
        <span>X {x}px</span>
        <span>Y {y}px</span>
      </div>
    </div>
  );
}
