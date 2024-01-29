import { UseMutationResult } from "@tanstack/react-query";

export function useGlobalMutationLoading(...mutations: UseMutationResult[]) {
  return mutations.some((mutation) => mutation.isLoading);
}
