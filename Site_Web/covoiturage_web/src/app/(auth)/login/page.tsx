"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loginSchema } from "@/lib/validation/auth.schema"
import { useAuth } from "@/lib/hooks/useAuth"
import { resendConfirmation } from "@/lib/services/auth.service" 

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("") 
  const [loading, setLoading] = useState(false)
  const [showResend, setShowResend] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    setSuccess("") //  reset
    setFieldErrors({})
    setShowResend(false)

    const result = loginSchema.safeParse(form)

    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors)
      return
    }

    try {
      setLoading(true)

      await login(form.email, form.password)

      router.push("/dashboard")

    } catch (err: any) {

      const message = err?.message || "Erreur serveur"

      setError(message)

      if (message.toLowerCase().includes("confirmer")) {
        setShowResend(true)
      }

    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      setError("")
      setSuccess("")

      const res = await resendConfirmation(form.email)

      setSuccess(res.message || "Email de confirmation renvoyé.")
      setShowResend(false)

    } catch (err: any) {

      setError(err?.message || "Erreur serveur")

      if(err?.code==="EMAIL_NOT_CONFIRMED"){

        setShowResend(true)
      }else { 
        setShowResend(false)
      }
    } 
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-10 w-full max-w-md">

        <h1 className="text-2xl font-bold text-center text-gray-800">
          Connexion
        </h1>

        <form onSubmit={submit} className="mt-6 space-y-4">

          <div>
             <label className="block text-sm font-medium mb-1">
          Courriel institutionnel
        </label>
            <input
              name="email"
              type="email"
              placeholder="Courriel"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-lacite"
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div>
             <label className="block text-sm font-medium mb-1">
          Mot de passe
        </label>
            <input
              name="password"
              type="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-lacite"
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-600 text-sm p-3 rounded-lg">
              {success}
            </div>
          )}

          {/*  Bouton renvoyer confirmation */}
          {showResend && (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-lacite underline mt-2"
            >
              Renvoyer l’email de confirmation
            </button>
          )}

          <button
            disabled={loading}
            className="
              w-full 
              bg-[var(--lacite)] 
              text-white 
              py-3 
              rounded-xl 
              font-semibold 
              hover:bg-[var(--lacite-dark)] 
              transition 
              disabled:opacity-50
            "
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-lacite font-semibold hover:underline"
          >
            S'inscrire
          </Link>
        </div>

      </div>
    </div>
  )
}