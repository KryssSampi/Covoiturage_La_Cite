"use client";

import { FaX } from "react-icons/fa6";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useState } from "react";

import { Language, useAppState } from "@/core/state/app_state";
import { useIsMobileOrTablet } from "@/shared/hooks/useismobileortable";
import { FIXTURE_LIEUX_FAVORIS } from "@/shared/fixtures/favoris.fixtures";
import { getLieuFavoriIcon } from "@/shared/utils/lieu-favori-icon";
import type { LieuFavoriUnifie } from "@/shared/types/lieu-favori.types";

import { useFavorites } from "../../hooks/useFavorites";

export function FavoritesSection({
  favorites: initialFavorites = FIXTURE_LIEUX_FAVORIS,
  onDeleteFavorite,
}: {
  favorites?: LieuFavoriUnifie[];
  onDeleteFavorite?: (favorite: LieuFavoriUnifie) => void | Promise<void>;
}) {
  const appState = useAppState();
  const isBelowLg = useIsMobileOrTablet();
  const isFR = appState.lang === Language.FR;

  // Liste locale : initialisée avec les props du parent
  const [favorites, setFavorites] = useState<LieuFavoriUnifie[]>(initialFavorites);

  const {
    isDeleteModalOpen,
    favoriteSelectedForDelete,
    handleAutofill,
    handleDelete,
    openDeleteModal,
    closeDeleteModal,
    organizeFavorites,
  } = useFavorites();

  const onFavoriteDeleted = async (name: string) => {
    const favorite = favorites.find((f) => f.pseudonyme === name);
    if (favorite && onDeleteFavorite) {
      await onDeleteFavorite(favorite);
    }
    setFavorites((prev) => prev.filter((f) => f.pseudonyme !== name));
  };

  const campusFav = favorites.find((f) => f.isAnchored);
  const userFavorites = favorites.filter((f) => !f.isAnchored);

  const isDriverOrMobile =
    isBelowLg || appState.userConnected?.role === "driver";

  return (
    <>
      <section className="w-full border rounded-lg shadow-md bg-white flex flex-col overflow-hidden">
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

        <div className="flex justify-center items-center overflow-hidden">
          <div
            className={`px-6 py-4 flex gap-4 w-full ${
              isDriverOrMobile
                ? "flex-col overflow-y-auto max-h-80"
                : "flex-row overflow-x-auto custom-scrollbar pb-6 max-w-4xl"
            }`}
          >
            {campusFav && (
              <button
                className="flex-none h-16 flex items-center gap-4 px-6 bg-[#08316e] rounded-full shadow-sm hover:bg-[#06214e] hover:scale-[1.03] transition-all duration-300"
                onClick={() => handleAutofill(campusFav.adresse, campusFav.coordonnees)}
                title={campusFav.adresse}
              >
                {getLieuFavoriIcon(campusFav.iconTag, "text-3xl text-white")}
                <span className="text-white text-2xl font-medium whitespace-nowrap">
                  {isFR ? "College" : "College"}
                </span>
              </button>
            )}

            {organizeFavorites(userFavorites).map((favorite) => (
              <button
                key={favorite.id}
                className={`flex-none h-16 flex items-center gap-4 px-6 bg-[#08316e] rounded-full shadow-sm hover:bg-[#06214e] hover:scale-[1.03] transition-all duration-300 ${
                  isDriverOrMobile ? "w-full justify-between" : "w-fit"
                }`}
                onClick={() => handleAutofill(favorite.adresse, favorite.coordonnees)}
                title={favorite.adresse}
              >
                <div className="flex items-center gap-4">
                  {getLieuFavoriIcon(favorite.iconTag, "text-3xl text-white")}
                  <span className="text-white text-2xl font-medium whitespace-nowrap">
                    {favorite.pseudonyme}
                  </span>
                </div>

                <FaX
                  className="text-white text-3xl cursor-pointer hover:text-red-400 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(favorite.pseudonyme);
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="bg-[#08316e] h-1 w-full rounded-full" />
        </div>
      </section>

      {isDeleteModalOpen && favoriteSelectedForDelete && (
        <DeleteModal
          favoriteName={favoriteSelectedForDelete}
          onClose={closeDeleteModal}
          onConfirm={() =>
            handleDelete(favoriteSelectedForDelete, () => {
              void onFavoriteDeleted(favoriteSelectedForDelete);
            })
          }
        />
      )}
    </>
  );
}

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
              Etes-vous sur de vouloir supprimer{" "}
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
