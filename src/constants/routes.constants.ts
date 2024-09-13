export const ROUTES = {
  ROOT: "/",
  AUTHENTICATE: "/authenticate",
  LOGIN: "/login",
  SIGNUP: "/signup",
  CONFIRM_FORGOT_PASSWORD: "/confirm-forgot-password",
  CREATE: "/create",
  VIEW_DREAM: "/dream",
  MY_DREAMS: "/my-dreams",
  FEED: "/feed",
  PLAYLISTS: "/playlists",
  VIEW_PLAYLIST: "/playlist",
  PROFILE: "/profile",
  MY_PROFILE: "/my-profile",
  INVITES: "/invites",
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
  ADD_TO_PLAYLIST: "add-to-playlist",
};

export const FULL_CREATE_ROUTES = {
  DREAM: `${ROUTES.CREATE}/dream`,
  PLAYLIST: `${ROUTES.CREATE}/playlist`,
  ADD_TO_PLAYLIST: `${ROUTES.CREATE}/add-to-playlist`,
};
