import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import {
  HighlightAction,
  HighlightContextType,
  HighlightKeys,
  HighlightState,
  HighlightValue,
} from "@/constants/highlight.constants";

const initialState: HighlightState = {
  newInvite: undefined,
};

export const HighlightContext = createContext<HighlightContextType>({
  state: initialState,
  setHighlightValue: () => {},
} as HighlightContextType);

const reducer = (
  state: HighlightState,
  action: HighlightAction,
): HighlightState => {
  return { ...state, [action.type]: action.payload };
};

export const HighlightProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    (initialState) => initialState,
  );

  const setHighlightValue = useCallback(
    (key: HighlightKeys, value: HighlightValue) => {
      dispatch({ type: key, payload: value });
    },
    [],
  );

  const memoedValue = useMemo(
    () => ({
      state,
      setHighlightValue,
    }),
    [state, setHighlightValue],
  );

  useEffect(() => {
    if (state.newInvite) {
      const timer = setTimeout(() => {
        setHighlightValue(HighlightKeys.NEW_INVITE, undefined);
      }, 6000); // Highlight duration in milliseconds
      return () => clearTimeout(timer);
    }
  }, [setHighlightValue, state?.newInvite]);

  return (
    <HighlightContext.Provider value={memoedValue}>
      {children}
    </HighlightContext.Provider>
  );
};

export default HighlightContext;
