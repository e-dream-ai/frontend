import styled from "styled-components";

export const StyledCheckbox = styled.input`
  cursor: pointer;
  margin: 0.5rem;
`;

export const CheckboxLabel = styled.span`
  color: ${(props) => props.theme.textSecondaryColor};
`;

export default StyledCheckbox;
