export type User = {
  id: string;
  email: string;
  username: string;
  token: {
    AccessToken: string;
    ExpiresIn: number;
    IdToken: string;
    RefreshToken: string;
    TokenType: string;
  };
};
