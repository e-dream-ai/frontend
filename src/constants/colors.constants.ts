import { DefaultTheme } from "styled-components";

export const COLORS = {
  WHITE: "#fff",
  PRINCIPAL_WHITE: "#fcd9b7",
  BLACK: "#000",
  LIGHT_BLACK: "#111111",
  TRANSPARENT_BLACK: "rgba(0, 0, 0, 0.8)",
  GRAY_1: "#999",
  GRAY_2: "#555",
  GRAY_3: "#252525",
  GRAY_4: "#252525",
  GRAY_5: "#ccc",
  LIGHT_BLUE: "#009ba2",
  ORANGE: "#e4683a",
  DARK_ORANGE: "#ff5d20",
  LIGHT_ORANGE: "#ff7845",
};

export const PrimaryTheme: DefaultTheme = {
  colorPrimary: COLORS.ORANGE,
  colorLightPrimary: COLORS.LIGHT_ORANGE,
  colorDarkPrimary: COLORS.DARK_ORANGE,
  colorBackgroundPrimary: COLORS.BLACK,
  colorBackgroundSecondary: COLORS.GRAY_3,
  colorBackgroundTertiary: COLORS.TRANSPARENT_BLACK,
  colorBackgroundQuaternary: COLORS.LIGHT_BLACK,
  colorBackgroundModalHeader: COLORS.GRAY_4,
  colorDanger: COLORS.LIGHT_BLUE,
  textPrimaryColor: COLORS.PRINCIPAL_WHITE,
  textSecondaryColor: COLORS.GRAY_1,
  textTertiaryColor: COLORS.BLACK,
  inputTextColorPrimary: COLORS.GRAY_5,
  inputTextColorSecondary: COLORS.GRAY_2,
  inputBackgroundColor: COLORS.GRAY_4,
  inputBackgroundDisabledColor: COLORS.GRAY_2,
} as const;
