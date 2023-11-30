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
};

export type UserWithToken = User & { token?: Token };
