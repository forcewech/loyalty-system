export interface IToken {
  accessToken: string;
  expires: number;
  refreshToken: string;
}

export interface ITokenPayload {
  email: string;
  id: string;
  role: string;
}
