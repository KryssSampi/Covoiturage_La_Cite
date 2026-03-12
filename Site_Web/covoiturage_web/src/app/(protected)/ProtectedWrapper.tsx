"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"

export default function ProtectedWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isAuthReady = useAuthStore((s) => s.isAuthReady)

  useEffect(() => {
    if (isAuthReady && !user) {
      router.replace("/login")
    }
  }, [isAuthReady, user, router])

  if (!isAuthReady) {
    return <div className="p-10">Loading session...</div>
  }

  return <>{children}</>
}