import type { LoginInput, SignupInput, TokenResponse, User } from "../types";
import { api } from "./client";

export const authApi = {
  signup: (input: SignupInput) => api.post<User>("/auth/signup", input).then((r) => r.data),
  login: (input: LoginInput) => api.post<TokenResponse>("/auth/login", input).then((r) => r.data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get<User>("/auth/me").then((r) => r.data),
};
