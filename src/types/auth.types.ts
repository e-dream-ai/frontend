export type Token = {
  AccessToken: string;
  ExpiresIn: number;
  IdToken: string;
  RefreshToken: string;
  TokenType: string;
};

export type User = {
  id: string;
  email: string;
  username: string;
  token?: Token;
};
