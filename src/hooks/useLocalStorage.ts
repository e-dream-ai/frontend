import { useCallback, useState } from "react";

type UseLocalStorageReturn = {
  value: string | null;
  setItem: (value: string) => void;
  getItem: () => string | null;
  removeItem: () => void;
};

export const useLocalStorage: (key: string) => UseLocalStorageReturn = (
  key,
) => {
  const [value, setValue] = useState<string | null>(null);

  const setItem = useCallback(
    (value: string) => {
      localStorage.setItem(key, value);
      setValue(value);
    },
    [key],
  );

  const getItem = useCallback(() => {
    const value = localStorage.getItem(key);
    setValue(value);
    return value;
  }, [key]);

  const removeItem = useCallback(() => {
    localStorage.removeItem(key);
    setValue(null);
  }, [key]);

  return { value, setItem, getItem, removeItem };
};
