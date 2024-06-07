import { useMemo } from "react";
import { useFeatures } from "../query/useFeatures";
import { FEATURES } from "@/constants/feature.constants";

const useSignupFeature = () => {
  const { data } = useFeatures();

  const signupFeature = useMemo(
    () =>
      data?.data?.features.find(
        (feature) => feature.name === FEATURES.SIGNUP_WITH_CODE,
      ),
    [data],
  );

  const isSignupFeatureActive = useMemo(
    () => (signupFeature ? signupFeature.isActive : false),
    [signupFeature],
  );

  return isSignupFeatureActive;
};

export default useSignupFeature;
