/**
 * Composant ProfileHeader
 * En-tête avec menu avatar pour la page de configuration
 * Le bouton Profil redirige vers l'onglet profil
 * Le bouton Paramètres redirige vers l'onglet paramètres
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaChevronDown, FaUser, FaGear } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";

interface ProfileHeaderProps {
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  isOwnProfile: boolean;
}

const AVATAR_FALLBACK = "/assets/placeholder/placeholer-profile-picture.png";
const ICON_COLOR = "#08316e";

// ── Traductions ───────────────────────────────────────────────────────────────

const translations = {
  fr: {
    profile: "Profil",
    settings: "Paramètres",
  },
  en: {
    profile: "Profile",
    settings: "Settings",
  },
};

export function ProfileHeader({
  avatarUrl,
  firstName,
  lastName,
  isOwnProfile,
}: ProfileHeaderProps) {
  const router = useRouter();
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNavigate = (tab: "profile" | "settings") => {
    router.push(`/profile/settings?tab=${tab}`);
    setMenuOpen(false);
  };

  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="relative mb-8 h-40 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Image de fond décorative */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[url('/img/planifier-background.png')] bg-cover bg-center" />
      </div>

      {/* Avatar et nom */}
      <div className="relative flex items-end gap-4 px-6 pb-4">
        {/* Avatar */}
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${firstName} ${lastName}`}
              fill
              className="object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK;
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold" style={{ color: ICON_COLOR }}>
              {initials || "?"}
            </div>
          )}
        </div>

        {/* Nom et menu (uniquement pour son propre profil) */}
        {isOwnProfile && (
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">
                {firstName} {lastName}
              </h1>
            </div>

            {/* Menu avatar */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
              >
                <FaUser size={14} style={{ color: ICON_COLOR }} />
                <FaChevronDown
                  size={12}
                  className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  style={{ color: ICON_COLOR }}
                />
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5">
                  <button
                    onClick={() => handleNavigate("profile")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <FaUser size={14} style={{ color: ICON_COLOR }} />
                    <span>{t.profile}</span>
                  </button>
                  <button
                    onClick={() => handleNavigate("settings")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <FaGear size={14} style={{ color: ICON_COLOR }} />
                    <span>{t.settings}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
