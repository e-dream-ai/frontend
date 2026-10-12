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

export const ALLOW_ATTRIBUTE = "data-edit-lock-allow";

export const ALLOW_SELECTOR = `a[href], [${ALLOW_ATTRIBUTE}]`;
