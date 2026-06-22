import type { CameraPreset, LayerTransform } from "@/types/editor";

export interface CameraPresetConfig {
  transform: LayerTransform;
  description: string;
  label: string;
  value: CameraPreset;
}

export const CAMERA_PRESETS: CameraPresetConfig[] = [
  {
    value: "center",
    label: "Center",
    description: "Straight front",
    transform: { scale: 1, positionX: 0, positionY: 0, positionZ: 0, rotationX: 0, rotationY: 0, rotationZ: 0, perspective: 42 },
  },
  {
    value: "top",
    label: "Top",
    description: "Desk tilt",
    transform: { scale: 1, positionX: 0, positionY: -10, positionZ: 0, rotationX: -34, rotationY: 0, rotationZ: 0, perspective: 46 },
  },
  {
    value: "bottom",
    label: "Bottom",
    description: "Low angle",
    transform: { scale: 1, positionX: 0, positionY: 13, positionZ: 0, rotationX: 28, rotationY: 0, rotationZ: 0, perspective: 44 },
  },
  {
    value: "left",
    label: "Left",
    description: "Left yaw",
    transform: { scale: 1, positionX: -12, positionY: 0, positionZ: 0, rotationX: -10, rotationY: -32, rotationZ: 0, perspective: 45 },
  },
  {
    value: "right",
    label: "Right",
    description: "Right yaw",
    transform: { scale: 1, positionX: 12, positionY: 0, positionZ: 0, rotationX: -10, rotationY: 32, rotationZ: 0, perspective: 45 },
  },
  {
    value: "close",
    label: "Close Up",
    description: "Near crop",
    transform: { scale: 1.28, positionX: 0, positionY: 0, positionZ: 0, rotationX: -16, rotationY: -16, rotationZ: -2, perspective: 36 },
  },
  {
    value: "wide",
    label: "Wide",
    description: "Pulled back",
    transform: { scale: 0.78, positionX: 0, positionY: 0, positionZ: 0, rotationX: -22, rotationY: 18, rotationZ: 0, perspective: 56 },
  },
];

export const CAMERA_PRESET_MAP = CAMERA_PRESETS.reduce<Record<CameraPreset, LayerTransform>>((presets, preset) => {
  presets[preset.value] = preset.transform;
  return presets;
}, {} as Record<CameraPreset, LayerTransform>);

export function getActiveCameraPreset(transform: LayerTransform) {
  return CAMERA_PRESETS.find((preset) =>
    (Object.keys(preset.transform) as Array<keyof LayerTransform>).every((key) => Math.abs(preset.transform[key] - transform[key]) < 0.01),
  )?.value;
}
