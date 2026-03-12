import { create } from "zustand"

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role?: string
  profileImageUrl?:string
}

interface AuthState {
  user: User | null
  isAuthReady: boolean
  setUser: (user: User | null) => void
  setAuthReady: (value: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthReady: false,

  setUser: (user) => set({ user }),
  setAuthReady: (value) => set({ isAuthReady: value }),
}))