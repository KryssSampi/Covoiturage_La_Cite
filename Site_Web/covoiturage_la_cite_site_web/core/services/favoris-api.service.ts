import type { AffiniteModel } from '@/domain/models/AffiniteModel';
import type {
  AlerteTrajet,
  FavorisApiResponse,
  LieuFavori,
  UserSearchResult,
  UtilisateurFavori,
} from '@/features/favoris/types/favoris.types';
import { nowIso } from '@/core/utils/api-route.utils';
import { persistenceManager } from '@/tests/PersistenceManager';

interface LieuFavoriRecord {
  id: string;
  userId: string;
  pseudonyme: string;
  adresse: string;
  coordonnees: { lat: number; lng: number };
  iconTag: string;
  isAnchored?: boolean;
}

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

function normalizeIconTag(tag: string): LieuFavori['icon'] {
  const valid = ['campus', 'domicile', 'travail', 'autre'];
  return valid.includes(tag) ? (tag as LieuFavori['icon']) : 'autre';
}

function buildDemoAlertes(userId: string, lieux: LieuFavori[]): AlerteTrajet[] {
  if (lieux.length < 2) return [];

  const departure = lieux[0];
  const arrival = lieux[1];

  return [
    {
      id: `ALERT-${userId}-001`,
      lieuDepartId: departure.id,
      lieuArriveeId: arrival.id,
      lieuDepartLabel: departure.label,
      lieuArriveeLabel: arrival.label,
      joursActifs: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
      heureMin: '07:00',
      heureMax: '09:00',
      favorisUniquement: true,
      noteMinimale: 4,
      prixMax: 8,
      statut: 'actif',
      surveyIsOn: true,
    },
    {
      id: `ALERT-${userId}-002`,
      lieuDepartId: arrival.id,
      lieuArriveeId: departure.id,
      lieuDepartLabel: arrival.label,
      lieuArriveeLabel: departure.label,
      joursActifs: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
      heureMin: '16:00',
      heureMax: '18:30',
      favorisUniquement: false,
      noteMinimale: 3.5,
      statut: 'actif',
      surveyIsOn: true,
    },
  ];
}

export function buildFavorisResponse(userId: string): FavorisApiResponse {
  const allLieux = persistenceManager.readAll<LieuFavoriRecord>('lieux_favoris');
  const lieux: LieuFavori[] = allLieux
    .filter((lieu) => lieu.userId === userId)
    .sort((left, right) => (left.isAnchored && !right.isAnchored ? -1 : !left.isAnchored && right.isAnchored ? 1 : 0))
    .map((lieu) => ({
      id: lieu.id,
      label: lieu.pseudonyme,
      adresse: lieu.adresse,
      coordonnees: lieu.coordonnees,
      isPrincipal: !!lieu.isAnchored,
      icon: normalizeIconTag(lieu.iconTag),
      isAnchored: lieu.isAnchored,
    }));

  const allAffinites = persistenceManager.readAll<AffiniteModel>('affinites');
  const allUsers = persistenceManager.readAll<UserRecord>('users');
  const favoriteAffinities = allAffinites.filter(
    (affinite) => affinite.idPersonneQuiAMisEnFavoris === userId && affinite.isActuallyFavorite,
  );

  const utilisateursFavoris: UtilisateurFavori[] = favoriteAffinities.map((affinite) => {
    const target = allUsers.find((user) => user.id === affinite.idPersonneEnFavoris);
    const isDriver = target?.role?.toLowerCase() === 'driver';
    const note = isDriver
      ? target?.driverProfile?.averageRating ?? 0
      : target?.passengerProfile?.averageRating ?? 0;

    return {
      id: affinite.idPersonneEnFavoris,
      affiniteId: affinite.id,
      nomComplet: target ? `${target.firstName} ${target.lastName}` : 'Utilisateur',
      initiales: target?.initials ?? '?',
      role: isDriver ? 'conducteur' : 'passager',
      note,
      nbTrajetsEnsemble: affinite.totalTrajetsEnsemble,
      nbTrajetsEnsembleMois: 0,
      badges: target?.badgeIds ?? [],
      niveau: affinite.noteAffinite >= 5 ? 'Fidele' : affinite.noteAffinite >= 2 ? 'Actif' : 'Nouveau',
      estEnLigne: false,
      alerteActive: false,
      avatarGradient: isDriver
        ? 'linear-gradient(135deg, #34d399, #0d9488)'
        : 'linear-gradient(135deg, #60a5fa, #4f46e5)',
    };
  });

  const usersSearch: UserSearchResult[] = allUsers
    .filter((user) => user.id !== userId)
    .map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      note: String(user.driverProfile?.averageRating ?? user.passengerProfile?.averageRating ?? 0),
      badge: user.badgeIds?.[0] ?? '',
      initiales: user.initials,
      gradient: 'linear-gradient(135deg, #60a5fa, #4f46e5)',
    }));

  return {
    lieux,
    utilisateursFavoris,
    // Lire les alertes persistées si présentes, sinon générer les demo
    alertes: (persistenceManager.readAll<any>('alertes') || []).filter((a: any) => a.userId === userId).length > 0
      ? (persistenceManager.readAll<any>('alertes') || []).filter((a: any) => a.userId === userId)
      : buildDemoAlertes(userId, lieux),
    usersSearch,
  };
}

export function setUserFavori(userId: string, targetUserId: string): { affinite: AffiniteModel; created: boolean } {
  const all = persistenceManager.readAll<AffiniteModel>('affinites');
  const existing = all.find(
    (affinite) =>
      affinite.idPersonneQuiAMisEnFavoris === userId &&
      affinite.idPersonneEnFavoris === targetUserId,
  );

  if (existing) {
    const updated = persistenceManager.updateItem<AffiniteModel>('affinites', existing.id, {
      isActuallyFavorite: true,
      updatedAt: nowIso(),
    });

    return { affinite: updated ?? existing, created: false };
  }

  const now = nowIso();
  const affinite: AffiniteModel = {
    id: `AFF-${Date.now()}`,
    idPersonneQuiAMisEnFavoris: userId,
    idPersonneEnFavoris: targetUserId,
    isActuallyFavorite: true,
    noteAffinite: 0,
    totalTrajetsEnsemble: 0,
    dernierTrajetDate: '',
    createdAt: now,
    updatedAt: now,
  };

  persistenceManager.addItem('affinites', affinite);
  return { affinite, created: true };
}

export function unsetUserFavori(affiniteId: string): AffiniteModel | null {
  return persistenceManager.updateItem<AffiniteModel>('affinites', affiniteId, {
    isActuallyFavorite: false,
    updatedAt: nowIso(),
  });
}

export async function toggleAlerte(alerteId: string, surveyIsOn: boolean) {
  // Met à jour l'alerte persistée si elle existe, sinon crée une entrée minimale
  const all = persistenceManager.readAll<any>('alertes') ?? [];
  const idx = all.findIndex((a: any) => a.id === alerteId);
  const now = nowIso();

  if (idx >= 0) {
    const updated = { ...all[idx], surveyIsOn, statut: surveyIsOn ? 'actif' : 'desactive', updatedAt: now };
    persistenceManager.updateItem('alertes', alerteId, updated);
    return { success: true, alerteId, surveyIsOn, statut: updated.statut };
  }

  // Si aucune alerte existante, ajouter une alerte minimale pour l'utilisateur
  const newAlerte = {
    id: alerteId,
    userId: alerteId.split('-')[1] ?? 'unknown',
    lieuDepartId: '',
    lieuArriveeId: '',
    lieuDepartLabel: '',
    lieuArriveeLabel: '',
    joursActifs: ['Lun', 'Mar', 'Mer'],
    heureMin: '00:00',
    heureMax: '23:59',
    favorisUniquement: false,
    noteMinimale: 0,
    prixMax: 0,
    statut: surveyIsOn ? 'actif' : 'desactive',
    surveyIsOn,
    createdAt: now,
    updatedAt: now,
  };

  persistenceManager.addItem('alertes', newAlerte);
  return { success: true, alerteId: newAlerte.id, surveyIsOn, statut: newAlerte.statut };
}

export async function deleteAlerte(alerteId: string) {
  // Supprimer l'alerte persistée si elle existe
  const all = persistenceManager.readAll<any>('alertes') ?? [];
  const exists = all.some((a: any) => a.id === alerteId);
  if (exists) {
    persistenceManager.writeAll('alertes', all.filter((a: any) => a.id !== alerteId));
    return { success: true, alerteId };
  }

  return { success: false, alerteId, message: 'Alerte introuvable' };
}
