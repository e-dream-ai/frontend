export type ModelProvider = "fal" | "runpod";

export interface ModelCatalogEntry {
  id: string;
  label: string;
  provider: ModelProvider;
  mediaType: "video" | "image";
}
