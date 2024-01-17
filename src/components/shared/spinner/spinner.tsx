import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColorProps, color } from "styled-system";
import styled from "styled-components";

const StyledSpinner = styled.span<ColorProps>`
  color: ${(props) => props.theme.textPrimaryColor};
  ${color}
`;

export const Spinner: React.FC<ColorProps> = (props) => (
  <StyledSpinner {...props}>
    <FontAwesomeIcon icon={faSpinner} spin />
  </StyledSpinner>
);
