"use client";

/**
 * @file favorites.section.tsx
 * @description Section "Mes Favoris" du dashboard — commune à tous les rôles.
 *
 * Affiche les lieux favoris de l'utilisateur sous forme de pills cliquables.
 * Un clic autofill le champ de départ de SuperSearchSection via un CustomEvent.
 * Le bouton "Collège La Cité" est toujours présent en premier (favori implicite non supprimable).
 *
 * @uses useFavorites — logique d'état (modal, tri, autofill)
 * @uses Favorite — type depuis dashboard/types
 */

import { FaBriefcase, FaCity, FaGraduationCap, FaHome } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useState } from "react";

import { Language, useAppState } from "@/core/state/app_state";
import { useIsMobileOrTablet } from "@/shared/hooks/useismobileortable";

import { useFavorites } from "../../hooks/useFavorites";
import { Favorite, COLLEGE_LACITE_ADDRESS } from "../../types/favorite.types";
import { FIXTURE_FAVORITES } from "@/tests/fixtures/dashboard/favorites.fixtures";

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * FavoritesSection
 *
 * @param favorites Liste des favoris de l'utilisateur.
 *   Par défaut : données de test (FIXTURE_FAVORITES).
 *   TODO: Brancher sur GET /api/users/{userId}/favorites
 */
export function FavoritesSection({
  favorites: initialFavorites = FIXTURE_FAVORITES,
}: {
  favorites?: Favorite[];
}) {
  const appState = useAppState();
  const isBelowLg = useIsMobileOrTablet();
  const isFR = appState.lang === Language.FR;

  // État local de la liste (gère la suppression côté client en attendant l'API)
  const [favorites, setFavorites] = useState<Favorite[]>(initialFavorites);

  const {
    isDeleteModalOpen,
    favoriteSelectedForDelete,
    handleAutofill,
    handleDelete,
    openDeleteModal,
    closeDeleteModal,
    organizeFavorites,
  } = useFavorites();

  // Callback passé à handleDelete : met à jour la liste locale après suppression
  const onFavoriteDeleted = (name: string) => {
    setFavorites((prev) => prev.filter((f) => f.name !== name));
  };

  const isDriverOrMobile =
    isBelowLg || appState.userConnected?.role === "driver";

  return (
    <>
      <section className="w-full border rounded-lg shadow-md bg-white flex flex-col overflow-hidden">
        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="p-6 pb-2 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-3xl text-black font-bold">
              {isFR ? "Mes Favoris" : "My Favorites"}
            </h2>
            <Link
              href={`/${appState.userConnected?.id}/favorites?q=modalOpen=true`}
              className="text-xl text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              {isFR ? "Ajouter +" : "New +"}
            </Link>
          </div>
          <div className="bg-[#08316e] h-1 w-full rounded-full" />
        </div>

        {/* ─── Liste des favoris ───────────────────────────────────────── */}
        <div className="flex justify-center items-center overflow-hidden">
          <div
            className={`px-6 py-4 flex gap-4 w-full ${
              isDriverOrMobile
                ? "flex-col overflow-y-auto max-h-80"
                : "flex-row overflow-x-auto custom-scrollbar pb-6 max-w-4xl"
            }`}
          >
            {/* Collège La Cité — toujours présent, non supprimable */}
            <button
              className="flex-none h-16 flex items-center gap-4 px-6 bg-[#08316e] rounded-full shadow-sm hover:bg-[#06214e] hover:scale-[1.03] transition-all duration-300"
              onClick={() => handleAutofill(COLLEGE_LACITE_ADDRESS)}
              title="801, promenade de l'Aviation, Ottawa..."
            >
              <FaGraduationCap className="text-3xl text-white" />
              <span className="text-white text-2xl font-medium whitespace-nowrap">
                {isFR ? "Collège" : "College"}
              </span>
            </button>

            {/* Favoris utilisateur triés (Domicile > Travail > autres) */}
            {organizeFavorites(favorites).map((favorite) => (
              <button
                key={favorite.id}
                className={`flex-none h-16 flex items-center gap-4 px-6 bg-[#08316e] rounded-full shadow-sm hover:bg-[#06214e] hover:scale-[1.03] transition-all duration-300 ${
                  isDriverOrMobile ? "w-full justify-between" : "w-fit"
                }`}
                onClick={() => handleAutofill(favorite.value)}
                title={favorite.value}
              >
                <div className="flex items-center gap-4">
                  <FavoriteIcon name={favorite.name} />
                  <span className="text-white text-2xl font-medium whitespace-nowrap">
                    {favorite.name}
                  </span>
                </div>

                {/* Bouton de suppression : stoppe la propagation pour ne pas déclencher l'autofill */}
                <FaX
                  className="text-white text-3xl cursor-pointer hover:text-red-400 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(favorite.name);
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ─── Footer ──────────────────────────────────────────────────── */}
        <div className="px-6 pb-4">
          <div className="bg-[#08316e] h-1 w-full rounded-full" />
        </div>
      </section>

      {/* ─── Modal de confirmation suppression (via Portal) ──────────── */}
      {isDeleteModalOpen && favoriteSelectedForDelete && (
        <DeleteModal
          favoriteName={favoriteSelectedForDelete}
          onClose={closeDeleteModal}
          onConfirm={() =>
            handleDelete(favoriteSelectedForDelete, onFavoriteDeleted)
          }
        />
      )}
    </>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────────────────

/**
 * Modal de confirmation suppression d'un favori.
 * Rendu via createPortal pour s'afficher au-dessus de tout le contenu.
 */
function DeleteModal({
  favoriteName,
  onClose,
  onConfirm,
}: {
  favoriteName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999">
      <div className="bg-white text-black p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">
          {isFR ? "Supprimer des Favoris" : "Delete Favorites"}
        </h2>
        <p className="mb-4 text-2xl">
          {isFR ? (
            <>
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-black">{favoriteName}</span> de vos favoris ?
            </>
          ) : (
            <>
              Are you sure you want to delete{" "}
              <span className="font-black">{favoriteName}</span> from your
              favorites?
            </>
          )}
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
            onClick={onClose}
          >
            {isFR ? "Annuler" : "Cancel"}
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            onClick={onConfirm}
          >
            {isFR ? "Supprimer" : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Icône correspondant au nom du favori.
 * "Domicile" → maison, "Travail" → mallette, autres → ville générique.
 */
function FavoriteIcon({ name }: { name: string }) {
  switch (name) {
    case "Domicile":
      return <FaHome className="text-4xl text-white" />;
    case "Travail":
      return <FaBriefcase className="text-4xl text-white" />;
    default:
      return <FaCity className="text-4xl text-white" />;
  }
}
