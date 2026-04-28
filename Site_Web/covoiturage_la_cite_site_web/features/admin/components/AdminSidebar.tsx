"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiActivity,
  FiBarChart2,
  FiFileText,
  FiFlag,
  FiHome,
  FiLogOut,
  FiMessageSquare,
  FiSettings,
  FiShield,
  FiTruck,
  FiUpload,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import type { IconType } from "react-icons";

interface NavItem {
  href: string;
  icon: IconType;
  label: string;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", icon: FiHome, label: "Tableau de bord" },
  { href: "/admin/analytics", icon: FiBarChart2, label: "Analytics" },
  { href: "/admin/users", icon: FiUsers, label: "Utilisateurs" },
  { href: "/admin/drivers", icon: FiUser, label: "Conducteurs" },
  { href: "/admin/vehicles", icon: FiTruck, label: "Vehicules" },
  { href: "/admin/trips", icon: FiActivity, label: "Trajets / Simulation" },
  { href: "/admin/reports", icon: FiFlag, label: "Signalements" },
  { href: "/admin/moderations", icon: FiMessageSquare, label: "Moderation" },
  { href: "/admin/finance", icon: FiBarChart2, label: "Finances" },
  { href: "/admin/compliance", icon: FiShield, label: "PIPEDA" },
  { href: "/admin/logs", icon: FiFileText, label: "Logs d'audit" },
  { href: "/admin/exports", icon: FiUpload, label: "Exports" },
  { href: "/admin/settings", icon: FiSettings, label: "Parametres" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-[#0d1f3c] min-h-screen flex flex-col text-white">
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">A</div>
          <div>
            <p className="text-xs font-bold leading-tight">La Cite Admin</p>
            <p className="text-[10px] text-white/50 leading-tight">Panneau de controle</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                isActive ? "bg-blue-600/90 text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="text-base shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor ?? "bg-red-500 text-white"}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-white/10">
        <Link href="/" className="flex items-center gap-2 text-[11px] text-white/40 hover:text-white/70 transition-colors">
          <FiLogOut className="text-xs" />
          <span>Retour au site</span>
        </Link>
      </div>
    </aside>
  );
}
