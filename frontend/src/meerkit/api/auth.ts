import type { EmailCodeInput, ForgotPasswordInput, LoginInput, ResetPasswordInput, SignupInput, TokenResponse, User, VerifyEmailCodeInput, VerifyEmailCodeResponse } from "../types";
import { api } from "./client";

export const authApi = {
  signup: (input: SignupInput) => api.post<User>("/auth/signup", input).then((r) => r.data),
  login: (input: LoginInput) => api.post<TokenResponse>("/auth/login", input).then((r) => r.data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get<User>("/users/me").then((r) => r.data),
  // 가입된 이메일인지 알려 주지 않도록, 서버는 항상 같은 응답을 준다.
  forgotPassword: (input: ForgotPasswordInput) => api.post("/auth/password/forgot", input),
  resetPassword: (input: ResetPasswordInput) => api.post("/auth/password/reset", input),
  // 이메일 인증번호 발송 / 확인. 확인에 성공하면 가입 요청에 붙일 증표(token)를 돌려준다.
  sendEmailCode: (input: EmailCodeInput) => api.post("/auth/email/send-code", input),
  verifyEmailCode: (input: VerifyEmailCodeInput) =>
    api.post<VerifyEmailCodeResponse>("/auth/email/verify-code", input).then((r) => r.data),
};
