"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Shield, CarFront, Settings } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Profil", href: "/dashboard/profile", icon: User },
    { name: "Sécurité", href: "/dashboard/profile?tab=security", icon: Shield },
    { name: "Mes trajets", href: "/dashboard/rides", icon: CarFront },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <aside className="hidden md:flex w-64 bg-white border-r shadow-sm flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-lacite">
          Dashboard
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition ${
                isActive
                  ? "bg-lacite text-white"
                  : "text-gray-700 hover:bg-lacite/10"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}