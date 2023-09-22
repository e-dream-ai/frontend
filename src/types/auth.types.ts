export type User = {
  id: string;
  email: string;
  token: {
    AccessToken: string;
    ExpiresIn: number;
    IdToken: string;
    RefreshToken: string;
    TokenType: string;
  };
};
