/**
 * @file useFavorites.ts
 * @description Hook gérant la logique d'état des favoris du dashboard.
 * Extrait de favorites.section.tsx pour séparer logique et présentation.
 *
 * Responsabilités :
 * - Contrôle du modal de suppression (ouverture, fermeture, cible sélectionnée)
 * - Dispatch de l'événement d'autocomplétion vers SuperSearchSection
 * - Gestion du scroll du body quand le modal est ouvert
 * - Tri des favoris (Domicile > Travail > reste)
 *
 * @returns {UseFavoritesReturn} Handlers et état à brancher sur FavoritesSection
 */

import { useEffect, useState } from "react";
import type { LieuFavoriUnifie } from "@/shared/types/lieu-favori.types";

// ─── Types du hook ───────────────────────────────────────────────────────────

interface UseFavoritesReturn {
  /** Nom du favori actuellement sélectionné pour suppression */
  favoriteSelectedForDelete: string | null;
  /** true = modal de confirmation suppression ouvert */
  isDeleteModalOpen: boolean;
  /** Dispatch un événement CustomEvent vers SuperSearchSection pour remplir l'input arrivée */
  handleAutofill: (value: string, coordonnees?: { lat: number; lng: number }) => void;
  /** Confirme la suppression du favori sélectionné (appel API à brancher) */
  handleDelete: (favoriteName: string, onDeleted: (name: string) => void) => void;
  /** Ouvre le modal de confirmation et mémorise le favori ciblé */
  openDeleteModal: (favoriteName: string) => void;
  /** Ferme le modal sans supprimer */
  closeDeleteModal: () => void;
  /** Réorganise les favoris : Domicile en 1er, Travail en 2ème, puis le reste */
  organizeFavorites: (favorites: LieuFavoriUnifie[]) => LieuFavoriUnifie[];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useFavorites(): UseFavoritesReturn {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [favoriteSelectedForDelete, setFavoriteSelectedForDelete] = useState<string | null>(null);

  // Bloque le scroll de la page quand le modal est ouvert (UX standard portal)
  useEffect(() => {
    document.body.style.overflow = isDeleteModalOpen ? "hidden" : "auto";
    // Nettoyage au démontage pour éviter un body bloqué en cas d'unmount inattendu
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isDeleteModalOpen]);

  /**
   * Dispatch un événement CustomEvent capturé par SuperSearchSection
   * pour remplir automatiquement le champ d'arrivée avec l'adresse du favori.
   * Inclut les coordonnées pour pré-remplir l'arrivée GPS.
   */
  const handleAutofill = (value: string, coordonnees?: { lat: number; lng: number }) => {
    const event = new CustomEvent("gero-search-section-autofill", {
      detail: { value, coordonnees },
    });
    window.dispatchEvent(event);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * Supprime le favori de la liste locale et appelle le callback onDeleted.
   * TODO: Remplacer la mutation locale par un appel API :
   * DELETE /api/users/{userId}/favorites/{favoriteId}
   */
  const handleDelete = (favoriteName: string, onDeleted: (name: string) => void) => {
    onDeleted(favoriteName);
    setIsDeleteModalOpen(false);
  };

  /** Mémorise le favori ciblé et ouvre le modal de confirmation. */
  const openDeleteModal = (favoriteName: string) => {
    setFavoriteSelectedForDelete(favoriteName);
    setIsDeleteModalOpen(true);
  };

  /** Ferme le modal sans déclencher de suppression. */
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  /**
   * Trie les favoris pour toujours afficher Domicile puis Travail en premier.
   * Les autres favoris sont conservés dans leur ordre d'origine.
   */
  const organizeFavorites = (favorites: LieuFavoriUnifie[]): LieuFavoriUnifie[] => {
    const domicile = favorites.find((f) => f.iconTag === "domicile");
    const travail = favorites.find((f) => f.iconTag === "travail");
    const autres = favorites.filter(
      (f) => f.iconTag !== "domicile" && f.iconTag !== "travail"
    );
    return [domicile, travail, ...autres].filter((fav): fav is LieuFavoriUnifie => Boolean(fav));
  };

  return {
    favoriteSelectedForDelete,
    isDeleteModalOpen,
    handleAutofill,
    handleDelete,
    openDeleteModal,
    closeDeleteModal,
    organizeFavorites,
  };
}
