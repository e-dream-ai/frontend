import { StyledItemCardList } from "@/components/shared/item-card-list/item-card-list.styled";
import { createContext, useContext, useState } from "react";

// Create a Context
const ItemCardListContext = createContext({
  isDragging: false,
  setDragging: (value: boolean) => value,
});

export const ItemCardList: React.FC<{
  children: React.ReactNode;
  grid?: boolean;
  columns?: number;
}> = ({ grid, columns, children }) => {
  /**
   * this value determines if some child card item is dragging
   */
  const [isDragging, setIsDragging] = useState(false);
  const setDragging = (value: boolean) => {
    setIsDragging(value);
    return value;
  };

  return (
    <ItemCardListContext.Provider value={{ isDragging, setDragging }}>
      <StyledItemCardList grid={grid} columns={columns}>
        {children}
      </StyledItemCardList>
    </ItemCardListContext.Provider>
  );
};

// Custom hook to use context
export function useItemCardListState() {
  return useContext(ItemCardListContext);
}
