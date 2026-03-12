
"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAuthStore } from "@/store/useAuthStore"

export default function Header() {
  const { logout } = useAuth()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (!user) return null

console.log("USER HEADER:", user)
  const initials =
    user.firstName?.charAt(0) + user.lastName?.charAt(0)

  return (
    <header className="w-full flex justify-end items-center px-6 py-4 bg-white border-b shadow-sm relative">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 focus:outline-none"
        >
       {/*   <div className="w-10 h-10 rounded-full bg-lacite text-white flex items-center justify-center font-semibold">
            {initials?.toUpperCase()}
          </div>*/}

<div className="w-10 h-10 rounded-full overflow-hidden bg-lacite text-white flex items-center justify-center font-semibold">
 
  
  {user.profileImageUrl ? (

    <img
      src={`${process.env.NEXT_PUBLIC_API_URL}${user.profileImageUrl}`}
      /*alt="avatar"*/
      className="w-full h-full object-cover"
    />

  ) : (

    <span>
      {initials?.toUpperCase()}
    </span>

  )}

</div>

          <div className="text-left hidden sm:block">
            <p className="font-medium text-gray-800">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {user.role}
            </p>
          </div>
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-56 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <p className="font-medium text-gray-800">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {user.email}
              </p>
            </div>

            <button
              onClick={() => {
                router.push("/dashboard/profile")
                setOpen(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-lacite/10 text-sm"
            >
              Profil
            </button>

            <button
              className="w-full text-left px-4 py-2 hover:bg-lacite/10 text-sm"
            >
              Paramètres
            </button>

            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600"
            >
              Déconnecter
            </button>

            <button
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-700"
            >
              Déconnecter partout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}