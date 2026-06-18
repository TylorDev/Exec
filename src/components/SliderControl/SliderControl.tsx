"use client";

import * as Slider from "@radix-ui/react-slider";
import { Aperture, ChevronRight, Eye, Gauge, Gem, Move, RotateCw, Ruler, Sparkles, ZoomIn, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type PointerEvent } from "react";
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

const wrapCursorX = (value: number, width: number) => {
  if (width <= 0) return value;
  return ((value % width) + width) % width;
};

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
  const sliderPanelId = useId();
  const sliderLabelId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(() => formatValue(value, step));
  const [simulatedCursor, setSimulatedCursor] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueButtonRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef({
    didDrag: false,
    lastSteps: 0,
    pointerId: -1,
    startValue: value,
    startX: 0,
    startY: 0,
    totalPixels: 0,
    visualX: 0,
    visualY: 0,
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

  const finishDrag = useCallback((shouldEdit: boolean) => {
    const drag = dragRef.current;
    if (drag.pointerId === -1) return;
    const pointerId = drag.pointerId;

    if (shouldEdit && !drag.didDrag) setIsEditing(true);

    if (valueButtonRef.current?.hasPointerCapture(pointerId)) valueButtonRef.current.releasePointerCapture(pointerId);
    dragRef.current.pointerId = -1;
    setSimulatedCursor(null);

    if (document.pointerLockElement === valueButtonRef.current) document.exitPointerLock();
  }, []);

  const applyDragMovement = useCallback(
    (movementX: number) => {
      const drag = dragRef.current;
      if (drag.pointerId === -1 || movementX === 0) return;

      drag.didDrag = true;
      drag.totalPixels += movementX;
      drag.visualX = wrapCursorX(drag.visualX + movementX, window.innerWidth);
      setSimulatedCursor({ x: drag.visualX, y: drag.visualY });

      const nextSteps = Math.trunc(drag.totalPixels / DRAG_PIXELS_PER_STEP);
      if (nextSteps === drag.lastSteps) return;

      drag.lastSteps = nextSteps;
      onChange(roundToStep(drag.startValue + nextSteps * step, min, max, step));
    },
    [max, min, onChange, step],
  );

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== valueButtonRef.current) return;

      applyDragMovement(event.movementX);
    };

    const handleMouseUp = () => {
      finishDrag(true);
    };

    const handlePointerLockChange = () => {
      if (dragRef.current.pointerId !== -1 && document.pointerLockElement !== valueButtonRef.current) finishDrag(false);
    };

    const handlePointerLockError = () => {
      finishDrag(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("pointerlockerror", handlePointerLockError);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      document.removeEventListener("pointerlockerror", handlePointerLockError);
    };
  }, [applyDragMovement, finishDrag]);

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

    event.preventDefault();
    dragRef.current = {
      didDrag: false,
      lastSteps: 0,
      pointerId: event.pointerId,
      startValue: normalizedValue,
      startX: event.clientX,
      startY: event.clientY,
      totalPixels: 0,
      visualX: event.clientX,
      visualY: event.clientY,
    };
    setSimulatedCursor({ x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    try {
      Promise.resolve(event.currentTarget.requestPointerLock()).catch(() => finishDrag(false));
    } catch {
      finishDrag(false);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    if (document.pointerLockElement === event.currentTarget) return;

    applyDragMovement(event.clientX - drag.startX - drag.totalPixels);
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    finishDrag(true);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    finishDrag(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.control} data-editing={isEditing}>
        <button
          aria-controls={sliderPanelId}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Hide" : "Show"} slider for ${label}`}
          className={styles.disclosure}
          onClick={() => setIsExpanded((currentValue) => !currentValue)}
          type="button"
        >
          <ChevronRight aria-hidden="true" />
        </button>
        <Icon aria-hidden="true" className={styles.icon} strokeWidth={1.9} />
        <label className={styles.label} htmlFor={inputId} id={sliderLabelId}>
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
            data-dragging={simulatedCursor ? "true" : undefined}
            onPointerCancel={handlePointerCancel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            ref={valueButtonRef}
            type="button"
          >
            <span className={styles.value}>{displayValue}</span>
            {suffix ? <span className={styles.unit}>{suffix}</span> : null}
          </button>
        )}
      </div>
      {isExpanded ? (
        <div className={styles.sliderPanel} id={sliderPanelId}>
          <div className={styles.bounds}>
            <span>{formatValue(min, step)}</span>
            <span>{formatValue(max, step)}</span>
          </div>
          <Slider.Root
            aria-labelledby={sliderLabelId}
            className={styles.sliderRoot}
            max={max}
            min={min}
            onValueChange={([nextValue]) => onChange(roundToStep(nextValue, min, max, step))}
            step={step}
            value={[normalizedValue]}
          >
            <Slider.Track className={styles.sliderTrack}>
              <Slider.Range className={styles.sliderRange} />
            </Slider.Track>
            <Slider.Thumb className={styles.sliderThumb} />
          </Slider.Root>
        </div>
      ) : null}
      {simulatedCursor ? (
        <span
          aria-hidden="true"
          className={styles.simulatedCursor}
          style={{
            left: simulatedCursor.x,
            top: simulatedCursor.y,
          }}
        />
      ) : null}
    </div>
  );
}
