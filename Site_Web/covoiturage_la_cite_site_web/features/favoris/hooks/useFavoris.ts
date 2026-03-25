/**
 * Hook de gestion de l'état UI de la page Favoris.
 * Ne fait AUCUN appel API ni DB — l'état UI pur (overlays, scroll) uniquement.
 */
"use client";

import { useState, useRef, useCallback } from "react";
import type { SectionFavoris } from "../types/favoris.types";

export function useFavoris() {
  // Overlays d'ajout
  const [overlayLieu, setOverlayLieu] = useState(false);
  const [overlayUser, setOverlayUser] = useState(false);

  // Refs de scroll pour les sections
  const lieuxRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);
  const alertesRef = useRef<HTMLDivElement>(null);

  /** Scroll vers une section donnée */
  const scrollTo = useCallback((section: SectionFavoris) => {
    const map: Record<SectionFavoris, React.RefObject<HTMLDivElement | null>> = {
      lieux: lieuxRef,
      utilisateurs: usersRef,
      alertes: alertesRef,
    };
    map[section]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return {
    overlayLieu,
    setOverlayLieu,
    overlayUser,
    setOverlayUser,
    lieuxRef,
    usersRef,
    alertesRef,
    scrollTo,
  };
}
