import { ItemOrder } from "@/types/dnd.types";

export type OrderPlaylistFormValues = {
  uuid: string;
  values: {
    order: ItemOrder[];
  };
};
