"use client";

import { Aperture, Eye, Gauge, Gem, Move, RotateCw, Ruler, Sparkles, ZoomIn, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
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

const DRAG_PIXELS_PER_STEP = 6;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getStepDecimals = (step: number) => {
  const normalized = step.toString().toLowerCase();
  if (!normalized.includes("e")) return normalized.split(".")[1]?.length ?? 0;

  const [, exponent = "0"] = normalized.split("e-");
  return Number(exponent) || 0;
};

const roundToStep = (value: number, min: number, max: number, step: number) => {
  const decimals = getStepDecimals(step);
  const stepped = Math.round((value - min) / step) * step + min;
  return Number(clamp(stepped, min, max).toFixed(decimals));
};

const formatValue = (value: number, step: number) => {
  const decimals = getStepDecimals(step);
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
};

const getSliderIcon = (label: string): LucideIcon => {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("glass")) return Gem;
  if (normalizedLabel.includes("specular")) return Sparkles;
  if (normalizedLabel.includes("opacity") || normalizedLabel.includes("noise") || normalizedLabel.includes("quality") || normalizedLabel.includes("refraction")) return Eye;
  if (normalizedLabel.includes("zoom") || normalizedLabel.includes("scale")) return ZoomIn;
  if (normalizedLabel.includes("move") || normalizedLabel.includes("position")) return Move;
  if (normalizedLabel.includes("tilt") || normalizedLabel.includes("yaw") || normalizedLabel.includes("roll") || normalizedLabel.includes("rotation")) return RotateCw;
  if (normalizedLabel.includes("radius") || normalizedLabel.includes("thickness") || normalizedLabel.includes("blur") || normalizedLabel.includes("spread") || normalizedLabel.includes("perspective")) return Ruler;
  if (normalizedLabel.includes("shadow")) return Aperture;

  return Gauge;
};

export function SliderControl({ label, value, min, max, step = 1, suffix = "", onChange }: SliderControlProps) {
  const inputId = useId();
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(() => formatValue(value, step));
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef({
    didDrag: false,
    lastSteps: 0,
    pointerId: -1,
    startValue: value,
    startX: 0,
  });

  const normalizedValue = roundToStep(value, min, max, step);
  const displayValue = formatValue(normalizedValue, step);
  const Icon = getSliderIcon(label);

  useEffect(() => {
    if (!isEditing) setDraftValue(formatValue(value, step));
  }, [isEditing, step, value]);

  useEffect(() => {
    if (!isEditing) return;

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing]);

  const confirmDraft = () => {
    const trimmedValue = draftValue.trim();
    const nextValue = Number(trimmedValue);
    if (trimmedValue && Number.isFinite(nextValue)) onChange(roundToStep(nextValue, min, max, step));
    setIsEditing(false);
  };

  const cancelDraft = () => {
    setDraftValue(formatValue(value, step));
    setIsEditing(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || isEditing) return;

    dragRef.current = {
      didDrag: false,
      lastSteps: 0,
      pointerId: event.pointerId,
      startValue: normalizedValue,
      startX: event.clientX,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    const nextSteps = Math.trunc((event.clientX - drag.startX) / DRAG_PIXELS_PER_STEP);
    if (nextSteps === drag.lastSteps) return;

    drag.didDrag = true;
    drag.lastSteps = nextSteps;
    onChange(roundToStep(drag.startValue + nextSteps * step, min, max, step));
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    if (!drag.didDrag) setIsEditing(true);

    dragRef.current.pointerId = -1;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;

    dragRef.current.pointerId = -1;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className={styles.control} data-editing={isEditing}>
      <Icon aria-hidden="true" className={styles.icon} strokeWidth={1.9} />
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      {isEditing ? (
        <span className={styles.editValue}>
          <input
            className={styles.input}
            id={inputId}
            inputMode="decimal"
            max={max}
            min={min}
            onBlur={confirmDraft}
            onChange={(event) => setDraftValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") confirmDraft();
              if (event.key === "Escape") cancelDraft();
            }}
            ref={inputRef}
            step={step}
            type="number"
            value={draftValue}
          />
          {suffix ? <span className={styles.unit}>{suffix}</span> : null}
        </span>
      ) : (
        <button
          aria-label={`${label}: ${displayValue}${suffix}`}
          className={styles.valueButton}
          onPointerCancel={handlePointerCancel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          type="button"
        >
          <span className={styles.value}>{displayValue}</span>
          {suffix ? <span className={styles.unit}>{suffix}</span> : null}
        </button>
      )}
    </div>
  );
}
