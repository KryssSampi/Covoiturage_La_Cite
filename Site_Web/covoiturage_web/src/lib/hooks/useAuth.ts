
import { backend } from "../api/backend"
import { setAccessToken, clearAccessToken } from "../auth/token"
import { useAuthStore } from "@/store/useAuthStore"


export const useAuth = () => {
  const setUser = useAuthStore((s) => s.setUser)

  const login = async (email: string, password: string) => {
    try {
      const res = await backend.post("/api/Auth/login", { email, password })

      setAccessToken(res.data.accessToken)
      
      setUser(res.data.user)

    } catch (error: any) {
     // console.log("FULL ERROR:", error)
     const code=error?.response?.data.code
 const message =
    error?.response?.data?.message ||
    "Erreur Serveur"

  throw {code , message}
    }
  }

  const restoreSession = async () => {
    try {
      console.log("Restoring session...")

      const res = await backend.post("/api/Auth/refresh")
      setAccessToken(res.data.accessToken)

      console.log("REFRESH DATA:", res.data)
      setUser(res.data.user)
     // setUser({ email: "restored" }) // temporaire
    } catch (error: any){
       console.log("REFRESH FAILED:", error?.response?.status)
      clearAccessToken()
      setUser(null)
    }
  }

  const logout = async () => {
    try {
      await backend.post("/api/Auth/logout")
    } catch (e) {
      console.error(e)
    }

    clearAccessToken()
    setUser(null)
  }

  const logoutAll = async () => {
    try {
      await backend.post("/api/Auth/logout-all")
    } catch (e) {
      console.error(e)
    }

    clearAccessToken()
    setUser(null)
  }

  return { login, logout, logoutAll, restoreSession }
}