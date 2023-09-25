import styled from "styled-components";

type RowProps = {
  justifyContent?: string;
};

export const Row = styled.div<RowProps>`
  display: flex;
  flex-flow: row;
  justify-content: ${(props) => props.justifyContent};
`;

export default Row;
