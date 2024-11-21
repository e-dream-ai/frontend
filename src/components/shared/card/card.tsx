import styled from "styled-components";

export const Card = styled.div`
  padding: 2rem;
  background-color: ${(props) => props.theme.colorBackgroundQuaternary};

  :hover {
    background-color: ${(props) => props.theme.colorBackgroundSecondary};
  }
`;
