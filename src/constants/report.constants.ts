// database id related with "Potentially unlicensed (original source needed)" type
export const UNLICENSED_TYPE_ID = 4;

export const TYPES = [
  { id: 1, short: "Spam", type: "Spam content" },
  { id: 2, short: "Nsfw", type: "Not safe for work (NSFW)" },
  { id: 3, short: "Spam", type: "Contains visible title, watermark, or bug" },
  {
    id: 4,
    short: "Unlicensed",
    type: "Potentially unlicensed (original source needed)",
  },
  { id: 5, short: "Illegal", type: "Illegal or harassing material" },
  { id: 6, short: "Other", type: "Other content issue" },
];
