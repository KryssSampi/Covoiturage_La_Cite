"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { register, RegisterDto } from "@/lib/services/auth.service"
import { registerSchema } from "@/lib/validation/auth.schema"

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState<RegisterDto>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  })

  const [confirmPassword, setConfirmPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    setSuccess("")
    setFieldErrors({})

    // 🔥 Validation Zod
    const result = registerSchema.safeParse({
      ...form,
      confirmPassword,
    })

    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors)
      return
    }

    try {
      setLoading(true)

     const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await response.json()
      setSuccess(data.message || "Compte créé avec succès")

      setTimeout(() => {
        router.push("/login?registered=true")
      }, 1500)

    } catch (err: any) {
      setError(err?.message || "Erreur serveur, veuillez réessayer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">

        <h1 className="text-2xl font-bold text-center text-gray-800">
          Créer un compte
        </h1>

        <form onSubmit={submit} className="mt-6 space-y-4">

          {/* First Name */}
          <div>
             <label className="block text-sm font-medium mb-1">
          Prénom
        </label>
            <input
              name="firstName"
              placeholder="Prénom"
              value={form.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-lacite"
            />
            {fieldErrors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.firstName[0]}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
             <label className="block text-sm font-medium mb-1">
          Nom
        </label>
            <input
              name="lastName"
              placeholder="Nom"
              value={form.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-lacite"
            />
            {fieldErrors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.lastName[0]}
              </p>
            )}
          </div>

          {/* Email */}
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

          {/* Phone */}
          <div>
             <label className="block text-sm font-medium mb-1">
          Téléphone
        </label>
            <input
              name="phone"
              placeholder="Téléphone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-lacite"
            />
            {fieldErrors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.phone[0]}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
             <label className="block text-sm font-medium mb-1">
          Mot de passe au moins 8 caractères,une lettre miniscule, une majuscule et un chiffre.
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

          {/* Confirm Password */}
          <div>
             <label className="block text-sm font-medium mb-1">
          Confirmer votre mot de passe
        </label>
            <input
              type="password"
              placeholder="Confirmer mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-lacite"
            />
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.confirmPassword[0]}
              </p>
            )}
          </div>

          {/* Global Error */}
          {error && (
            <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-100 text-green-600 text-sm p-3 rounded-lg">
              {success}
            </div>
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
            {loading ? "Création..." : "S'inscrire"}
          </button>

        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="text-lacite font-semibold hover:underline"
          >
            Se connecter
          </Link>
        </div>

      </div>
    </div>
  )
}