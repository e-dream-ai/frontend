import { TFunction } from "i18next";
import { FeedItemType, UserFeedType } from "@/types/feed.types";

export const FEED_FILTERS: Record<Uppercase<FeedItemType>, FeedItemType> = {
  ALL: "all",
  DREAM: "dream",
  PLAYLIST: "playlist",
  STILLS: "stills",
  USER: "user",
  CREATOR: "creator",
  ADMIN: "admin",
};

export const FEED_FILTERS_NAMES = {
  ALL: "page.feed.all",
  DREAM: "page.feed.dream",
  PLAYLIST: "page.feed.playlist",
  STILLS: "page.feed.stills",
  USER: "page.feed.user",
  CREATOR: "page.feed.creator",
  ADMIN: "page.feed.admin",
};

export const USER_FEED_TYPES: Record<Uppercase<UserFeedType>, UserFeedType> = {
  ALL: "all",
  PLAYLIST: "playlist",
  DREAM: "dream",
  STILLS: "stills",
  UPVOTE: "upvote",
  DOWNVOTE: "downvote",
  HIDDEN: "hidden",
} as const;

export const USER_FEED_FILTERS_NAMES = {
  ALL: "page.feed.all",
  DREAM: "page.feed.dream",
  PLAYLIST: "page.feed.playlist",
  STILLS: "page.feed.stills",
  UPVOTE: "page.feed.upvote",
  DOWNVOTE: "page.feed.downvote",
  HIDDEN: "page.feed.hidden",
};

export const getFeedFilterData: (
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
      key: t(FEED_FILTERS_NAMES.STILLS),
      value: FEED_FILTERS.STILLS.toString(),
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

export const getUserFeedFilterData: (
  t: TFunction,
) => Array<{ key: string; value: string }> = (t) => {
  return [
    {
      key: t(USER_FEED_FILTERS_NAMES.ALL),
      value: USER_FEED_TYPES.ALL.toString(),
    },
    {
      key: t(USER_FEED_FILTERS_NAMES.DREAM),
      value: USER_FEED_TYPES.DREAM.toString(),
    },
    {
      key: t(USER_FEED_FILTERS_NAMES.PLAYLIST),
      value: USER_FEED_TYPES.PLAYLIST.toString(),
    },
    {
      key: t(USER_FEED_FILTERS_NAMES.STILLS),
      value: USER_FEED_TYPES.STILLS.toString(),
    },
    {
      key: t(USER_FEED_FILTERS_NAMES.UPVOTE),
      value: USER_FEED_TYPES.UPVOTE.toString(),
    },
    {
      key: t(USER_FEED_FILTERS_NAMES.DOWNVOTE),
      value: USER_FEED_TYPES.DOWNVOTE.toString(),
    },
    {
      key: t(USER_FEED_FILTERS_NAMES.HIDDEN),
      value: USER_FEED_TYPES.HIDDEN.toString(),
    },
  ];
};
