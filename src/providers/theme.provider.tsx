import { PrimaryTheme } from "constants/colors.constants";
import { ThemeProvider as TP, createGlobalStyle } from "styled-components";

const Style = createGlobalStyle`
  * { box-sizing: border-box; }

  html, body, #root {
    background: #000;
    color: #555;
    margin: 0;
    font-family: "Lato", sans-serif;
    font-size: 16px;
  }

  a {
    color: ${(props) => props.theme.colorPrimary};
    text-decoration: none;
    cursor: pointer;
    -webkit-transition:
      color linear 0.4s,
      background-color linear 0.4s,
      border-color linear 0.4s;
    transition:
      color linear 0.4s,
      background-color linear 0.4s,
      border-color linear 0.4s;

    &:hover {
      color: ${(props) => props.theme.textPrimaryColor};
    }
  }
`;

export const ThemeProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => (
  <TP theme={PrimaryTheme}>
    <Style />
    {children}
  </TP>
);

export default ThemeProvider;
