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
import { Favorite } from "../types/favorite.types";

// ─── Types du hook ───────────────────────────────────────────────────────────

interface UseFavoritesReturn {
  /** Nom du favori actuellement sélectionné pour suppression */
  favoriteSelectedForDelete: string | null;
  /** true = modal de confirmation suppression ouvert */
  isDeleteModalOpen: boolean;
  /** Dispatch un événement CustomEvent vers SuperSearchSection pour remplir l'input départ */
  handleAutofill: (value: string) => void;
  /** Confirme la suppression du favori sélectionné (appel API à brancher) */
  handleDelete: (favoriteName: string, onDeleted: (name: string) => void) => void;
  /** Ouvre le modal de confirmation et mémorise le favori ciblé */
  openDeleteModal: (favoriteName: string) => void;
  /** Ferme le modal sans supprimer */
  closeDeleteModal: () => void;
  /** Réorganise les favoris : Domicile en 1er, Travail en 2ème, puis le reste */
  organizeFavorites: (favorites: Favorite[]) => Favorite[];
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
   * pour remplir automatiquement le champ de départ avec l'adresse du favori.
   */
  const handleAutofill = (value: string) => {
    const event = new CustomEvent("gero-search-section-autofill", { detail: value });
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
  const organizeFavorites = (favorites: Favorite[]): Favorite[] => {
    const domicile = favorites.find((f) => f.name === "Domicile");
    const travail = favorites.find((f) => f.name === "Travail");
    const autres = favorites.filter(
      (f) => f.name !== "Domicile" && f.name !== "Travail"
    );
    return [domicile, travail, ...autres].filter((fav): fav is Favorite => Boolean(fav));
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
