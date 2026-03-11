/* eslint-disable react-hooks/set-state-in-effect */
"use client";

/**
 * @file useHeader.ts
 * @description Hook principal du Header — contient 100% de la logique.
 *
 * Le composant Header ne consomme que le retour de ce hook,
 * sans aucun useState / useEffect / useRef propre.
 *
 * Responsabilités :
 * - Résolution du href dashboard dynamique (role + userId)
 * - Détection du lien actif selon le pathname
 * - Calcul des liens visibles dans la barre vs dans le burger
 * - Gestion des dropdowns (menu burger + avatar)
 * - Fermeture automatique au click-outside et au changement de route
 * - Détection du scroll pour l'ombre du header
 * - Toggle statut conducteur actif/inactif
 * - Action de déconnexion
 * - Bilingue FR/EN
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAppState, Language } from "@/core/state/app_state";
import { useLoader } from "@/core/context/loader.context";
import { useIsMobileOrTablet } from "../hooks/useismobileortable";

import {
  NavItem,
  NAV_ITEMS,
  MENU_ITEMS,
  AVATAR_MENU_ITEMS,
} from "../types/header.types";

// ─── Hook utilitaire interne ──────────────────────────────────────────────────

/**
 * Ferme un panneau quand l'utilisateur clique en dehors de son ref.
 * @param ref      Ref de l'élément conteneur
 * @param onClose  Callback appelé lors d'un click extérieur
 */
function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

// ─── Interface de retour ──────────────────────────────────────────────────────

export interface UseHeaderReturn {
  // ── Internationalisation ──────────────────────────────────────────────────
  isFR: boolean;

  // ── Rôle & utilisateur ────────────────────────────────────────────────────
  isDriver: boolean;
  avatarUrl: string;

  // ── Navigation ────────────────────────────────────────────────────────────
  /** Liens visibles dans la barre selon la taille d'écran */
  visibleNavItems: NavItem[];
  /** Liens visibles dans le menu burger selon la taille d'écran */
  burgerItems: NavItem[];
  /** Liens du dropdown avatar */
  avatarMenuItems: NavItem[];
  /** Résout `__dashboard__` → `/{role}/{userId}` */
  resolveHref: (href: string) => string;
  /** Indique si un href correspond à la route active */
  isActive: (href: string) => boolean;

  // ── État scroll ───────────────────────────────────────────────────────────
  /** true si la page a scrollé (déclenche l'ombre renforcée) */
  scrolled: boolean;  /** true après le premier montage client — évite le mismatch SSR/hydration sur les classes scroll */
  mounted: boolean;
  // ── Dropdown menu burger ──────────────────────────────────────────────────
  isMenuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  toggleMenu: () => void;

  // ── Dropdown avatar ───────────────────────────────────────────────────────
  isAvatarOpen: boolean;
  avatarRef: React.RefObject<HTMLDivElement | null>;
  toggleAvatar: () => void;

  // ── Toggle conducteur actif ───────────────────────────────────────────────
  isDriverActive: boolean;
  setIsDriverActive: (value: boolean) => void;

  // ── Actions ───────────────────────────────────────────────────────────────
  handleLogout: () => void;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useHeader(): UseHeaderReturn {
  const appState        = useAppState();
  const isMobile        = useIsMobileOrTablet();
  const { setActiveLoader } = useLoader();
  const router          = useRouter();
  const pathname        = usePathname();

  // ── Dérivés utilisateur ───────────────────────────────────────────────────
  const isFR       = appState.lang === Language.FR;
  const isDriver   = appState.userConnected?.role?.toString() === "driver";
  const avatarUrl  =  "https://static.vecteezy.com/system/resources/thumbnails/048/216/761/small/modern-male-avatar-with-black-hair-and-hoodie-illustration-free-png.png";

  // ── États ─────────────────────────────────────────────────────────────────
  const [isMenuOpen,     setIsMenuOpen]     = useState(false);
  const [isAvatarOpen,   setIsAvatarOpen]   = useState(false);
  const [isDriverActive, setIsDriverActive] = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  // Indique si le composant est monté côté client — évite le mismatch SSR/client sur la classe scroll
  const [mounted,        setMounted]        = useState(false);

  // ── Refs click-outside ────────────────────────────────────────────────────
  const menuRef   = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const closeMenu   = useCallback(() => setIsMenuOpen(false),   []);
  const closeAvatar = useCallback(() => setIsAvatarOpen(false), []);

  useClickOutside(menuRef,   closeMenu);
  useClickOutside(avatarRef, closeAvatar);

  // ── Scroll → ombre renforcée ──────────────────────────────────────────────
  useEffect(() => {
    // Marquer comme monté pour activer les classes dépendantes du scroll
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    // Vérifier la position initiale au cas où la page charge déjà scrollée
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Fermeture automatique au changement de route ──────────────────────────
  // Utilisation de useEffect pour synchroniser l'état lors du changement de route sans provoquer de rendus en cascade
    useEffect(() => {
        closeMenu();
        closeAvatar();
    }, [pathname, closeMenu, closeAvatar]);
  // ── Navigation ────────────────────────────────────────────────────────────
  const dashboardHref = `/${appState.userConnected?.role?.toString()}/${appState.userConnected?.id}`;

  const resolveHref = useCallback(
    (href: string) => (href === "__dashboard__" ? dashboardHref : href),
    [dashboardHref],
  );

  const isActive = useCallback(
    (href: string) => {
      const resolved = resolveHref(href);
      return pathname === resolved || pathname.startsWith(resolved + "/");
    },
    [pathname, resolveHref],
  );

  /**
   * Liens dans la barre principale :
   * - Mobile  → Accueil uniquement (index 0)
   * - Desktop → tous les NAV_ITEMS
   */
  const visibleNavItems = isMobile
    ? NAV_ITEMS.filter((_, i) => i === 0)
    : NAV_ITEMS;

  /**
   * Liens dans le burger :
   * - Mobile  → tout MENU_ITEMS (les liens de la barre sont aussi ici)
   * - Desktop → MENU_ITEMS privés des liens déjà visibles dans la barre
   */
  const burgerItems = isMobile
    ? MENU_ITEMS
    : MENU_ITEMS.filter(
        (item) => !NAV_ITEMS.find((n) => n.href === item.href && n.desktopOnly),
      );

  // ── Toggles ───────────────────────────────────────────────────────────────
  const toggleMenu   = useCallback(() => setIsMenuOpen((p) => !p),   []);
  const toggleAvatar = useCallback(() => setIsAvatarOpen((p) => !p), []);

  // ── Déconnexion ───────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    setActiveLoader(true);
    router.push("/login");
    appState.logout();
  }, [setActiveLoader, router, appState]);

  // ── Retour ────────────────────────────────────────────────────────────────
  return {
    isFR,
    isDriver,
    avatarUrl,
    visibleNavItems,
    burgerItems,
    avatarMenuItems: AVATAR_MENU_ITEMS,
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
  };
}