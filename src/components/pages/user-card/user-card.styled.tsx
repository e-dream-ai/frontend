import styled from "styled-components";

export const StyledUserCard = styled.li`
  display: inline-flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
  margin-bottom: 0.2rem;
  padding: 1rem;
  background-color: transparent;
  cursor: pointer;
  -webkit-transition:
    color linear 0.4s,
    background-color linear 0.4s,
    border-color linear 0.4s;
  transition:
    color linear 0.4s,
    background-color linear 0.4s,
    border-color linear 0.4s;
  :hover {
    background-color: ${(props) => props.theme.colorBackgroundSecondary};
  }
`;

export const StyledUserCardList = styled.ul`
  display: flex;
  flex-flow: column;
  margin: 0;
  padding: 0;
`;
