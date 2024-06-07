export enum HighlightKeys {
  NEW_INVITE = "newInvite",
}

export type HighlightValue = number | undefined;

export type HighlightState = Record<HighlightKeys, HighlightValue>;

export type HighlightContextType = {
  state: HighlightState;
  setHighlightValue: (key: HighlightKeys, value: HighlightValue) => void;
};

export type HighlightAction = {
  type: HighlightKeys;
  payload: HighlightValue;
};
