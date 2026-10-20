import { api } from "./client";
import type { TokenResponse, User } from "../types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput extends LoginInput {
  name: string;
}

export const authApi = {
  login: (body: LoginInput) => api.post<TokenResponse>("/auth/login", body).then((r) => r.data),
  signup: (body: SignupInput) => api.post<User>("/auth/signup", body).then((r) => r.data),
  logout: () => api.post("/auth/logout").then(() => undefined),
  me: () => api.get<User>("/auth/me").then((r) => r.data),
};
