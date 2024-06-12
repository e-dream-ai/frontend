import { TFunction } from "i18next";
import { FeedItemServerType } from "@/types/feed.types";

export const FEED_FILTERS: { [key: string]: FeedItemServerType } = {
  ALL: "all",
  DREAM: "dream",
  PLAYLIST: "playlist",
  USER: "user",
  CREATOR: "creator",
  ADMIN: "admin",
};

export const FEED_FILTERS_NAMES = {
  ALL: "page.feed.all",
  DREAM: "page.feed.dream",
  PLAYLIST: "page.feed.playlist",
  USER: "page.feed.user",
  CREATOR: "page.feed.creator",
  ADMIN: "page.feed.admin",
};

export const getFilterData: (
  t: TFunction,
  isAdmin: boolean,
) => Array<{ key: string; value: string }> = (t, isAdmin) => {
  const defaultArray = [
    { key: t(FEED_FILTERS_NAMES.ALL), value: FEED_FILTERS.ALL.toString() },
    { key: t(FEED_FILTERS_NAMES.DREAM), value: FEED_FILTERS.DREAM.toString() },
    {
      key: t(FEED_FILTERS_NAMES.PLAYLIST),
      value: FEED_FILTERS.PLAYLIST.toString(),
    },
    {
      key: t(FEED_FILTERS_NAMES.CREATOR),
      value: FEED_FILTERS.CREATOR.toString(),
    },
  ];
  const adminArray = [
    { key: t(FEED_FILTERS_NAMES.USER), value: FEED_FILTERS.USER.toString() },
    { key: t(FEED_FILTERS_NAMES.ADMIN), value: FEED_FILTERS.ADMIN.toString() },
  ];

  if (isAdmin) {
    defaultArray.push(...adminArray);
  }

  return defaultArray;
};
