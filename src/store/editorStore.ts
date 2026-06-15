"use client";

import { create } from "zustand";
import { BACKGROUNDS } from "@/data/backgrounds";
import { CAMERA_PRESET_MAP } from "@/data/cameraPresets";
import type {
  CameraPreset,
  CameraState,
  EditorSnapshot,
  ExportFormat,
  ExportState,
  FrameState,
  MockupMode,
  MockupState,
  ShadowLevel,
  UiState,
} from "@/types/editor";

const initialMockup: MockupState = {
  imageUrl: null,
  imageName: null,
  mode: "screenshot",
  style: "thick-blur-frame",
  borderRadius: 28,
  borderWidth: 14,
  shadow: "medium",
  shadowBlur: 80,
  shadowOpacity: 38,
  shadowSpread: 0,
  shadowX: 0,
  shadowY: 32,
  hideImage: false,
};

const initialFrame: FrameState = {
  aspectRatio: "16:9",
  customWidth: 1600,
  customHeight: 900,
  backgroundMode: "image",
  solidColor: "#11131b",
  selectedBackgroundId: BACKGROUNDS[2].id,
  blur: 0,
  noise: 8,
  overlayUrl: null,
  overlayOpacity: 35,
};

const initialCamera: CameraState = {
  zoom: 1,
  x: 0,
  y: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  perspective: 42,
};

const initialUi: UiState = {
  activeTab: "mockup",
  hideUi: false,
};

const initialExport: ExportState = {
  format: "png",
  quality: 0.92,
  error: null,
  isExporting: false,
};

const shadowPresets: Record<ShadowLevel, Pick<MockupState, "shadowBlur" | "shadowOpacity" | "shadowSpread">> = {
  none: { shadowBlur: 0, shadowOpacity: 0, shadowSpread: 0 },
  soft: { shadowBlur: 45, shadowOpacity: 24, shadowSpread: -4 },
  medium: { shadowBlur: 80, shadowOpacity: 38, shadowSpread: 0 },
  strong: { shadowBlur: 120, shadowOpacity: 56, shadowSpread: 8 },
};

interface EditorStore {
  mockup: MockupState;
  frame: FrameState;
  camera: CameraState;
  ui: UiState;
  exportSettings: ExportState;
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  setMockupImage: (url: string, name: string) => void;
  setMockupMode: (mode: MockupMode) => void;
  setMockupStyle: (style: MockupState["style"]) => void;
  setBorderRadius: (borderRadius: number) => void;
  setBorderWidth: (borderWidth: number) => void;
  setShadow: (shadow: ShadowLevel) => void;
  setShadowBlur: (shadowBlur: number) => void;
  setShadowDirection: (shadowX: number, shadowY: number) => void;
  setShadowOpacity: (shadowOpacity: number) => void;
  setShadowSpread: (shadowSpread: number) => void;
  setHideImage: (hideImage: boolean) => void;
  setActiveTab: (activeTab: UiState["activeTab"]) => void;
  setHideUi: (hideUi: boolean) => void;
  setFrame: (frame: Partial<FrameState>) => void;
  setOverlay: (url: string | null) => void;
  setCamera: (camera: Partial<CameraState>) => void;
  applyCameraPreset: (preset: CameraPreset) => void;
  setExportFormat: (format: ExportFormat) => void;
  setExportQuality: (quality: number) => void;
  setExportStatus: (status: Partial<Pick<ExportState, "error" | "isExporting">>) => void;
  undo: () => void;
  redo: () => void;
}

const makeSnapshot = (state: Pick<EditorStore, "mockup" | "frame" | "camera" | "ui" | "exportSettings">): EditorSnapshot => ({
  mockup: { ...state.mockup },
  frame: { ...state.frame },
  camera: { ...state.camera },
  ui: { ...state.ui },
  exportSettings: { ...state.exportSettings },
});

const revokeObjectUrl = (url: string | null) => {
  if (typeof window !== "undefined" && url?.startsWith("blob:")) {
    window.URL.revokeObjectURL(url);
  }
};

export const useEditorStore = create<EditorStore>((set, get) => {
  const withHistory = (next: Partial<Pick<EditorStore, "mockup" | "frame" | "camera" | "ui" | "exportSettings">>) => {
    const state = get();
    set({
      ...next,
      past: [...state.past.slice(-39), makeSnapshot(state)],
      future: [],
    });
  };

  return {
    mockup: initialMockup,
    frame: initialFrame,
    camera: initialCamera,
    ui: initialUi,
    exportSettings: initialExport,
    past: [],
    future: [],
    setMockupImage: (url, name) => {
      const previous = get().mockup.imageUrl;
      withHistory({ mockup: { ...get().mockup, imageUrl: url, imageName: name, hideImage: false } });
      revokeObjectUrl(previous);
    },
    setMockupMode: (mode) => withHistory({ mockup: { ...get().mockup, mode } }),
    setMockupStyle: (style) => withHistory({ mockup: { ...get().mockup, style } }),
    setBorderRadius: (borderRadius) => withHistory({ mockup: { ...get().mockup, borderRadius } }),
    setBorderWidth: (borderWidth) => withHistory({ mockup: { ...get().mockup, borderWidth } }),
    setShadow: (shadow) => withHistory({ mockup: { ...get().mockup, shadow, ...shadowPresets[shadow] } }),
    setShadowBlur: (shadowBlur) => withHistory({ mockup: { ...get().mockup, shadowBlur } }),
    setShadowDirection: (shadowX, shadowY) => withHistory({ mockup: { ...get().mockup, shadowX, shadowY } }),
    setShadowOpacity: (shadowOpacity) => withHistory({ mockup: { ...get().mockup, shadowOpacity } }),
    setShadowSpread: (shadowSpread) => withHistory({ mockup: { ...get().mockup, shadowSpread } }),
    setHideImage: (hideImage) => withHistory({ mockup: { ...get().mockup, hideImage } }),
    setActiveTab: (activeTab) => set({ ui: { ...get().ui, activeTab } }),
    setHideUi: (hideUi) => set({ ui: { ...get().ui, hideUi } }),
    setFrame: (frame) => withHistory({ frame: { ...get().frame, ...frame } }),
    setOverlay: (url) => {
      const previous = get().frame.overlayUrl;
      withHistory({ frame: { ...get().frame, overlayUrl: url } });
      revokeObjectUrl(previous);
    },
    setCamera: (camera) => withHistory({ camera: { ...get().camera, ...camera } }),
    applyCameraPreset: (preset) => withHistory({ camera: CAMERA_PRESET_MAP[preset] }),
    setExportFormat: (format) => withHistory({ exportSettings: { ...get().exportSettings, format, error: null } }),
    setExportQuality: (quality) => withHistory({ exportSettings: { ...get().exportSettings, quality } }),
    setExportStatus: (status) => set({ exportSettings: { ...get().exportSettings, ...status } }),
    undo: () => {
      const state = get();
      const previous = state.past.at(-1);
      if (!previous) return;
      set({
        ...previous,
        past: state.past.slice(0, -1),
        future: [makeSnapshot(state), ...state.future],
      });
    },
    redo: () => {
      const state = get();
      const next = state.future[0];
      if (!next) return;
      set({
        ...next,
        past: [...state.past, makeSnapshot(state)],
        future: state.future.slice(1),
      });
    },
  };
});
