import styled from "styled-components";

const StyledSpinner = styled.i`
  color: ${(props) => props.theme.textPrimaryColor};
`;

export const Spinner: React.FC = () => (
  <StyledSpinner className="fa fa-spinner fa-spin" />
);
