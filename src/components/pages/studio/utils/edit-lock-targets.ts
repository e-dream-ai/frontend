export const EDITABLE_SELECTOR = [
  "input",
  "select",
  "textarea",
  "[contenteditable='']",
  "[contenteditable='true']",
].join(", ");

export const INTERACTIVE_SELECTOR = [
  EDITABLE_SELECTOR,
  "button",
  "label",
  "summary",
  "[role='button']",
  "[role='checkbox']",
  "[role='switch']",
  "[role='slider']",
  "[role='menuitem']",
  "[role='option']",
  "[draggable='true']",
].join(", ");

export const LINK_SELECTOR = "a[href]";
