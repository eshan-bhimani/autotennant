import { create } from "zustand";

type Role = "landlord" | "tenant";

interface AppState {
  activeRole: Role | null;
  setActiveRole: (role: Role) => void;
  isAuthenticated: () => boolean;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeRole:
    typeof window !== "undefined"
      ? (localStorage.getItem("activeRole") as Role | null)
      : null,

  setActiveRole: (role: Role) => {
    localStorage.setItem("activeRole", role);
    set({ activeRole: role });
  },

  isAuthenticated: () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("access_token");
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeRole");
    set({ activeRole: null });
    window.location.href = "/login";
  },
}));
