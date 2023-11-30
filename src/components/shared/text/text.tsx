import styled from "styled-components";
import {
  ColorProps,
  SpaceProps,
  TypographyProps,
  color,
  space,
  typography,
} from "styled-system";

export const Text = styled.span<TypographyProps & SpaceProps & ColorProps>`
  ${space}
  color: ${(props) => props.theme.textPrimaryColor};
  ${color}
  ${typography}
`;

export default Text;
