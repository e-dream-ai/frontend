import { Dream } from "./dream.types";
import { Invite } from "./invite.types";
import { Playlist } from "./playlist.types";
import { RoleType } from "./role.types";

export type Token = {
  AccessToken: string;
  ExpiresIn: number;
  IdToken: string;
  RefreshToken: string;
  TokenType: string;
};

export type User = {
  id: number;
  email: string;
  name?: string;
  description?: string;
  avatar?: string;
  cognitoId?: string;
  role?: Role;
  currentDream?: Dream;
  currentPlaylist?: Playlist;
  nsfw?: boolean;
  enableMarketingEmails?: boolean;
  signupInvite?: Invite;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
};

export type Role = {
  id: number;
  name: RoleType;
};

export type UserWithToken = User & { token?: Token };
