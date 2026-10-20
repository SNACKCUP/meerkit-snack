export type Role = "admin" | "user";

export interface User {
  id: number;
  email: string;
  name?: string | null;
  roles: Role[];
  is_active: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput extends LoginInput {
  name?: string;
}

export interface TokenResponse {
  access_token: string;
}
