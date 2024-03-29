import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colorPrimary: string;
    colorLightPrimary: string;
    colorDarkPrimary: string;
    colorSecondary: string;
    colorBackgroundPrimary: string;
    colorBackgroundSecondary: string;
    colorBackgroundTertiary: string;
    colorBackgroundQuaternary: string;
    colorBackgroundModalHeader: string;
    textBodyColor: string;
    textPrimaryColor: string;
    textSecondaryColor: string;
    textTertiaryColor: string;
    colorDanger: string;
    inputTextColorPrimary: string;
    inputTextColorSecondary: string;
    inputBackgroundColor: string;
    inputBackgroundEnabledColor: string;
  }
}
