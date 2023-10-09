import { DEFAULT_THEME } from "constants/colors.constants";
import { ThemeProvider as TP } from "styled-components";

export const ThemeProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => <TP theme={DEFAULT_THEME}>{children}</TP>;

export default ThemeProvider;
