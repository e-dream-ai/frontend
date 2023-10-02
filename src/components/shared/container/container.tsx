import styled from "styled-components";

export const Container = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  padding: 1.875rem;
  margin-right: auto;
  margin-left: auto;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #fff;
    border-bottom: 2px solid #ce4d1b;
    padding-bottom: 1.25rem;
    margin: 0;
    margin-bottom: 1rem;
  }

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
