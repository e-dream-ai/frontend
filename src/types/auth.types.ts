export type Token = {
  AccessToken: string;
  ExpiresIn: number;
  IdToken: string;
  RefreshToken: string;
  TokenType: string;
};

export type User = {
  id: number | string;
  email: string;
  name?: string;
  description?: string;
  token?: Token;
  cognitoId?: string;
};
