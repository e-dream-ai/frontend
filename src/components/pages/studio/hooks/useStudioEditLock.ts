import { createContext, useContext } from "react";

export type StudioEditLock = {
  locked: boolean;
  onBlocked?: () => void;
};

export const StudioEditLockContext = createContext<StudioEditLock>({
  locked: false,
});

export const useStudioEditLock = () => useContext(StudioEditLockContext);
