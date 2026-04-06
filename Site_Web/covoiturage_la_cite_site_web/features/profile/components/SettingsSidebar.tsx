/**
 * Composant SettingsSidebar
 * Sidebar de navigation pour la page Configuration
 * Affiche le résumé du profil, la bio, et les liens de navigation
 */

"use client";

import Image from "next/image";
import { FaUser, FaGear, FaRightFromBracket } from "react-icons/fa6";
import type { MeData, SettingsTab } from "../types/profile.types";

interface SettingsSidebarProps {
  user: MeData;
  activeTab: SettingsTab;
  onNavigate: (tab: SettingsTab) => void;
  onLogout: () => void;
}

const AVATAR_FALLBACK = "/assets/placeholder/placeholer-profile-picture.png";

function schoolRoleLabel(role: string): string {
  const map: Record<string, string> = {
    etudiant: "Étudiant",
    professeur: "Professeur",
    membredupersonnel: "Membre du personnel",
    administrateur: "Administrateur",
  };
  return map[role?.toLowerCase()] ?? role;
}

export function SettingsSidebar({
  user,
  activeTab,
  onNavigate,
  onLogout,
}: SettingsSidebarProps) {
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <aside className="w-full shrink-0 lg:w-72">
      {/* Carte résumé du profil */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Avatar et nom */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gray-200">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK;
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-blue-600">
                {initials || "?"}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-gray-500">
              {schoolRoleLabel(user.schoolRole)} à La Cité
            </p>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
              Ma Bio
            </p>
            <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">
              {user.bio}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mb-6 flex flex-col gap-1 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
        <button
          onClick={() => onNavigate("profile")}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
            activeTab === "profile"
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FaUser size={16} />
          Configuration du profil
        </button>
        <button
          onClick={() => onNavigate("settings")}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
            activeTab === "settings"
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FaGear size={16} />
          Paramètres
        </button>
      </nav>

      {/* Déconnexion */}
      <button
        onClick={onLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-95"
      >
        <FaRightFromBracket size={14} />
        Déconnexion
      </button>
    </aside>
  );
}
