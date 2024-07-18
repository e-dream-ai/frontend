import React, { createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyledItemCardList } from "@/components/shared/item-card-list/item-card-list.styled";

// Create a Context
const ItemCardListContext = createContext({
  isDragging: false,
  setDragging: (value: boolean) => value,
});

export const ItemCardList: React.FC<{
  children: React.ReactNode;
  grid?: boolean;
  columns?: number;
}> = ({ grid, columns = 2, children }) => {
  const { t } = useTranslation();
  /**
   * this value determines if some child card item is dragging
   */
  const [isDragging, setIsDragging] = useState(false);
  const setDragging = (value: boolean) => {
    setIsDragging(value);
    return value;
  };

  const isChildrenEmpty = React.Children.count(children) === 0;

  return (
    <ItemCardListContext.Provider value={{ isDragging, setDragging }}>
      <StyledItemCardList grid={grid} columns={columns}>
        {isChildrenEmpty ? t("components.item_card_list.empty") : children}
      </StyledItemCardList>
    </ItemCardListContext.Provider>
  );
};

// Custom hook to use context
export function useItemCardListState() {
  return useContext(ItemCardListContext);
}
