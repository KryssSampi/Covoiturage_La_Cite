/**
 * Hook pour les actions interactives du profil public
 * Gère: Like, Suivre/Favoris, S'abonner, Réserver
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface UseProfileActionsProps {
  targetUserId: string;
  isLiked: boolean;
  isFavorite: boolean;
  likeCount: number;
  onLikeChange: (liked: boolean, count: number) => void;
  onFavoriteChange: (favorite: boolean) => void;
}

export function useProfileActions({
  targetUserId,
  isLiked,
  isFavorite,
  likeCount,
  onLikeChange,
  onFavoriteChange,
}: UseProfileActionsProps) {
  const router = useRouter();
  const [likeLoading, setLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState<Record<string, boolean>>({});
  const likeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Action Like avec mise à jour optimiste et debounce
  const handleLike = useCallback(async () => {
    if (likeLoading) return;

    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

    // Mise à jour optimiste immédiate
    onLikeChange(nextLiked, nextCount);
    setLikeLoading(true);

    // Debounce pour éviter les clics multiples
    if (likeTimeoutRef.current) {
      clearTimeout(likeTimeoutRef.current);
    }

    likeTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/users/${targetUserId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liked: nextLiked }),
        });
      } catch (err) {
        console.error('[useProfileActions] handleLike', err);
        onLikeChange(isLiked, likeCount);
      } finally {
        setLikeLoading(false);
      }
    }, 300);
  }, [isLiked, likeCount, likeLoading, targetUserId, onLikeChange]);

  // Action Suivre / Ajouter aux favoris (mise à jour optimiste)
  const handleFavorite = useCallback(async () => {
    if (favoriteLoading) return;

    const nextFavorite = !isFavorite;

    // Mise à jour optimiste immédiate
    onFavoriteChange(nextFavorite);
    setFavoriteLoading(true);

    try {
      await fetch(`/api/favoris/user-favori`, {
        method: nextFavorite ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
    } catch (err) {
      console.error('[useProfileActions] handleFavorite', err);
      onFavoriteChange(isFavorite);
    } finally {
      setFavoriteLoading(false);
    }
  }, [isFavorite, targetUserId, onFavoriteChange, favoriteLoading]);

  // Action S'abonner à un trajet récurrent
  const handleSubscribe = useCallback(
    async (departure: string, arrival: string, driverName: string) => {
      const key = `${departure}-${arrival}`;
      setSubscribeLoading((prev) => ({ ...prev, [key]: true }));

      try {
        await fetch(`/api/users/${targetUserId}/survey-alert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driverId: targetUserId,
            driverName,
            departureLabel: departure,
            arrivalLabel: arrival,
          }),
        });
      } finally {
        setSubscribeLoading((prev) => ({ ...prev, [key]: false }));
      }
    },
    [targetUserId]
  );

  // Action Réserver - navigation vers la page du trajet
  const handleReserve = useCallback(
    (tripId: string) => {
      router.push(`/trajets/${tripId}?role=passenger`);
    },
    [router]
  );

  // Nettoyage du timeout au démontage
  useEffect(() => {
    return () => {
      if (likeTimeoutRef.current) {
        clearTimeout(likeTimeoutRef.current);
      }
    };
  }, []);

  return {
    handleLike,
    handleFavorite,
    handleSubscribe,
    handleReserve,
    likeLoading,
    favoriteLoading,
    subscribeLoading,
  };
}
