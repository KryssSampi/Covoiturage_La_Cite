import { CreateTripForm } from '@/features/trajets';
import { TripWayPrefill } from '@/features/trajets/types';

/**
 * Route : /driver/create-trip/[id]
 * [id] = ID de l'utilisateur conducteur (meme pattern que /driver/[id])
 *
 * SearchParams optionnels (pre-remplissage depuis un circuit TripWay) :
 *   ?lieu_de_depart=lng,lat&lieu_darrivee=lng,lat
 *
 * Layout herite : app/(protected)/layout.tsx
 * -> verifie la session et le role conducteur
 */

interface PageProps {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{
    lieu_de_depart?:  string;
    lieu_darrivee?:   string;
    departure_date?:  string;
    departure_time?:  string;
  }>;
}

export default async function CreateTripPage({ params, searchParams }: PageProps) {
  const { id }   = await params;
  const sp       = await searchParams;

  // Construction des valeurs pre-remplies à partir du circuit sélectionné et du TimeCell
  const initialValues: TripWayPrefill = {
    ...(sp.lieu_de_depart  && { departureLocation: sp.lieu_de_depart  }),
    ...(sp.lieu_darrivee   && { arrivalLocation:   sp.lieu_darrivee   }),
    ...(sp.departure_date  && { departureDate:     sp.departure_date  }),
    ...(sp.departure_time  && { departureTime:     sp.departure_time  }),
  };

  // TODO: fetch conductor.firstName via getConductorById(id) pour personnaliser
  const driverName = 'Conducteur';
  // Supprime l'avertissement 'id is defined but never used' pendant le TODO
  console.debug('[CreateTripPage] conductorId:', id);

  return (
    <CreateTripForm
      driverName={driverName}
      initialValues={initialValues}
    />
  );
}

export async function generateMetadata() {
  return {
    title: 'Creer un trajet - La Cite Covoiturage',
    description: 'Publiez un nouveau trajet de covoiturage pour la communaute La Cite.',
  };
}
