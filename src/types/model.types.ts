export type ModelProvider = "fal" | "runpod";

export interface GuidanceConstraint {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly default: number;
}

export interface ModelConstraints {
  durationsSec?: number[];
  imageSizes?: string[];
  supportsSteps?: boolean;
  supportsNegativePrompt?: boolean;
  guidance?: GuidanceConstraint;
}

export type ModelPricing =
  | { kind: "perMegapixel"; usdPerMegapixel: number }
  | { kind: "perSecond"; usdPerSecond: number; baseUsd?: number };

export interface ModelCatalogEntry {
  id: string;
  label: string;
  provider: ModelProvider;
  mediaType: "video" | "image";
  constraints: ModelConstraints;
  pricing?: ModelPricing;
}
