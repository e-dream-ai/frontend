import styled from "styled-components";
import { space, SpaceProps, typography, TypographyProps } from "styled-system";

export const Text = styled.span<TypographyProps & SpaceProps>`
  ${space}
  ${typography}
  color: ${(props) => props.theme.textPrimaryColor};
`;

export default Text;
