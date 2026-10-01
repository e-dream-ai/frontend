export type PromptHistorySort = "recent" | "date" | "name";

export type PromptHistoryFilters = {
  search?: string;
  algorithm?: string;
  sort: PromptHistorySort;
  distinct: boolean;
};
