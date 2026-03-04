import React, { createContext, memo, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyledItemCardList } from "@/components/shared/item-card-list/item-card-list.styled";
import { HighlightPosition } from "@/types/item-card.types";

type DragPreview = {
  itemId: number;
  order: number;
  position: HighlightPosition;
};

// Create a Context
const ItemCardListContext = createContext({
  isDragging: false,
  setDragging: (value: boolean) => value,
  dragPreview: undefined as DragPreview | undefined,
  setDragPreview: (value: DragPreview | undefined) => value,
});

const ItemCardListComponent: React.FC<{
  children: React.ReactNode;
  grid?: boolean;
  columns?: number;
}> = ({ grid, columns = 2, children }) => {
  const { t } = useTranslation();
  /**
   * this value determines if some child card item is dragging
   */
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreviewState] = useState<DragPreview | undefined>(
    undefined,
  );

  const setDragging = (value: boolean) => {
    setIsDragging(value);
    return value;
  };

  const setDragPreview = (value: DragPreview | undefined) => {
    setDragPreviewState(value);
    return value;
  };

  const isChildrenEmpty = React.Children.count(children) === 0;

  return (
    <ItemCardListContext.Provider
      value={{ isDragging, setDragging, dragPreview, setDragPreview }}
    >
      <StyledItemCardList grid={grid} columns={columns}>
        {isChildrenEmpty ? t("components.item_card_list.empty") : children}
      </StyledItemCardList>
    </ItemCardListContext.Provider>
  );
};

export const ItemCardList = memo(ItemCardListComponent);

// Custom hook to use context
export function useItemCardListState() {
  return useContext(ItemCardListContext);
}
