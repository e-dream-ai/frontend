import styled from "styled-components";
import { space, SpaceProps } from "styled-system";
import { AlignItemsProperty, JustifyContentProperty } from "types/css.types";

type RowProps = {
  separator?: boolean;
  flex?: string;
  justifyContent?: JustifyContentProperty;
  alignItems?: AlignItemsProperty;
} & SpaceProps;

export const Row = styled.div<RowProps>`
  ${space}
  border-bottom:  ${(props) =>
    props.separator ? `1px solid ${props.theme.colorPrimary}` : "0"};
  flex: ${(props) => (props.flex ? props.flex : "initial")};
  display: flex;
  flex-flow: row;
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
  margin-bottom: 1rem;
`;

export const Column = styled.div<RowProps>`
  ${space}
  flex: ${(props) => (props.flex ? props.flex : "initial")};
  display: flex;
  flex-flow: column;
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
`;

export default Row;
