import styled from "styled-components";

export const StyledButton = styled.button`
  display: inline-flex;
  height: fit-content;
  align-items: center;
  font-size: 1.2rem;
  text-transform: uppercase;
  color: #fff;
  background-color: #ff5d20;
  padding: 6px 12px;
  margin-bottom: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
`;

export const ButtonBefore = styled.span`
  font-size: 2.2rem;
  margin-right: 5px;
`;

export const ButtonAfter = styled.span`
  font-size: 2.2rem;
  margin-left: 5px;
`;

export default StyledButton;
