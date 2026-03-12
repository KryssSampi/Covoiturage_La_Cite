// "use client"

// import { useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { useAuthStore } from "@/store/useAuthStore"
// import Header from "@/components/layout/header"  // 👈 ajoute ceci

// export default function ProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const router = useRouter()
//   const user = useAuthStore((s) => s.user)
//   const isAuthReady = useAuthStore((s) => s.isAuthReady)

//   useEffect(() => {
//     if (isAuthReady && !user) {
//       router.replace("/login")
//     }
//   }, [isAuthReady, user, router])

//   if (!isAuthReady) {
//     return <div className="p-10">Loading session...</div>
//   }

//   return (
//     <>
//       <Header />   {/* 🔥 ici */}
//       {children}
//     </>
//   )
// }

import Header from "@/components/layout/header"
import ProtectedWrapper from "./ProtectedWrapper"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <ProtectedWrapper>
        {children}
      </ProtectedWrapper>
    </>
  )
}