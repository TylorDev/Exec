import { BACKGROUNDS } from "@/data/backgrounds";
import { RESOLUTIONS } from "@/data/resolutions";
import type { FrameState } from "@/types/editor";

export function getSceneResolution(frame: FrameState) {
  if (frame.aspectRatio === "custom") {
    return {
      width: Math.max(320, frame.customWidth),
      height: Math.max(320, frame.customHeight),
    };
  }

  const preset = RESOLUTIONS.find((resolution) => resolution.id === frame.aspectRatio) ?? RESOLUTIONS[0];
  return { width: preset.width, height: preset.height };
}

export function getBackgroundCss(frame: FrameState) {
  if (frame.backgroundMode === "transparent") return "transparent";
  if (frame.backgroundMode === "solid") return frame.solidColor;
  if (frame.backgroundImageUrl) return `url("${frame.backgroundImageUrl}") center / cover no-repeat`;
  return BACKGROUNDS.find((background) => background.id === frame.selectedBackgroundId)?.css ?? BACKGROUNDS[0].css;
}
