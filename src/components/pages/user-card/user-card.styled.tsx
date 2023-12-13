import styled from "styled-components";

export const StyledUserCard = styled.div`
  display: inline-flex;
  flex-flow: column;
  justify-content: space-between;
  width: fit-content;
  margin: 0;
  margin-bottom: 0.2rem;
  padding: 1rem;
  background-color: transparent;
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
