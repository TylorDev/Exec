import type { LucideIcon } from "lucide-react";
import { Box, Droplets, Frame, Gem, Layers, PanelTop, Sparkles, Square } from "lucide-react";
import type { MockupStyle } from "@/types/editor";

export interface MockupStyleOption {
  description: string;
  icon: LucideIcon;
  id: MockupStyle;
  label: string;
}

export const MOCKUP_STYLES: MockupStyleOption[] = [
  { id: "thick-blur-frame", label: "Thick Blur", description: "Heavy frosted frame", icon: Frame },
  { id: "bevel", label: "Bevel", description: "Chamfered edge", icon: Gem },
  { id: "liquid-glass", label: "Liquid Glass", description: "Glossy translucent border", icon: Droplets },
  { id: "solid-border", label: "Solid Border", description: "Opaque crisp frame", icon: Square },
  { id: "stack", label: "Stack", description: "Layered cards", icon: Layers },
  { id: "outline", label: "Outline", description: "Thin empty border", icon: PanelTop },
  { id: "soft-glow", label: "Soft Glow", description: "Luminous edge", icon: Sparkles },
  { id: "minimal", label: "Minimal", description: "No decorative frame", icon: Box },
];
