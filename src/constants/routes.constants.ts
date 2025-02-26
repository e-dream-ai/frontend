export const ROUTES = {
  ROOT: "/",
  AUTHENTICATE: "/authenticate",
  SIGNIN: "/signin",
  MAGIC: "/magic",
  SIGNUP: "/account",
  CONFIRM_FORGOT_PASSWORD: "/confirm-forgot-password",
  CREATE: "/create",
  VIEW_DREAM: "/dream",
  MY_DREAMS: "/my-dreams",
  FEED: "/feed",
  PLAYLISTS: "/playlists",
  VIEW_PLAYLIST: "/playlist",
  VIEW_KEYFRAME: "/keyframe",
  PROFILE: "/profile",
  MY_PROFILE: "/my-profile",
  USER_FEED: "/feed",
  REMOTE_CONTROL: "/rc",
  INVITES: "/invites",
  REPORTS: "/reports",
  HELP: "/help",
  LEARN_MORE: "/learn-more",
  ABOUT: "/about",
  INSTALL: "/install",
  TERMS_OF_SERVICE: "/tos",
  PLAYGROUND: "/playground",
};

export const CREATE_ROUTES = {
  DREAM: "dream",
  PLAYLIST: "playlist",
  ADD_ITEM_TO_PLAYLIST: "add-item-to-playlist",
  ADD_KEYFRAME_TO_PLAYLIST: "add-keyframe-to-playlist",
};

export const FULL_CREATE_ROUTES = {
  DREAM: `${ROUTES.CREATE}/${CREATE_ROUTES.DREAM}`,
  PLAYLIST: `${ROUTES.CREATE}/${CREATE_ROUTES.PLAYLIST}`,
  ADD_ITEM_TO_PLAYLIST: `${ROUTES.CREATE}/${CREATE_ROUTES.ADD_ITEM_TO_PLAYLIST}`,
  ADD_KEYFRAME_TO_PLAYLIST: `${ROUTES.CREATE}/${CREATE_ROUTES.ADD_KEYFRAME_TO_PLAYLIST}`,
};
