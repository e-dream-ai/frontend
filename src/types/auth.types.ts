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
};

export type Role = {
  id: number;
  name: RoleType;
};

export type UserWithToken = User & { token?: Token };
