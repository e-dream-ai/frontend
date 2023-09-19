import styled from "styled-components";

export const Anchor = styled.a`
  color: #ff5d20;
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
    color: #fff;
  }
`;
