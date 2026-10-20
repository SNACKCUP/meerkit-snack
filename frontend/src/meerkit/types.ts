export type RoleCode = "USER" | "ADMIN";

export interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  roles: RoleCode[];
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
}
