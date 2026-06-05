import styled from "styled-components";

export const VerifyingBlock = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
  color: ${(props) => props.theme.textSecondaryColor};

  span {
    font-size: 1rem;
  }
`;
