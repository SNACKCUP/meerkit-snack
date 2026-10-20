import axios from "axios";

// 모든 기능은 이 인스턴스로 백엔드를 호출합니다.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
});
