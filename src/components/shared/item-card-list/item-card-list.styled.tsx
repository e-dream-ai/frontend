import styled from "styled-components";
import { DEVICES } from "@/constants/devices.constants";
import { DefaultTheme } from 'styled-components';

const DEFAULT_GRID_COLUMNS = 3;
// gap on px
const GAP = 10;

// calculates card width in base columns needed
const calculateCardWidth = (props: { grid?: boolean, columns?: number, theme?: DefaultTheme }) => {
  if (!props.grid) return '100%';

  const columnCount = props.columns || DEFAULT_GRID_COLUMNS;
  const gapAdjustment = GAP * (columnCount - 1);
  const columnWidth = 100 / columnCount;

  return `calc(${columnWidth}% - ${gapAdjustment / columnCount}px)`;
};


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
  gap: ${(props) => (props?.grid ? `${GAP}px` : "0")};

  li {
    width: ${calculateCardWidth};
    max-width: ${calculateCardWidth};
  }

  @media (max-width: ${DEVICES.TABLET}) {
    li {
      width: ${props => calculateCardWidth({ ...props, columns: 2 })}; 
      max-width: ${props => calculateCardWidth({ ...props, columns: 2 })}; 
    }
  }

  @media (max-width: ${DEVICES.MOBILE_S}) {
    li {
      width: ${props => calculateCardWidth({ ...props, columns: 1 })}; 
      max-width: ${props => calculateCardWidth({ ...props, columns: 1 })}; 
    }
  }
`;
