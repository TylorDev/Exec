"use client";

import { create } from "zustand";
import { BACKGROUNDS } from "@/data/backgrounds";
import { CAMERA_PRESET_MAP } from "@/data/cameraPresets";
import type {
  BackgroundImage,
  CameraPreset,
  EditorSnapshot,
  ExportFormat,
  ExportState,
  FrameState,
  LayerCount,
  LayerId,
  LayerState,
  LayerTransform,
  MockupMode,
  MockupState,
  RenderEngine,
  ShadowLevel,
  UiState,
} from "@/types/editor";

const createInitialMockup = (): MockupState => ({
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
});

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

const createInitialTransform = (): LayerTransform => ({
  scale: 1,
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  perspective: 42,
});

const LAYER_LAYOUTS: Record<LayerCount, Record<LayerId, LayerTransform>> = {
  1: {
    1: createInitialTransform(),
    2: createInitialTransform(),
    3: createInitialTransform(),
  },
  2: {
    1: { ...createInitialTransform(), scale: 0.86, positionX: -22, rotationX: -8, rotationY: -18, positionZ: -24 },
    2: { ...createInitialTransform(), scale: 0.86, positionX: 22, rotationX: -8, rotationY: 18, positionZ: 12 },
    3: createInitialTransform(),
  },
  3: {
    1: { ...createInitialTransform(), scale: 0.76, positionX: -28, positionY: 4, positionZ: -42, rotationX: -12, rotationY: -22, rotationZ: -4 },
    2: { ...createInitialTransform(), scale: 0.82, positionX: 0, positionY: -2, positionZ: 18, rotationX: -10, rotationY: 0, rotationZ: 0 },
    3: { ...createInitialTransform(), scale: 0.76, positionX: 28, positionY: 4, positionZ: -18, rotationX: -12, rotationY: 22, rotationZ: 4 },
  },
};

const initialUi: UiState = {
  activeTab: "mockup",
  hideUi: false,
};

const initialExport: ExportState = {
  format: "png",
  quality: 0.92,
  renderEngine: "chromium",
  error: null,
  isExporting: false,
};

const shadowPresets: Record<ShadowLevel, Pick<MockupState, "shadowBlur" | "shadowOpacity" | "shadowSpread">> = {
  none: { shadowBlur: 0, shadowOpacity: 0, shadowSpread: 0 },
  soft: { shadowBlur: 45, shadowOpacity: 24, shadowSpread: -4 },
  medium: { shadowBlur: 80, shadowOpacity: 38, shadowSpread: 0 },
  strong: { shadowBlur: 120, shadowOpacity: 56, shadowSpread: 8 },
};

const cloneLayer = (layer: LayerState): LayerState => ({
  ...layer,
  mockup: { ...layer.mockup },
  transform: { ...layer.transform },
});

const createLayer = (id: LayerId): LayerState => ({
  id,
  isLocked: false,
  isVisible: true,
  name: `Layer ${id}`,
  mockup: createInitialMockup(),
  transform: createInitialTransform(),
});

interface EditorStore {
  activeLayerCount: LayerCount;
  activeLayerId: LayerId;
  layers: LayerState[];
  frame: FrameState;
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
  addLayer: () => void;
  setActiveLayerId: (layerId: LayerId) => void;
  toggleLayerLocked: (layerId: LayerId) => void;
  toggleLayerVisibility: (layerId: LayerId) => void;
  applyLayerLayout: (layerCount: LayerCount) => void;
  setActiveLayerTransform: (transform: Partial<LayerTransform>) => void;
  applyCameraPreset: (preset: CameraPreset) => void;
  setExportFormat: (format: ExportFormat) => void;
  setExportQuality: (quality: number) => void;
  setExportRenderEngine: (renderEngine: RenderEngine) => void;
  setExportStatus: (status: Partial<Pick<ExportState, "error" | "isExporting">>) => void;
  undo: () => void;
  redo: () => void;
}

const makeSnapshot = (state: Pick<EditorStore, "activeLayerCount" | "activeLayerId" | "layers" | "frame" | "ui" | "exportSettings">): EditorSnapshot => ({
  activeLayerCount: state.activeLayerCount,
  activeLayerId: state.activeLayerId,
  layers: state.layers.map(cloneLayer),
  frame: { ...state.frame },
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

const collectSnapshotObjectUrls = (snapshot: Pick<EditorSnapshot, "layers" | "frame">, urls = new Set<string>()) => {
  snapshot.layers.forEach((layer) => addObjectUrl(urls, layer.mockup.imageUrl));
  addObjectUrl(urls, snapshot.frame.backgroundImageUrl);
  addObjectUrl(urls, snapshot.frame.overlayUrl);
  snapshot.frame.backgroundImages.forEach((image) => addObjectUrl(urls, image.url));
  return urls;
};

const collectStoreObjectUrls = (state: Pick<EditorStore, "layers" | "frame" | "past" | "future">) => {
  const urls = collectSnapshotObjectUrls({ layers: state.layers, frame: state.frame });
  state.past.forEach((snapshot) => collectSnapshotObjectUrls(snapshot, urls));
  state.future.forEach((snapshot) => collectSnapshotObjectUrls(snapshot, urls));
  return urls;
};

const collectSnapshotsObjectUrls = (snapshots: EditorSnapshot[]) => {
  const urls = new Set<string>();
  snapshots.forEach((snapshot) => collectSnapshotObjectUrls(snapshot, urls));
  return urls;
};

const revokeUnreferencedObjectUrls = (candidates: Iterable<string>, state: Pick<EditorStore, "layers" | "frame" | "past" | "future">) => {
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

const replaceActiveLayer = (layers: LayerState[], activeLayerId: LayerId, update: (layer: LayerState) => LayerState) =>
  layers.map((layer) => (layer.id === activeLayerId ? update(layer) : cloneLayer(layer)));

const getFirstVisibleLayerId = (layers: LayerState[], activeLayerCount: LayerCount) => layers.find((layer) => layer.id <= activeLayerCount && layer.isVisible)?.id;

export const useEditorStore = create<EditorStore>((set, get) => {
  const withHistory = (next: Partial<Pick<EditorStore, "activeLayerCount" | "activeLayerId" | "layers" | "frame" | "ui" | "exportSettings">>) => {
    const state = get();
    const discardedFutureUrls = collectSnapshotsObjectUrls(state.future);
    set({
      ...next,
      past: [...state.past.slice(-39), makeSnapshot(state)],
      future: [],
    });
    revokeUnreferencedObjectUrls(discardedFutureUrls, get());
  };

  const updateActiveMockup = (mockup: Partial<MockupState>) => {
    const state = get();
    withHistory({
      layers: replaceActiveLayer(state.layers, state.activeLayerId, (layer) => ({
        ...layer,
        mockup: { ...layer.mockup, ...mockup },
        transform: { ...layer.transform },
      })),
    });
  };

  return {
    activeLayerCount: 1,
    activeLayerId: 1,
    layers: [createLayer(1), createLayer(2), createLayer(3)],
    frame: initialFrame,
    ui: initialUi,
    exportSettings: initialExport,
    past: [],
    future: [],
    setMockupImage: (url, name) => updateActiveMockup({ imageUrl: url, imageName: name, hideImage: false }),
    setMockupMode: (mode) => updateActiveMockup({ mode }),
    setMockupStyle: (style) => updateActiveMockup({ style }),
    setBorderRadius: (borderRadius) => updateActiveMockup({ borderRadius }),
    setBorderWidth: (borderWidth) => updateActiveMockup({ borderWidth }),
    setShadow: (shadow) => updateActiveMockup({ shadow, ...shadowPresets[shadow] }),
    setShadowBlur: (shadowBlur) => updateActiveMockup({ shadowBlur }),
    setShadowDirection: (shadowX, shadowY) => updateActiveMockup({ shadowX, shadowY }),
    setShadowOpacity: (shadowOpacity) => updateActiveMockup({ shadowOpacity }),
    setShadowSpread: (shadowSpread) => updateActiveMockup({ shadowSpread }),
    setGlassRefraction: (glassRefraction) => updateActiveMockup({ glassRefraction }),
    setGlassThickness: (glassThickness) => updateActiveMockup({ glassThickness }),
    setGlassSpecular: (glassSpecular) => updateActiveMockup({ glassSpecular }),
    setGlassBlur: (glassBlur) => updateActiveMockup({ glassBlur }),
    setGlassColor: (glassColor) => updateActiveMockup({ glassColor }),
    setGlassHighlightsEnabled: (glassHighlightsEnabled) => updateActiveMockup({ glassHighlightsEnabled }),
    setGlassLightColor: (glassLightColor) => updateActiveMockup({ glassLightColor }),
    setHideImage: (hideImage) => updateActiveMockup({ hideImage }),
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
    addLayer: () => {
      const state = get();
      if (state.activeLayerCount >= 3) return;

      const nextLayerCount = (state.activeLayerCount + 1) as LayerCount;
      withHistory({
        activeLayerCount: nextLayerCount,
        activeLayerId: nextLayerCount,
        layers: state.layers.map((layer) => (layer.id === nextLayerCount ? { ...cloneLayer(layer), isVisible: true } : cloneLayer(layer))),
      });
    },
    setActiveLayerId: (layerId) => {
      if (layerId > get().activeLayerCount) return;
      set({ activeLayerId: layerId });
    },
    toggleLayerLocked: (layerId) => {
      const state = get();
      withHistory({
        layers: state.layers.map((layer) => (layer.id === layerId ? { ...cloneLayer(layer), isLocked: !layer.isLocked } : cloneLayer(layer))),
      });
    },
    toggleLayerVisibility: (layerId) => {
      const state = get();
      const layers = state.layers.map((layer) => (layer.id === layerId ? { ...cloneLayer(layer), isVisible: !layer.isVisible } : cloneLayer(layer)));
      const hiddenActiveLayer = state.activeLayerId === layerId && !layers.find((layer) => layer.id === layerId)?.isVisible;
      const nextActiveLayerId = hiddenActiveLayer ? getFirstVisibleLayerId(layers, state.activeLayerCount) ?? state.activeLayerId : state.activeLayerId;

      withHistory({
        activeLayerId: nextActiveLayerId,
        layers,
      });
    },
    applyLayerLayout: (layerCount) => {
      const state = get();
      withHistory({
        activeLayerCount: layerCount,
        activeLayerId: state.activeLayerId > layerCount ? 1 : state.activeLayerId,
        layers: state.layers.map((layer) => ({
          ...cloneLayer(layer),
          transform: layer.isLocked ? { ...layer.transform } : { ...LAYER_LAYOUTS[layerCount][layer.id] },
        })),
      });
    },
    setActiveLayerTransform: (transform) => {
      const state = get();
      withHistory({
        layers: replaceActiveLayer(state.layers, state.activeLayerId, (layer) => ({
          ...layer,
          mockup: { ...layer.mockup },
          transform: layer.isLocked ? { ...layer.transform } : { ...layer.transform, ...transform },
        })),
      });
    },
    applyCameraPreset: (preset) => get().setActiveLayerTransform(CAMERA_PRESET_MAP[preset]),
    setExportFormat: (format) => withHistory({ exportSettings: { ...get().exportSettings, format, error: null } }),
    setExportQuality: (quality) => withHistory({ exportSettings: { ...get().exportSettings, quality } }),
    setExportRenderEngine: (renderEngine) => withHistory({ exportSettings: { ...get().exportSettings, renderEngine, error: null } }),
    setExportStatus: (status) => set({ exportSettings: { ...get().exportSettings, ...status } }),
    undo: () => {
      const state = get();
      const previous = state.past.at(-1);
      if (!previous) return;
      set({
        ...previous,
        layers: previous.layers.map(cloneLayer),
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
        layers: next.layers.map(cloneLayer),
        past: [...state.past, makeSnapshot(state)],
        future: state.future.slice(1),
      });
    },
  };
});
