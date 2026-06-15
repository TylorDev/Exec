import type { CameraPreset, CameraState } from "@/types/editor";

export interface CameraPresetConfig {
  camera: CameraState;
  description: string;
  label: string;
  value: CameraPreset;
}

export const CAMERA_PRESETS: CameraPresetConfig[] = [
  {
    value: "center",
    label: "Center",
    description: "Straight front",
    camera: { zoom: 1, x: 0, y: 0, rotationX: 0, rotationY: 0, rotationZ: 0, perspective: 42 },
  },
  {
    value: "top",
    label: "Top",
    description: "Desk tilt",
    camera: { zoom: 1, x: 0, y: -10, rotationX: -34, rotationY: 0, rotationZ: 0, perspective: 46 },
  },
  {
    value: "bottom",
    label: "Bottom",
    description: "Low angle",
    camera: { zoom: 1, x: 0, y: 13, rotationX: 28, rotationY: 0, rotationZ: 0, perspective: 44 },
  },
  {
    value: "left",
    label: "Left",
    description: "Left yaw",
    camera: { zoom: 1, x: -12, y: 0, rotationX: -10, rotationY: -32, rotationZ: 0, perspective: 45 },
  },
  {
    value: "right",
    label: "Right",
    description: "Right yaw",
    camera: { zoom: 1, x: 12, y: 0, rotationX: -10, rotationY: 32, rotationZ: 0, perspective: 45 },
  },
  {
    value: "close",
    label: "Close Up",
    description: "Near crop",
    camera: { zoom: 1.28, x: 0, y: 0, rotationX: -16, rotationY: -16, rotationZ: -2, perspective: 36 },
  },
  {
    value: "wide",
    label: "Wide",
    description: "Pulled back",
    camera: { zoom: 0.78, x: 0, y: 0, rotationX: -22, rotationY: 18, rotationZ: 0, perspective: 56 },
  },
];

export const CAMERA_PRESET_MAP = CAMERA_PRESETS.reduce<Record<CameraPreset, CameraState>>((presets, preset) => {
  presets[preset.value] = preset.camera;
  return presets;
}, {} as Record<CameraPreset, CameraState>);

export function getActiveCameraPreset(camera: CameraState) {
  return CAMERA_PRESETS.find((preset) =>
    (Object.keys(preset.camera) as Array<keyof CameraState>).every((key) => Math.abs(preset.camera[key] - camera[key]) < 0.01),
  )?.value;
}
