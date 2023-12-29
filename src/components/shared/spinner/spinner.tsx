import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";

const StyledSpinner = styled.span`
  color: ${(props) => props.theme.textPrimaryColor};
`;

export const Spinner: React.FC = () => (
  <StyledSpinner>
    <FontAwesomeIcon icon={faSpinner} spin />
  </StyledSpinner>
);
