/**
 * GET /api/favoris?userId={id}
 *
 * Retourne toutes les données consolidées de la page Favoris :
 * lieux favoris, utilisateurs favoris (via affinités), alertes, stats, et
 * la liste de recherche d'utilisateurs pour l'overlay d'ajout.
 */
import { NextResponse } from "next/server";
import { persistenceManager } from "@/tests/PersistenceManager";
import type { AffiniteModel } from "@/domain/models/AffiniteModel";
import type {
  LieuFavori,
  UtilisateurFavori,
  AlerteTrajet,
  UserSearchResult,
  FavorisApiResponse,
} from "@/features/favoris/types/favoris.types";

// ─── Type brut stocké en JSON pour les lieux ────────────────────────────────
interface LieuFavoriRecord {
  id: string;
  userId: string;
  pseudonyme: string;
  adresse: string;
  coordonnees: { lat: number; lng: number };
  iconTag: string;
  isAnchored?: boolean;
  hasOffScreenButton?: boolean;
}

// ─── Type brut pour les utilisateurs ─────────────────────────────────────────
interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  role: string;
  badgeIds?: string[];
  driverProfile?: { averageRating?: number };
  passengerProfile?: { averageRating?: number };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Mappe un iconTag brut vers un LieuFavoriTag valide */
function normalizeIconTag(tag: string): LieuFavori["icon"] {
  const valid = ["campus", "domicile", "travail", "autre"];
  return valid.includes(tag) ? (tag as LieuFavori["icon"]) : "autre";
}

// ─── GET — Données consolidées ──────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    // Lieux favoris de l'utilisateur
    const allLieux = persistenceManager.readAll<LieuFavoriRecord>("lieux_favoris");
    const lieux: LieuFavori[] = allLieux
      .filter((l) => l.userId === userId)
      .sort((a, b) => (a.isAnchored && !b.isAnchored ? -1 : !a.isAnchored && b.isAnchored ? 1 : 0))
      .map((l) => ({
        id: l.id,
        label: l.pseudonyme,
        adresse: l.adresse,
        coordonnees: l.coordonnees,
        isPrincipal: !!l.isAnchored,
        icon: normalizeIconTag(l.iconTag),
        isAnchored: l.isAnchored,
      }));

    // Affinités : celles où l'utilisateur connecté a mis l'autre en favori
    const allAffinites = persistenceManager.readAll<AffiniteModel>("affinites");
    const allUsers = persistenceManager.readAll<UserRecord>("users");

    const mesFavoris = allAffinites.filter(
      (a) => a.idPersonneQuiAMisEnFavoris === userId && a.isActuallyFavorite,
    );

    const utilisateursFavoris: UtilisateurFavori[] = mesFavoris.map((aff) => {
      const target = allUsers.find((u) => u.id === aff.idPersonneEnFavoris);
      const isDriver = target?.role?.toLowerCase() === "driver";
      const rating = isDriver
        ? target?.driverProfile?.averageRating ?? 0
        : target?.passengerProfile?.averageRating ?? 0;

      return {
        id: aff.idPersonneEnFavoris,
        affiniteId: aff.id,
        nomComplet: target ? `${target.firstName} ${target.lastName}` : "Utilisateur",
        initiales: target?.initials ?? "?",
        role: isDriver ? "conducteur" : "passager",
        note: rating,
        nbTrajetsEnsemble: aff.totalTrajetsEnsemble,
        nbTrajetsEnsembleMois: 0,
        badges: target?.badgeIds ?? [],
        niveau: aff.noteAffinite >= 5 ? "Fidèle" : aff.noteAffinite >= 2 ? "Actif" : "Nouveau",
        estEnLigne: false,
        alerteActive: false,
        avatarGradient: isDriver
          ? "linear-gradient(135deg, #34d399, #0d9488)"
          : "linear-gradient(135deg, #60a5fa, #4f46e5)",
      };
    });

    // Alertes — données de démonstration (pas de table dédiée, on simule)
    const alertes: AlerteTrajet[] = buildDemoAlertes(userId, lieux);

    // Liste de recherche pour l'overlay d'ajout d'utilisateur
    const usersSearch: UserSearchResult[] = allUsers
      .filter((u) => u.id !== userId)
      .map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        role: u.role,
        note: String(u.driverProfile?.averageRating ?? u.passengerProfile?.averageRating ?? 0),
        badge: u.badgeIds?.[0] ?? "",
        initiales: u.initials,
        gradient: "linear-gradient(135deg, #60a5fa, #4f46e5)",
      }));

    const response: FavorisApiResponse = {
      lieux,
      utilisateursFavoris,
      alertes,
      usersSearch,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ─── Alertes de démonstration ────────────────────────────────────────────────

function buildDemoAlertes(userId: string, lieux: LieuFavori[]): AlerteTrajet[] {
  // Générer des alertes si l'utilisateur a au moins 2 lieux
  if (lieux.length < 2) return [];
  const dep = lieux[0];
  const arr = lieux[1];
  return [
    {
      id: `ALERT-${userId}-001`,
      lieuDepartId: dep.id,
      lieuArriveeId: arr.id,
      lieuDepartLabel: dep.label,
      lieuArriveeLabel: arr.label,
      joursActifs: ["Lun", "Mar", "Mer", "Jeu", "Ven"],
      heureMin: "07:00",
      heureMax: "09:00",
      favorisUniquement: true,
      noteMinimale: 4,
      prixMax: 8,
      statut: "actif",
      surveyIsOn: true,
    },
    {
      id: `ALERT-${userId}-002`,
      lieuDepartId: arr.id,
      lieuArriveeId: dep.id,
      lieuDepartLabel: arr.label,
      lieuArriveeLabel: dep.label,
      joursActifs: ["Lun", "Mar", "Mer", "Jeu", "Ven"],
      heureMin: "16:00",
      heureMax: "18:30",
      favorisUniquement: false,
      noteMinimale: 3.5,
      statut: "actif",
      surveyIsOn: true,
    },
  ];
}
