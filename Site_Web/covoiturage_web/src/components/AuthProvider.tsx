"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAuthStore } from "@/store/useAuthStore"
import "@/lib/api/interceptors"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { restoreSession } = useAuth()
  const setAuthReady = useAuthStore((s) => s.setAuthReady)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      await restoreSession()
      setAuthReady(true)   // 🔥 TRÈS IMPORTANT
      setLoading(false)
    }

    init()
  }, [])

  if (loading) {
    return <div className="p-10">Loading session...</div>
  }

  return <>{children}</>
}