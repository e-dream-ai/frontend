import { useModels, ModelsResponse } from "./useModels";
import { ModelConstraints } from "@/types/model.types";

type ConstraintsMap = ReadonlyMap<string, ModelConstraints>;

const EMPTY_CONSTRAINTS: ConstraintsMap = new Map();

const selectConstraints = (response: ModelsResponse): ConstraintsMap => {
  const constraints = new Map<string, ModelConstraints>();
  for (const model of response.data?.models ?? []) {
    constraints.set(model.id, model.constraints);
  }
  return constraints;
};

type HookParams = {
  mediaType?: "video" | "image";
};

export const useModelConstraints = ({
  mediaType,
}: HookParams = {}): ConstraintsMap => {
  const { data } = useModels({ mediaType, select: selectConstraints });
  return data ?? EMPTY_CONSTRAINTS;
};
