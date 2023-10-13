import styled from "styled-components";

export const Anchor = styled.a`
  color: ${(props) => props.theme.primary};
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
    color: ${(props) => props.theme.text1};
  }
`;

export default Anchor;
