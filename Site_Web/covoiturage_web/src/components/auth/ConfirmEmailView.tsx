"use client"

import { useRouter } from "next/navigation"

interface Props {
  status: "loading" | "success" | "error"
  message: string
}

export default function ConfirmEmailView({ status, message }: Props) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--lacite-light)]">
      <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-md border-t-4 border-[var(--lacite)] text-center">

        {status === "loading" && (
          <p className="text-gray-600">Confirmation en cours...</p>
        )}

        {status === "success" && (
          <>
            <h2 className="text-green-600 text-xl font-semibold mb-4">
              Email confirmé
            </h2>
            <p className="mb-6">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="bg-[var(--lacite)] text-white px-6 py-3 rounded-lg hover:bg-[var(--lacite-dark)] transition"
            >
              Aller à la connexion
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-red-600 text-xl font-semibold mb-4">
              Erreur
            </h2>
            <p className="mb-6">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
            >
              Retour à la connexion
            </button>
          </>
        )}

      </div>
    </div>
  )
}