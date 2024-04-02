import { IS_PRODUCTION, IS_STAGE } from "@/constants/env.constantes";

export const getReleaseStage = () => {
  if (IS_PRODUCTION) {
    return "production";
  }
  if (IS_STAGE) {
    return "development";
  }

  return "local";
};
