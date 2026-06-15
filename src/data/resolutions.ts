import type { Resolution } from "@/types/editor";

export const RESOLUTIONS: Resolution[] = [
  { id: "16:9", label: "16:9", width: 1920, height: 1080 },
  { id: "4:3", label: "4:3", width: 1600, height: 1200 },
  { id: "1:1", label: "1:1", width: 1600, height: 1600 },
  { id: "9:16", label: "9:16", width: 1080, height: 1920 },
  { id: "21:9", label: "21:9", width: 2560, height: 1080 },
  { id: "custom", label: "Custom", width: 1600, height: 900 },
];
