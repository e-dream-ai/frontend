export type ModelProvider = "fal" | "runpod";

export interface ModelConstraints {
  durationsSec?: number[];
  imageSizes?: string[];
  supportsSteps?: boolean;
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
