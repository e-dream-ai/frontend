import styled from "styled-components";
import { JustifyContentProperty } from "types/css.types";

type RowProps = {
  justifyContent?: JustifyContentProperty;
};

export const Row = styled.div<RowProps>`
  display: flex;
  flex-flow: row;
  justify-content: ${(props) => props.justifyContent};
  margin-bottom: 1rem;
`;

export default Row;
