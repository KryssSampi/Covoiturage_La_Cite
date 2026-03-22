"use client";

/**
 * @file header.tsx
 * @description Composant Header — JSX pur, zéro logique.
 *
 * Toute la logique est dans useHeader.ts.
 * Ce fichier ne contient que :
 * - L'appel à useHeader()
 * - Le rendu JSX
 * - Les sous-composants purement visuels
 */

import Link from "next/link";
import Image from "next/image";
import { FaRegBell } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import { ToggleLangButton } from "@/shared/ui/buttons/togglelang";
import { MainLogo } from "../ui/logo/main_logo";
import CustomToggle from "@/shared/ui/toggles/simple_toggle";

import { useHeader } from "../hooks/useheader";
import { NavItem } from "../types/header.types";

// ─── Composant principal ─────────────────────────────────────────────────────

export function Header() {
  const {
    isFR,
    isDriver,
    avatarUrl,
    notifCount,
    visibleNavItems,
    burgerItems,
    avatarMenuItems,
    resolveHref,
    isActive,
    scrolled,
    mounted,
    isMenuOpen,
    menuRef,
    toggleMenu,
    isAvatarOpen,
    avatarRef,
    toggleAvatar,
    isDriverActive,
    setIsDriverActive,
    handleLogout,
    activePageTitle,
    isOngoingTrip,
  } = useHeader();

  return (
    // suppressHydrationWarning évite les faux positifs causés par les extensions navigateur (ex: MetaMask)
    <header
      suppressHydrationWarning
      className={`sticky top-0 z-50 w-full bg-blue-800 transition-shadow duration-300 ${
        mounted && scrolled ? "shadow-xl shadow-blue-950/50" : "shadow-md"
      }`}
    >
      <div className="flex items-center justify-between px-3 lg:px-6 h-14 lg:h-16">

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center shrink-0 scale-75 lg:scale-90 -ml-3 lg:ml-0">
          <MainLogo />
        </div>

        {/* ── Navigation centrale ──────────────────────────────────────────── */}
        <nav className="flex items-center gap-x-1 lg:gap-x-5 mx-2 lg:mx-6">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={resolveHref(item.href)}
              label={isFR ? item.labelFR : item.labelEN}
              active={isActive(item.href)}
            />
          ))}
            {/* Burger */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleMenu}
              aria-label={isFR ? "Ouvrir le menu" : "Open menu"}
              className="text-white p-1.5 rounded-md hover:bg-blue-700 transition-colors"
            >
              {isMenuOpen
                ? <FiX    className="text-2xl transition-transform duration-200 rotate-90" />
                : <FiMenu className="text-2xl transition-transform duration-200" />
              }
            </button>

            <Dropdown open={isMenuOpen} align="right" className="w-56">
              {/* Toggle conducteur dans le burger — mobile uniquement */}
              {isDriver && (
                <div className="flex lg:hidden items-center justify-between px-4 py-2 border-b border-gray-100">
                  <span className={`text-sm text-gray-700 ${isOngoingTrip ? 'opacity-50' : ''}`}>
                    {isFR ? "Mode actif" : "Active mode"}
                  </span>
                  <CustomToggle
                    bindValue={isOngoingTrip ? false : isDriverActive}
                    onToggle={isOngoingTrip ? () => {} : setIsDriverActive}
                    activeColor="bg-green-400"
                  />
                </div>
              )}
              {burgerItems.map((item) => (
                <DropdownLink
                  key={item.href}
                  href={item.href}
                  label={isFR ? item.labelFR : item.labelEN}
                />
              ))}
            </Dropdown>
          </div>

          {/* Titre de la page active — visible uniquement si absent de la barre de nav */}
          {activePageTitle && (
            <span className="relative text-sm lg:text-base font-semibold px-1 py-1 text-blue-200">
              {isFR ? activePageTitle.fr : activePageTitle.en}
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-300 rounded-full" />
            </span>
          )}
        </nav>

        {/* ── Actions droite ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-x-2 lg:gap-x-4 shrink-0">

          <ToggleLangButton />
          <Separator />
          <BellButton count={notifCount} />
          <Separator />

          {/* Avatar + dropdown profil */}
          <div className="relative" ref={avatarRef}>
            <AvatarButton
              isActive={isOngoingTrip ? false : (isDriver ? isDriverActive : true)}
              isOngoingTrip={isOngoingTrip}
              avatarUrl={avatarUrl}
              onClick={toggleAvatar}
            />
            <Dropdown open={isAvatarOpen} align="right" className="w-44">
              {avatarMenuItems.map((item) => (
                <DropdownLink
                  key={item.href}
                  href={item.href}
                  label={isFR ? item.labelFR : item.labelEN}
                />
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                {isFR ? "Se déconnecter" : "Log out"}
              </button>
            </Dropdown>
          </div>

          {/* Toggle conducteur actif — desktop uniquement */}
          {isDriver && (
            <div className="hidden lg:flex flex-col items-center text-white text-xs leading-tight gap-y-0.5">
              <span className={isOngoingTrip ? 'opacity-50' : ''}>{isFR ? "Actif" : "Active"}</span>
              <CustomToggle
                bindValue={isOngoingTrip ? false : isDriverActive}
                onToggle={isOngoingTrip ? () => {} : setIsDriverActive}
                activeColor="bg-green-400"
              />
            </div>
          )}
       

        </div>
      </div>
    </header>
  );
}

// ─── Sous-composants visuels ──────────────────────────────────────────────────

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative text-sm lg:text-base font-semibold px-1 py-1 transition-colors duration-200 group ${
        active ? "text-blue-200" : "text-white hover:text-blue-200"
      }`}
    >
      {label}
      <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-blue-300 rounded-full transition-transform duration-200 origin-left ${
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`} />
    </Link>
  );
}

function BellButton({ count }: { count: number }) {
  return (
    <Link href="/notifications" className="relative p-1 group" aria-label="Notifications">
      <FaRegBell className="text-white text-2xl lg:text-3xl group-hover:text-blue-200 transition-colors duration-200" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

const AVATAR_FALLBACK = "https://static.vecteezy.com/system/resources/thumbnails/048/216/761/small/modern-male-avatar-with-black-hair-and-hoodie-illustration-free-png.png";

function AvatarButton({ isActive, isOngoingTrip, avatarUrl, onClick }: { isActive: boolean; isOngoingTrip?: boolean; avatarUrl: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Menu profil"
      className="relative w-9 h-9 lg:w-11 lg:h-11 rounded-full ring-2 ring-blue-400 hover:ring-blue-200 transition-all duration-200"
    >
      {/* onError : repli sur l'avatar générique si l'URL de profil est invalide ou introuvable */}
      <Image
        src={avatarUrl || AVATAR_FALLBACK}
        alt="Avatar"
        fill
        className="rounded-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK; }}
      />
      {/* Indicateur de statut : sens interdit (rouge + barre) pendant un trajet, sinon cercle vert/gris */}
      {isOngoingTrip ? (
        <span className="absolute bottom-0 right-0 w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full border-2 border-blue-800 bg-red-500 flex items-center justify-center">
          <span className="block w-[60%] h-0.5 bg-white rounded-full" />
        </span>
      ) : (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full border-2 border-blue-800 transition-colors duration-300 ${
          isActive ? "bg-green-400" : "bg-gray-500"
        }`} />
      )}
    </button>
  );
}

function Dropdown({ open, align, className, children }: { open: boolean; align: "left" | "right"; className?: string; children: React.ReactNode }) {
  return (
    <div className={`absolute top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 transition-all duration-200 origin-top-right ${
      align === "right" ? "right-0" : "left-0"
    } ${className ?? ""} ${
      open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
    }`}>
      <div className="py-1 w-full">{children}</div>
    </div>
  );
}

function DropdownLink({ href, label }: Pick<NavItem, "href"> & { label: string }) {
  return (
    <Link href={href} className="block px-4 py-2 text-center text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150">
      {label}
    </Link>
  );
}

function Separator() {
  return <div className="w-px h-5 bg-blue-600 hidden lg:block" />;
}