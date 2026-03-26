/**
 * trajet-en-cours.service.ts — Service métier pour la page « Trajet en cours »
 * Construit la réponse GET /api/trajet-en-cours/[id] :
 *   trip, driver, vehicle, passengers, reservations, mapFixture,
 *   moi (utilisateur courant), correspondants, conversations
 *
 * Aucune dépendance React — server-side uniquement.
 */

import { persistenceManager } from '@/tests/PersistenceManager';
import type { TripModel } from '@/core/models/TripModel';
import type { UserModel } from '@/core/models/UserModel';
import type { VehicleModel } from '@/core/models/VehicleModel';
import type { ReservationModel } from '@/core/models/ReservationModel';
import {
  toTrajetEnCoursData,
  tripToMapFixture,
} from '@/features/trajet-en-cours/converters/trajet-en-cours.converter';
import type { TrajetEnCoursData } from '@/features/trajet-en-cours/types/trajet-en-cours.types';
import type { Correspondant, MoiInfo, Conversation } from '@/features/trajet-en-cours/types/messagerie.types';
import { buildConversationId } from '@/features/trajet-en-cours/types/messagerie.types';
import type { TrajetMapFixture } from '@/features/trajet-en-cours/types/map.types';

// ── Couleurs d'avatar pour les correspondants
const AVATAR_COLORS = ['#e03050', '#0aad6a', '#c8960a', '#0098c8', '#9333ea'];

// ── Type de retour du service ──────────────────────────────────────────────

export interface TrajetEnCoursPayload {
  /** Données UI du trajet converties */
  trajetData: TrajetEnCoursData;
  /** Fixture carte pour le composant TrajetMap */
  mapFixture: TrajetMapFixture | null;
  /** Infos de l'utilisateur courant pour la messagerie */
  moi: MoiInfo;
  /** Liste de correspondants (interlocuteurs) */
  correspondants: Correspondant[];
  /** Conversations existantes (messages chargés depuis la DB) */
  conversations: Conversation[];
  /** Réservations liées au trajet */
  reservations: ReservationModel[];
  /** Conducteur brut */
  driver: UserModel;
  /** Passagers bruts */
  passengers: UserModel[];
  /** Véhicule */
  vehicle: VehicleModel;
}

/**
 * Construit le payload complet pour GET /api/trajet-en-cours/[id].
 * @param tripId  — identifiant du trajet
 * @param callerId — identifiant de l'utilisateur connecté (X-Caller-Id)
 * @returns null si le trajet ou les entités liées sont introuvables
 */
export function buildTrajetEnCours(
  tripId: string,
  callerId: string,
): TrajetEnCoursPayload | null {
  // ── Lecture des entités ──────────────────────────────────────────────────
  const trip = persistenceManager.readById<TripModel>('trips', tripId);
  if (!trip) return null;

  const allUsers = persistenceManager.readAll<UserModel>('users');
  const usersMap = new Map(allUsers.map((u) => [u.id, u]));

  const driver = usersMap.get(trip.driverId);
  if (!driver) return null;

  const vehicle = persistenceManager
    .readAll<VehicleModel>('vehicles')
    .find((v) => v.id === trip.vehicleId);
  if (!vehicle) return null;

  const passengers: UserModel[] = trip.passengerIds
    .map((pid) => usersMap.get(pid))
    .filter((u): u is UserModel => !!u);

  // ── Réservations liées au trajet ────────────────────────────────────────
  const reservations = persistenceManager
    .readAll<ReservationModel>('reservations')
    .filter((r) => r.tripId === tripId);

  // ── Rôle de l'utilisateur courant ───────────────────────────────────────
  const role: 'driver' | 'passenger' =
    callerId === trip.driverId ? 'driver' : 'passenger';

  // ── Conversion → données UI TrajetEnCoursData ───────────────────────────
  const trajetData = toTrajetEnCoursData(trip, role, driver, vehicle, passengers);

  // ── Fixture carte ───────────────────────────────────────────────────────
  const mapFixture = tripToMapFixture(trip);

  // ── Moi (utilisateur courant) ───────────────────────────────────────────
  const callerUser = usersMap.get(callerId);
  const moi: MoiInfo = {
    id: callerUser?.id ?? callerId,
    prenom: callerUser?.firstName ?? '',
    nom: callerUser?.lastName ?? '',
    initiales: callerUser?.initials ?? '',
    couleurAvatar: '#1a5cb0',
  };

  // ── Correspondants pour la messagerie ───────────────────────────────────
  let correspondants: Correspondant[];
  if (role === 'driver') {
    // Le conducteur voit tous les passagers
    correspondants = passengers.map((p, i) => ({
      id: p.id,
      prenom: p.firstName,
      nom: p.lastName,
      initiales: p.initials,
      couleurAvatar: AVATAR_COLORS[i % AVATAR_COLORS.length],
      role: 'passenger' as const,
      estEnLigne: false,
      photo: p.avatarUrl ?? undefined,
    }));
  } else {
    // Le passager ne voit que le conducteur
    correspondants = [{
      id: driver.id,
      prenom: driver.firstName,
      nom: driver.lastName,
      initiales: driver.initials,
      couleurAvatar: '#08316e',
      role: 'driver' as const,
      estEnLigne: false,
      photo: driver.avatarUrl ?? undefined,
    }];
  }

  // ── Conversations existantes ────────────────────────────────────────────
  // Chargement depuis la DB messages ; regroupement par ID de conversation
  const allMessages = persistenceManager.readAll<{
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    type: 'text' | 'system';
  }>('messages');

  // Filtrer les messages impliquant l'utilisateur courant dans ce trajet
  const participantIds = [trip.driverId, ...trip.passengerIds];
  const relevantMessages = allMessages.filter(
    (m) =>
      participantIds.includes(m.senderId) &&
      participantIds.includes(m.receiverId),
  );

  // Regrouper par conversationId
  const convMap = new Map<string, typeof relevantMessages>();
  for (const msg of relevantMessages) {
    const convId = msg.conversationId || buildConversationId(msg.senderId, msg.receiverId);
    const arr = convMap.get(convId) ?? [];
    arr.push(msg);
    convMap.set(convId, arr);
  }

  // Construire les objets Conversation
  const conversations: Conversation[] = [];
  for (const [convId, msgs] of convMap.entries()) {
    const sorted = msgs.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    conversations.push({
      id: convId,
      participantIds: [first.senderId, first.receiverId].sort() as [string, string],
      messages: sorted,
      createdAt: first.timestamp,
      updatedAt: last.timestamp,
    });
  }

  // S'assurer que chaque correspondant a au moins une conversation vide
  for (const corr of correspondants) {
    const convId = buildConversationId(moi.id, corr.id);
    if (!conversations.some((c) => c.id === convId)) {
      const now = new Date().toISOString();
      conversations.push({
        id: convId,
        participantIds: [moi.id, corr.id].sort() as [string, string],
        messages: [],
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return {
    trajetData,
    mapFixture,
    moi,
    correspondants,
    conversations,
    reservations,
    driver,
    passengers,
    vehicle,
  };
}
