const LEGACY_STORAGE_KEYS = ["studio-session", "flow-session"] as const;

export const clearLegacyStorage = (): void => {
  try {
    for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);
  } catch {
    return;
  }
};
