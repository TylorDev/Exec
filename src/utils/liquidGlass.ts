export interface LiquidGlassMapOptions {
  width: number;
  height: number;
  borderRadius: number;
  bezelWidth: number;
  glassRefraction: number;
  glassThickness: number;
  glassSpecular: number;
  glassColor: string;
  glassHighlightsEnabled: boolean;
  glassLightColor: string;
}

export interface LiquidGlassMaps {
  displacementMapUrl: string;
  specularMapUrl: string;
  scale: number;
  width: number;
  height: number;
}

interface Sample {
  magnitude: number;
  normalSlope: number;
}

const MAP_MAX_SIZE = 160;
const SAMPLE_COUNT = 127;
const AIR_REFRACTIVE_INDEX = 1;
const GLASS_REFRACTIVE_INDEX = 1.5;
const cache = new Map<string, LiquidGlassMaps>();

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const parseHexColor = (hexColor: string) => {
  const normalized = hexColor.replace("#", "").trim();
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return { red: 137, green: 247, blue: 220 };
  }

  return {
    red: Number.parseInt(value.slice(0, 2), 16),
    green: Number.parseInt(value.slice(2, 4), 16),
    blue: Number.parseInt(value.slice(4, 6), 16),
  };
};

const mixWithWhite = (color: ReturnType<typeof parseHexColor>, amount: number) => ({
  red: Math.round(color.red * amount + 255 * (1 - amount)),
  green: Math.round(color.green * amount + 255 * (1 - amount)),
  blue: Math.round(color.blue * amount + 255 * (1 - amount)),
});

const squircleHeight = (distanceRatio: number) => {
  const t = clamp(distanceRatio, 0, 1);
  return Math.pow(1 - Math.pow(1 - t, 4), 0.25);
};

const getSurfaceDerivative = (distanceRatio: number) => {
  const delta = 0.001;
  const left = squircleHeight(distanceRatio - delta);
  const right = squircleHeight(distanceRatio + delta);
  return (right - left) / (2 * delta);
};

const buildSamples = (glassThickness: number) => {
  const samples: Sample[] = [];
  let maximumDisplacement = 0;

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const distanceRatio = index / (SAMPLE_COUNT - 1);
    const derivative = getSurfaceDerivative(distanceRatio);
    const incidenceAngle = Math.atan(derivative);
    const refractedAngle = Math.asin(clamp((AIR_REFRACTIVE_INDEX / GLASS_REFRACTIVE_INDEX) * Math.sin(incidenceAngle), -1, 1));
    const bendAngle = incidenceAngle - refractedAngle;
    const magnitude = Math.abs(Math.tan(bendAngle) * glassThickness);

    samples.push({ magnitude, normalSlope: derivative });
    maximumDisplacement = Math.max(maximumDisplacement, magnitude);
  }

  return { samples, maximumDisplacement };
};

const getSample = (samples: Sample[], distanceRatio: number) => {
  const index = Math.round(clamp(distanceRatio, 0, 1) * (samples.length - 1));
  return samples[index];
};

const getRoundedRectField = (x: number, y: number, width: number, height: number, radius: number) => {
  const safeRadius = clamp(radius, 0, Math.min(width, height) / 2);
  const edgeDistance = Math.min(x, y, width - 1 - x, height - 1 - y);
  let normalX = x < width / 2 ? -1 : 1;
  let normalY = y < height / 2 ? -1 : 1;
  let distance = edgeDistance;

  const inLeft = x < safeRadius;
  const inRight = x > width - safeRadius;
  const inTop = y < safeRadius;
  const inBottom = y > height - safeRadius;

  if ((inLeft || inRight) && (inTop || inBottom) && safeRadius > 0) {
    const centerX = inLeft ? safeRadius : width - safeRadius;
    const centerY = inTop ? safeRadius : height - safeRadius;
    const dx = x - centerX;
    const dy = y - centerY;
    const length = Math.max(0.001, Math.hypot(dx, dy));

    distance = safeRadius - length;
    normalX = dx / length;
    normalY = dy / length;
  } else if (edgeDistance === x) {
    normalX = -1;
    normalY = 0;
  } else if (edgeDistance === width - 1 - x) {
    normalX = 1;
    normalY = 0;
  } else if (edgeDistance === y) {
    normalX = 0;
    normalY = -1;
  } else {
    normalX = 0;
    normalY = 1;
  }

  return { distance: Math.max(0, distance), normalX, normalY };
};

const makeCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const makeCacheKey = (options: LiquidGlassMapOptions, width: number, height: number) =>
  [
    width,
    height,
    Math.round(options.borderRadius),
    Math.round(options.bezelWidth),
    Math.round(options.glassRefraction),
    Math.round(options.glassThickness),
    Math.round(options.glassSpecular),
    options.glassColor.toLowerCase(),
    options.glassHighlightsEnabled ? "lights-on" : "lights-off",
    options.glassLightColor.toLowerCase(),
  ].join(":");

export function createLiquidGlassMaps(options: LiquidGlassMapOptions): LiquidGlassMaps {
  const aspectRatio = Math.max(0.1, options.width / Math.max(1, options.height));
  const mapWidth = Math.max(24, Math.round(aspectRatio >= 1 ? MAP_MAX_SIZE : MAP_MAX_SIZE * aspectRatio));
  const mapHeight = Math.max(24, Math.round(aspectRatio >= 1 ? MAP_MAX_SIZE / aspectRatio : MAP_MAX_SIZE));
  const cacheKey = makeCacheKey(options, mapWidth, mapHeight);
  const cached = cache.get(cacheKey);

  if (cached) return cached;

  const radiusScale = mapWidth / Math.max(1, options.width);
  const radius = options.borderRadius * radiusScale;
  const bezelWidth = Math.max(1, options.bezelWidth * radiusScale);
  const { samples, maximumDisplacement } = buildSamples(options.glassThickness);
  const displacementCanvas = makeCanvas(mapWidth, mapHeight);
  const specularCanvas = makeCanvas(mapWidth, mapHeight);
  const displacementContext = displacementCanvas.getContext("2d");
  const specularContext = specularCanvas.getContext("2d");

  if (!displacementContext || !specularContext) {
    throw new Error("Canvas 2D context is unavailable for liquid glass maps.");
  }

  const displacementImage = displacementContext.createImageData(mapWidth, mapHeight);
  const specularImage = specularContext.createImageData(mapWidth, mapHeight);
  const glassColor = mixWithWhite(parseHexColor(options.glassLightColor), 0.42);
  const specularAngle = (-60 * Math.PI) / 180;
  const lightX = Math.cos(specularAngle);
  const lightY = Math.sin(specularAngle);

  for (let y = 0; y < mapHeight; y += 1) {
    for (let x = 0; x < mapWidth; x += 1) {
      const index = (y * mapWidth + x) * 4;
      const field = getRoundedRectField(x, y, mapWidth, mapHeight, radius);
      const distanceRatio = clamp(field.distance / bezelWidth, 0, 1);
      const inBezel = field.distance <= bezelWidth;
      const sample = getSample(samples, distanceRatio);
      const magnitude = inBezel && maximumDisplacement > 0 ? sample.magnitude / maximumDisplacement : 0;
      const bend = magnitude * (options.glassRefraction / 100);
      const xVector = field.normalX * bend;
      const yVector = field.normalY * bend;

      displacementImage.data[index] = clamp(Math.round(128 + xVector * 127), 0, 255);
      displacementImage.data[index + 1] = clamp(Math.round(128 + yVector * 127), 0, 255);
      displacementImage.data[index + 2] = 128;
      displacementImage.data[index + 3] = 255;

      const lightAlignment = clamp(field.normalX * lightX + field.normalY * lightY, 0, 1);
      const rim = inBezel ? Math.pow(1 - distanceRatio, 0.45) : 0;
      const slope = clamp(sample.normalSlope / 6, 0, 1);
      const alpha = options.glassHighlightsEnabled
        ? Math.round(255 * (options.glassSpecular / 100) * rim * (0.2 + lightAlignment * 0.8) * (0.45 + slope * 0.55))
        : 0;

      specularImage.data[index] = glassColor.red;
      specularImage.data[index + 1] = glassColor.green;
      specularImage.data[index + 2] = glassColor.blue;
      specularImage.data[index + 3] = alpha;
    }
  }

  displacementContext.putImageData(displacementImage, 0, 0);
  specularContext.putImageData(specularImage, 0, 0);

  const maps = {
    displacementMapUrl: displacementCanvas.toDataURL("image/png"),
    specularMapUrl: specularCanvas.toDataURL("image/png"),
    scale: maximumDisplacement * (options.glassRefraction / 100),
    width: mapWidth,
    height: mapHeight,
  };

  cache.set(cacheKey, maps);
  return maps;
}
