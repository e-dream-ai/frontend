import { FeatureType } from "@/types/feature.types";

export type UpdateFeatureRequestValues = {
  name: FeatureType;
  isActive: boolean;
};
