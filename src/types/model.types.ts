export type ModelProvider = "fal" | "runpod";

export interface GuidanceConstraint {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly default: number;
}

/** A named choice the provider takes from a fixed list, like Krea's creativity. */
export interface OptionConstraint {
  readonly options: readonly string[];
  readonly default: string;
}

export interface ModelConstraints {
  durationsSec?: number[];
  imageSizes?: string[];
  supportsSteps?: boolean;
  supportsNegativePrompt?: boolean;
  guidance?: GuidanceConstraint;
  creativity?: OptionConstraint;
}

export type ModelPricing =
  | { kind: "perMegapixel"; usdPerMegapixel: number }
  | { kind: "perSecond"; usdPerSecond: number; baseUsd?: number }
  | { kind: "perImage"; usdPerImage: number };

export interface ModelCatalogEntry {
  id: string;
  label: string;
  provider: ModelProvider;
  mediaType: "video" | "image";
  constraints: ModelConstraints;
  pricing?: ModelPricing;
}
