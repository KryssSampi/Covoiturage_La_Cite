import { useEffect, useState } from "react"
import axios from "axios"

export function useConfirmEmail(token: string | null) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token manquant.")
      return
    }

    const confirmEmail = async () => {
      try {
        await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/Auth/confirm-email`,
          { params: { token } }
        )

        setStatus("success")
        setMessage("Votre email a été confirmé avec succès 🎉")
      } catch (error: any) {
        setStatus("error")
        setMessage(
          error.response?.data?.message || "Token invalide ou expiré."
        )
      }
    }

    confirmEmail()
  }, [token])

  return { status, message }
}