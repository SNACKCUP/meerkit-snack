import { create } from "zustand";

export type AuthDialogMode = "login" | "signup";

interface AuthDialogState {
  open: boolean;
  mode: AuthDialogMode;
  openDialog: (mode: AuthDialogMode) => void;
  setMode: (mode: AuthDialogMode) => void;
  close: () => void;
}

export const useAuthDialog = create<AuthDialogState>()((set) => ({
  open: false,
  mode: "login",
  openDialog: (mode) => set({ open: true, mode }),
  setMode: (mode) => set({ mode }),
  close: () => set({ open: false }),
}));
