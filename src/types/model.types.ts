export type ModelProvider = "fal" | "runpod";

export interface ModelConstraints {
  durationsSec?: number[];
  imageSizes?: string[];
  supportsSteps?: boolean;
}

export interface ModelCatalogEntry {
  id: string;
  label: string;
  provider: ModelProvider;
  mediaType: "video" | "image";
  constraints: ModelConstraints;
}
