import styled from "styled-components";
import { AlignItemsProperty, JustifyContentProperty } from "types/css.types";
import { SpacerType, spacer } from "../spacer/spacer";

type RowProps = {
  separator?: boolean;
  flex?: string;
  justifyContent?: JustifyContentProperty;
  alignItems?: AlignItemsProperty;
} & SpacerType;

export const Row = styled.div<RowProps>`
  ${(props) => spacer(props)}
  border-bottom:  ${(props) =>
    props.separator ? `1px solid ${props.theme.primary}` : "0"};
  flex: ${(props) => (props.flex ? props.flex : "initial")};
  display: flex;
  flex-flow: row;
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
  margin-bottom: 1rem;
`;

export const Column = styled.div<RowProps>`
  ${(props) => spacer(props)}
  flex: ${(props) => (props.flex ? props.flex : "initial")};
  display: flex;
  flex-flow: column;
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
`;

export default Row;
