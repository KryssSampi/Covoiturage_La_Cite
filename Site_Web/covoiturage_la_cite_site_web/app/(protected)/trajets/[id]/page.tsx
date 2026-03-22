import { PublishedTripView } from '@/features/trajets/components/published-trip';
import { MOCK_PUBLISHED_TRIP } from '@/features/trajets/fixtures/published-trip.fixtures';
import { ViewerRole, TripViewSource } from '@/features/trajets/types/published-trip.view.types';

/**
 * Route : /trajets/[id]
 *
 * Acces autorise :
 *   Passager           : bouton Reserver (module selon etat de reservation)
 *   Conducteur auteur  : bouton Gerer les demandes
 *   Admin              : lecture seule
 *
 * Paramètres URL optionnels :
 *   ?source=reservation|publishedtrip  — d'où vient la navigation
 *   &status=confirmed|pending|...      — statut de la carte source
 *
 * Header & Footer herités de app/(protected)/layout.tsx
 */

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string; status?: string }>;
}

export default async function TripViewPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { source: rawSource, status } = await searchParams;

  // TODO: fetch le trajet par id depuis la base de donnees
  // TODO: fetch la session -> viewerRole + existingReservation
  const trip = MOCK_PUBLISHED_TRIP; // remplacer par fetch({ id })
  void id; // sera utilise lors du vrai fetch

  const viewerRole: ViewerRole = 'passenger';
  const existingReservation = undefined;

  // Source de navigation validée
  const source: TripViewSource =
    rawSource === 'reservation' || rawSource === 'publishedtrip' ? rawSource : null;

  return (
    <PublishedTripView
      trip={trip}
      viewerRole={viewerRole}
      existingReservation={existingReservation}
      source={source}
      sourceStatus={status}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  await params;
  return {
    title: 'Détails du trajet — La Cité Covoiturage',
  };
}
