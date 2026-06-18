export const LANDSCAPE_PREVIEW_BASE_WIDTH = 980;
export const PORTRAIT_PREVIEW_BASE_WIDTH = 560;

export function getCanonicalExportScale(width: number, height: number) {
  const baseWidth = height > width ? PORTRAIT_PREVIEW_BASE_WIDTH : LANDSCAPE_PREVIEW_BASE_WIDTH;
  return width / baseWidth;
}
