export type DragDropData = {
  type: "dream" | "playlist";
  dream?: string;
  playlist?: number;
};

export type OrderedItem = {
  id: number;
  order: number;
};
