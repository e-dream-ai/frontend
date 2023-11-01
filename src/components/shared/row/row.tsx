import styled from "styled-components";
import { AlignItemsProperty, JustifyContentProperty } from "types/css.types";
import { SpacerType, spacer } from "../spacer/spacer";

type RowProps = {
  justifyContent?: JustifyContentProperty;
  alignItems?: AlignItemsProperty;
} & SpacerType;

export const Row = styled.div<RowProps>`
  display: flex;
  flex-flow: row;
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
  margin-bottom: 1rem;
`;

export const Column = styled.div<RowProps>`
  ${(props) => spacer(props)}
  display: flex;
  flex-flow: column;
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
`;

export default Row;
