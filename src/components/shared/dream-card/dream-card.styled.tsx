import styled from "styled-components";

export const StyledDreamCard = styled.li`
  display: flex;
  flex-flow: row;
  list-style: none;
  margin: 4rem 0;
  padding: 2rem;
  background-color: ${(props) => props.theme.background5};
  cursor: pointer;

  :hover {
    background-color: ${(props) => props.theme.background2};
  }
`;

export const DreamCardImage = styled.img`
  // 480p / 2
  width: 320px;
  height: 240px;
  object-fit: cover;
`;

export const DreamCardBody = styled.div`
  margin-left: 2rem;
  display: flex;
  flex-flow: column;
`;

export const ThumbnailPlaceholder = styled.div`
  width: 320px;
  height: 240px;
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;
