// src/types/auth.ts
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
  }
  export interface DecodedToken {
    sub: string;
    email: string;
    exp: number;
    iat: number;
  }
  