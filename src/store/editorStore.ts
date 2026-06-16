"use client";

import { create } from "zustand";
import { BACKGROUNDS } from "@/data/backgrounds";
import { CAMERA_PRESET_MAP } from "@/data/cameraPresets";
import type {
  BackgroundImage,
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
  glassRefraction: 100,
  glassThickness: 42,
  glassSpecular: 55,
  glassBlur: 8,
  glassColor: "#89f7dc",
  glassHighlightsEnabled: true,
  glassLightColor: "#ffffff",
  hideImage: false,
};

const initialFrame: FrameState = {
  aspectRatio: "16:9",
  customWidth: 1600,
  customHeight: 900,
  backgroundMode: "image",
  backgroundImageUrl: null,
  backgroundImageName: null,
  backgroundImages: [],
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
  setGlassRefraction: (glassRefraction: number) => void;
  setGlassThickness: (glassThickness: number) => void;
  setGlassSpecular: (glassSpecular: number) => void;
  setGlassBlur: (glassBlur: number) => void;
  setGlassColor: (glassColor: string) => void;
  setGlassHighlightsEnabled: (glassHighlightsEnabled: boolean) => void;
  setGlassLightColor: (glassLightColor: string) => void;
  setHideImage: (hideImage: boolean) => void;
  setActiveTab: (activeTab: UiState["activeTab"]) => void;
  setHideUi: (hideUi: boolean) => void;
  setFrame: (frame: Partial<FrameState>) => void;
  addBackgroundImages: (files: File[]) => void;
  randomizeBackground: () => void;
  setBackgroundImage: (url: string | null, name?: string) => void;
  selectBackgroundImage: (id: string) => void;
  selectBackgroundPreset: (id: string) => void;
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

const addObjectUrl = (urls: Set<string>, url: string | null) => {
  if (url?.startsWith("blob:")) urls.add(url);
};

const collectSnapshotObjectUrls = (snapshot: Pick<EditorSnapshot, "mockup" | "frame">, urls = new Set<string>()) => {
  addObjectUrl(urls, snapshot.mockup.imageUrl);
  addObjectUrl(urls, snapshot.frame.backgroundImageUrl);
  addObjectUrl(urls, snapshot.frame.overlayUrl);
  snapshot.frame.backgroundImages.forEach((image) => addObjectUrl(urls, image.url));
  return urls;
};

const collectStoreObjectUrls = (state: Pick<EditorStore, "mockup" | "frame" | "past" | "future">) => {
  const urls = collectSnapshotObjectUrls({ mockup: state.mockup, frame: state.frame });
  state.past.forEach((snapshot) => collectSnapshotObjectUrls(snapshot, urls));
  state.future.forEach((snapshot) => collectSnapshotObjectUrls(snapshot, urls));
  return urls;
};

const collectSnapshotsObjectUrls = (snapshots: EditorSnapshot[]) => {
  const urls = new Set<string>();
  snapshots.forEach((snapshot) => collectSnapshotObjectUrls(snapshot, urls));
  return urls;
};

const revokeUnreferencedObjectUrls = (candidates: Iterable<string>, state: Pick<EditorStore, "mockup" | "frame" | "past" | "future">) => {
  const referenced = collectStoreObjectUrls(state);
  new Set(candidates).forEach((url) => {
    if (!referenced.has(url)) revokeObjectUrl(url);
  });
};

const makeLocalBackgroundId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `background-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const isImageFile = (file: File) => file.type.startsWith("image/");

export const useEditorStore = create<EditorStore>((set, get) => {
  const withHistory = (next: Partial<Pick<EditorStore, "mockup" | "frame" | "camera" | "ui" | "exportSettings">>) => {
    const state = get();
    const discardedFutureUrls = collectSnapshotsObjectUrls(state.future);
    set({
      ...next,
      past: [...state.past.slice(-39), makeSnapshot(state)],
      future: [],
    });
    revokeUnreferencedObjectUrls(discardedFutureUrls, get());
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
      withHistory({ mockup: { ...get().mockup, imageUrl: url, imageName: name, hideImage: false } });
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
    setGlassRefraction: (glassRefraction) => withHistory({ mockup: { ...get().mockup, glassRefraction } }),
    setGlassThickness: (glassThickness) => withHistory({ mockup: { ...get().mockup, glassThickness } }),
    setGlassSpecular: (glassSpecular) => withHistory({ mockup: { ...get().mockup, glassSpecular } }),
    setGlassBlur: (glassBlur) => withHistory({ mockup: { ...get().mockup, glassBlur } }),
    setGlassColor: (glassColor) => withHistory({ mockup: { ...get().mockup, glassColor } }),
    setGlassHighlightsEnabled: (glassHighlightsEnabled) => withHistory({ mockup: { ...get().mockup, glassHighlightsEnabled } }),
    setGlassLightColor: (glassLightColor) => withHistory({ mockup: { ...get().mockup, glassLightColor } }),
    setHideImage: (hideImage) => withHistory({ mockup: { ...get().mockup, hideImage } }),
    setActiveTab: (activeTab) => set({ ui: { ...get().ui, activeTab } }),
    setHideUi: (hideUi) => set({ ui: { ...get().ui, hideUi } }),
    setFrame: (frame) => withHistory({ frame: { ...get().frame, ...frame } }),
    addBackgroundImages: (files) => {
      const images: BackgroundImage[] = files.filter(isImageFile).map((file) => ({
        id: makeLocalBackgroundId(),
        name: file.name || "Background image",
        url: URL.createObjectURL(file),
      }));
      const first = images[0];
      if (!first) return;
      const frame = get().frame;
      withHistory({
        frame: {
          ...frame,
          backgroundMode: "image",
          backgroundImageUrl: first.url,
          backgroundImageName: first.name,
          backgroundImages: [...frame.backgroundImages, ...images],
        },
      });
    },
    randomizeBackground: () => {
      const frame = get().frame;
      const items = [
        ...BACKGROUNDS.map((background) => ({ type: "preset" as const, id: background.id })),
        ...frame.backgroundImages.map((background) => ({ type: "local" as const, id: background.id })),
      ];
      const item = items[Math.floor(Math.random() * items.length)];
      if (!item) return;
      if (item.type === "preset") {
        get().selectBackgroundPreset(item.id);
        return;
      }
      get().selectBackgroundImage(item.id);
    },
    setBackgroundImage: (url, name) => {
      withHistory({
        frame: {
          ...get().frame,
          backgroundMode: "image",
          backgroundImageUrl: url,
          backgroundImageName: url ? name ?? "Background loaded" : null,
        },
      });
    },
    selectBackgroundImage: (id) => {
      const image = get().frame.backgroundImages.find((background) => background.id === id);
      if (!image) return;
      withHistory({
        frame: {
          ...get().frame,
          backgroundMode: "image",
          backgroundImageUrl: image.url,
          backgroundImageName: image.name,
        },
      });
    },
    selectBackgroundPreset: (id) => {
      withHistory({
        frame: {
          ...get().frame,
          backgroundMode: "image",
          selectedBackgroundId: id,
          backgroundImageUrl: null,
          backgroundImageName: null,
        },
      });
    },
    setOverlay: (url) => {
      withHistory({ frame: { ...get().frame, overlayUrl: url } });
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
