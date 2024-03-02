import styled from "styled-components";
import {
  space,
  SpaceProps,
  width,
  WidthProps,
  flexbox,
  FlexboxProps,
} from "styled-system";
import { AlignItemsProperty, JustifyContentProperty } from "@/types/css.types";

type RowProps = {
  separator?: boolean;
  justifyContent?: JustifyContentProperty;
  alignItems?: AlignItemsProperty;
} & SpaceProps &
  WidthProps &
  FlexboxProps;

export const Row = styled.div<RowProps>`
  border-bottom: ${(props) =>
    props.separator ? `1px solid ${props.theme.colorPrimary}` : "0"};
  flex: ${(props) => (props.flex ? props.flex : "initial")};
  display: flex;
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
  margin-bottom: 1rem;
  ${space}
  ${width}
  ${flexbox}
`;

export const Column = styled.div<RowProps>`
  flex: ${(props) => (props.flex ? props.flex : "initial")};
  display: flex;
  flex-flow: column;
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
  ${space}
  ${width}
`;

export default Row;
