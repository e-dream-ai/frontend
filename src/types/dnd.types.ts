export type DragDropData = {
  type: "dream" | "playlist";
  dream?: string;
  playlist?: number;
};

export type ItemOrder = {
  id: number;
  order: number;
};

export type SetItemOrder = {
  id: number;
  currentIndex: number;
  newIndex: number;
};
