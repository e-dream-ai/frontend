import styled from "styled-components";
import {
  space,
  SpaceProps,
  width,
  WidthProps,
  flexbox,
  FlexboxProps,
} from "styled-system";

type RowProps = {
  separator?: boolean;
} & SpaceProps &
  WidthProps &
  FlexboxProps;

export const Row = styled.div<RowProps>`
  display: flex;
  border-bottom: ${(props) =>
    props.separator ? `1px solid ${props.theme.colorPrimary}` : "0"};
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
  margin-bottom: 1rem;
  ${space}
  ${width}
  ${flexbox}
`;

export const Column = styled.div<RowProps>`
  display: flex;
  flex-flow: column;
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
  ${space}
  ${width}
  ${flexbox}
`;

export default Row;
