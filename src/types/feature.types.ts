export type FeatureType = "SIGNUP_WITH_CODE";

export type Feature = {
  id: number;
  name: FeatureType;
  isActive: boolean;
  created_at: string;
  updated_at: string;
};
