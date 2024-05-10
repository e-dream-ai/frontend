import styled from "styled-components";
import { DEVICES } from "@/constants/devices.constants";

const DEFAULT_GRID_COLUMNS = 3;

export const StyledItemCardList = styled.ul<{
  grid?: boolean;
  columns?: number;
}>`
  display: flex;
  flex-flow: ${(props) => (props.grid ? "wrap" : "column")};
  flex-wrap: wrap;
  flex: auto;
  list-style-type: none;
  padding: 0;
  margin: 0;
  gap: ${(props) => (props?.grid ? "10px" : "0")};

  li {
    width: ${(props) =>
      props?.grid
        ? `calc(1 / ${props.columns || DEFAULT_GRID_COLUMNS} * 100% - 20px / ${
            props.columns || DEFAULT_GRID_COLUMNS
          })`
        : "100%"};
    max-width: ${(props) =>
      props?.grid
        ? `calc(1 / ${props.columns || DEFAULT_GRID_COLUMNS} * 100% - 20px / ${
            props.columns || DEFAULT_GRID_COLUMNS
          })`
        : "100%"};
  }

  @media (max-width: ${DEVICES.TABLET}) {
    li {
      width: 100%;
      max-width: 100%;
    }
  }
`;
