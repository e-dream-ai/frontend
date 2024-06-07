import styled from "styled-components";

export const StyledList = styled.ul`
  display: flex;
  flex-flow: column;
  margin: 0;
  padding: 0;
`;

export const StyledLi = styled.li<{ isNew?: boolean }>`
  background-color: ${(props) =>
    props.isNew ? props.theme.colorLightPrimary : "transparent"};
  display: flex;
  flex: auto;
  flex-flow: row;
  align-items: center;
  list-style: none;
  padding: 1rem 0.4rem;
  transition: 1s background-color;
  &:hover {
    background: ${(props) => props.theme.inputBackgroundColor};
  }
`;
