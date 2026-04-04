"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Language, useAppState } from "@/core/state/app_state";
import { useLoader } from "@/core/context/loader.context";

import { useIsMobileOrTablet } from "../hooks/useismobileortable";
import {
  buildAvatarMenuItems,
  buildExtraPageTitles,
  buildMenuItems,
  buildNavItems,
  type NavItem,
} from "../types/header.types";

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
  }, [onClose, ref]);
}

export interface UseHeaderReturn {
  isFR: boolean;
  isDriver: boolean;
  avatarUrl: string;
  notifCount: number;
  visibleNavItems: NavItem[];
  burgerItems: NavItem[];
  avatarMenuItems: NavItem[];
  resolveHref: (href: string) => string;
  isActive: (href: string) => boolean;
  scrolled: boolean;
  mounted: boolean;
  isMenuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  toggleMenu: () => void;
  isAvatarOpen: boolean;
  avatarRef: React.RefObject<HTMLDivElement | null>;
  toggleAvatar: () => void;
  isDriverActive: boolean;
  setIsDriverActive: (value: boolean) => void;
  handleLogout: () => void;
  activePageTitle: { fr: string; en: string } | null;
  isOngoingTrip: boolean;
}

const AVATAR_FALLBACK =
  "https://static.vecteezy.com/system/resources/thumbnails/048/216/761/small/modern-male-avatar-with-black-hair-and-hoodie-illustration-free-png.png";

export function useHeader(externalNotifCount?: number): UseHeaderReturn {
  const appState = useAppState();
  const isMobile = useIsMobileOrTablet();
  const { setActiveLoader } = useLoader();
  const router = useRouter();
  const pathname = usePathname();
  const role = appState.userConnected?.role ?? '';
  const id   = appState.userConnected?.id   ?? '';

  const navItems    = buildNavItems(role, id);
  const menuItems   = buildMenuItems(role, id);
  const avatarItems = buildAvatarMenuItems(role, id);
  const extraTitles = buildExtraPageTitles(role, id);

  const isFR = appState.lang === Language.FR;
  const isDriver = role.toLowerCase() === "driver";
  const avatarUrl =
    appState.userConnected?.avatarUrl ??
    AVATAR_FALLBACK;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isDriverActive, setIsDriverActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const closeAvatar = useCallback(() => setIsAvatarOpen(false), []);

  useClickOutside(menuRef, closeMenu);
  useClickOutside(avatarRef, closeAvatar);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (externalNotifCount !== undefined) {
      setNotifCount(externalNotifCount);
    }
  }, [externalNotifCount]);

  useEffect(() => {
    if (externalNotifCount !== undefined) return;
    if (!id) {
      setNotifCount(0);
      return;
    }

    let cancelled = false;

    fetch(`/api/notifications?userId=${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        return res.json();
      })
      .then((payload: Array<{ isRead?: boolean }>) => {
        if (cancelled || !Array.isArray(payload)) return;
        setNotifCount(payload.filter((notification) => !notification.isRead).length);
      })
      .catch(() => {
        if (!cancelled) setNotifCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [externalNotifCount, id]);

  useEffect(() => {
    closeMenu();
    closeAvatar();
  }, [pathname, closeAvatar, closeMenu]);

  const dashboardHref = `/${appState.userConnected?.role?.toString()}/${appState.userConnected?.id}`;

  const resolveHref = useCallback(
    (href: string) => (href === "__dashboard__" ? dashboardHref : href),
    [dashboardHref],
  );

  const isActive = useCallback(
    (href: string) => {
      const resolved = resolveHref(href);
      return pathname === resolved || pathname.startsWith(`${resolved}/`);
    },
    [pathname, resolveHref],
  );

  const visibleNavItems = isMobile ? navItems.filter((_, i) => i === 0) : navItems;

  const burgerItems = useMemo(() => {
    const roleFiltered = menuItems.filter((item) => {
      if (item.isDriverOnly && !isDriver) return false;
      if (item.isPassengerOnly && isDriver) return false;
      return true;
    });

    return isMobile
      ? roleFiltered
      : roleFiltered.filter(
          (item) => !navItems.find((navItem) => navItem.href === item.href && navItem.desktopOnly),
        );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDriver, isMobile, role, id]);

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const toggleAvatar = useCallback(() => setIsAvatarOpen((prev) => !prev), []);

  const handleLogout = useCallback(() => {
    setActiveLoader(true);
    // Call server logout which forwards the request to Server Core and clears cookie
    void (async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      } catch {
        // ignore
      }
      router.push('/login');
      appState.logout();
    })();
  }, [appState, router, setActiveLoader]);

  const activePageTitle = useMemo(() => {
    const allItems = [...navItems, ...menuItems, ...avatarItems, ...extraTitles];
    const active = allItems.find((item) => isActive(item.href));
    if (!active) return null;
    if (visibleNavItems.some((item) => item.href === active.href)) return null;
    return { fr: active.labelFR, en: active.labelEN };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, visibleNavItems, role, id]);

  const isOngoingTrip = pathname.startsWith("/trajet-en-cours");

  return {
    isFR,
    isDriver,
    avatarUrl,
    notifCount,
    visibleNavItems,
    burgerItems,
    avatarMenuItems: avatarItems,
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
  };
}
