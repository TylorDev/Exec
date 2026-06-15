export type MockupMode = "screenshot" | "browser";
export type MockupStyle =
  | "thick-blur-frame"
  | "bevel"
  | "liquid-glass"
  | "solid-border"
  | "stack"
  | "outline"
  | "soft-glow"
  | "minimal";
export type ShadowLevel = "none" | "soft" | "medium" | "strong";
export type AspectRatioId = "16:9" | "4:3" | "1:1" | "9:16" | "21:9" | "custom";
export type BackgroundMode = "transparent" | "solid" | "image";
export type BackgroundCategory =
  | "Solid"
  | "Gradient"
  | "Glass"
  | "Cosmic"
  | "Mystic"
  | "Desktop"
  | "Abstract"
  | "Earth"
  | "Radiant"
  | "Texture";
export type CameraPreset = "center" | "top" | "bottom" | "left" | "right" | "close" | "wide";
export type ExportFormat = "png" | "jpg" | "jpeg" | "webp" | "avif";

export interface Resolution {
  id: AspectRatioId;
  label: string;
  width: number;
  height: number;
}

export interface BackgroundPreset {
  id: string;
  category: BackgroundCategory;
  label: string;
  preview: string;
  css: string;
}

export interface MockupState {
  imageUrl: string | null;
  imageName: string | null;
  mode: MockupMode;
  style: MockupStyle;
  borderRadius: number;
  borderWidth: number;
  shadow: ShadowLevel;
  shadowBlur: number;
  shadowOpacity: number;
  shadowSpread: number;
  shadowX: number;
  shadowY: number;
  hideImage: boolean;
}

export interface FrameState {
  aspectRatio: AspectRatioId;
  customWidth: number;
  customHeight: number;
  backgroundMode: BackgroundMode;
  solidColor: string;
  selectedBackgroundId: string;
  blur: number;
  noise: number;
  overlayUrl: string | null;
  overlayOpacity: number;
}

export interface CameraState {
  zoom: number;
  x: number;
  y: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  perspective: number;
}

export interface UiState {
  activeTab: "mockup" | "frame";
  hideUi: boolean;
}

export interface ExportState {
  format: ExportFormat;
  quality: number;
  error: string | null;
  isExporting: boolean;
}

export interface EditorSnapshot {
  mockup: MockupState;
  frame: FrameState;
  camera: CameraState;
  ui: UiState;
  exportSettings: ExportState;
}
