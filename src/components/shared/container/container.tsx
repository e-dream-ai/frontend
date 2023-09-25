import styled from "styled-components";

export const Container = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 2rem;
  margin-right: auto;
  margin-left: auto;

  @media (min-width: 768px) {
    width: 750px;
  }

  @media (min-width: 992px) {
    width: 970px;
  }

  form {
    width: auto;
    display: flex;
    flex-flow: column;
  }
`;

export default Container;
