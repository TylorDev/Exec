import type { BackgroundCategory, BackgroundPreset } from "@/types/editor";

export const BACKGROUND_CATEGORIES: BackgroundCategory[] = [
  "Solid",
  "Gradient",
  "Glass",
  "Cosmic",
  "Mystic",
  "Desktop",
  "Abstract",
  "Earth",
  "Radiant",
  "Texture",
];

export const BACKGROUNDS: BackgroundPreset[] = [
  { id: "solid-ink", category: "Solid", label: "Ink", preview: "#11131b", css: "#11131b" },
  { id: "solid-paper", category: "Solid", label: "Paper", preview: "#eef2f7", css: "#eef2f7" },
  {
    id: "gradient-cold-glow",
    category: "Gradient",
    label: "Cold glow",
    preview: "linear-gradient(135deg, #0b1220, #29516f 55%, #74f0ca)",
    css: "linear-gradient(135deg, #0b1220, #29516f 55%, #74f0ca)",
  },
  {
    id: "glass-frost",
    category: "Glass",
    label: "Frost",
    preview: "linear-gradient(145deg, rgba(255,255,255,.58), rgba(143,208,255,.28))",
    css: "linear-gradient(145deg, rgba(255,255,255,.58), rgba(143,208,255,.28))",
  },
  {
    id: "cosmic-dusk",
    category: "Cosmic",
    label: "Dusk",
    preview: "radial-gradient(circle at 25% 20%, #5b5ff0, transparent 30%), #090a18",
    css: "radial-gradient(circle at 25% 20%, #5b5ff0, transparent 30%), radial-gradient(circle at 78% 70%, #ec6fb2, transparent 28%), #090a18",
  },
  {
    id: "mystic-veil",
    category: "Mystic",
    label: "Veil",
    preview: "linear-gradient(120deg, #18142b, #35524a, #dde483)",
    css: "linear-gradient(120deg, #18142b, #35524a, #dde483)",
  },
  {
    id: "desktop-slate",
    category: "Desktop",
    label: "Slate desk",
    preview: "linear-gradient(160deg, #242936, #11141b)",
    css: "linear-gradient(160deg, #242936, #11141b)",
  },
  {
    id: "abstract-fold",
    category: "Abstract",
    label: "Fold",
    preview: "conic-gradient(from 210deg, #70e4bf, #4674ff, #e5ebff, #70e4bf)",
    css: "conic-gradient(from 210deg at 50% 50%, #70e4bf, #4674ff, #e5ebff, #70e4bf)",
  },
  {
    id: "earth-moss",
    category: "Earth",
    label: "Moss",
    preview: "linear-gradient(135deg, #263829, #8ea467)",
    css: "linear-gradient(135deg, #263829, #8ea467)",
  },
  {
    id: "radiant-mint",
    category: "Radiant",
    label: "Mint flare",
    preview: "radial-gradient(circle, #dfffe8, #64d6bf 45%, #1b3550)",
    css: "radial-gradient(circle at center, #dfffe8, #64d6bf 45%, #1b3550)",
  },
  {
    id: "texture-grid",
    category: "Texture",
    label: "Grid",
    preview: "linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px), #121722",
    css: "linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), #121722",
  },
];
