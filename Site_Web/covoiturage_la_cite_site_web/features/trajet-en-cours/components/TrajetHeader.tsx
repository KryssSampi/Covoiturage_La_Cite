// ═══════════════════════════════════════════════════════════════════════
// TrajetHeader — En-tête résumé du trajet (conducteur/passager)
// ═══════════════════════════════════════════════════════════════════════
import { FaPhone, FaBan, FaFlagCheckered } from 'react-icons/fa';
import { TripHeaderCard } from '@/shared/components/trip-header-card/TripHeaderCard';
import type { TrajetEnCoursData } from '../types/trajet-en-cours.types';

interface TrajetHeaderProps {
  trajetData: TrajetEnCoursData;
  role: 'driver' | 'passenger';
  isFR: boolean;
  onCallDriver?: () => void;
  onCancelTrip?: () => void;
  onCompleteTrip?: () => void;
}

export function TrajetHeader({ trajetData, role, isFR, onCallDriver, onCancelTrip, onCompleteTrip }: TrajetHeaderProps) {
  const { conducteur, titre, id, tarif, statut, dateDepart, heureDepart } = trajetData;

  return (
    <TripHeaderCard
      title={titre}
      tripId={id}
      roleLabel={role === 'driver' ? (isFR ? 'Vue conducteur' : 'Driver view') : (isFR ? 'Vue passager' : 'Passenger view')}
      statusBadge={{
        label: isFR ? 'En cours…' : 'In progress…',
        color: '#0aad6a', bgColor: 'rgba(10,173,106,0.1)', borderColor: 'rgba(10,173,106,.25)', pulse: true,
      }}
      driver={{
        firstName: conducteur.prenom, lastName: conducteur.nom, initials: conducteur.initiales,
        rating: conducteur.note, tripCount: conducteur.nbTrajets, isVerified: conducteur.estVerifie,
        badges: conducteur.badges.map(b => ({ id: b.id, icon: b.icone, label: b.label })),
      }}
      vehicle={{
        label: `${conducteur.vehicule.marque} ${conducteur.vehicule.modele}`,
        color: conducteur.vehicule.couleur, plate: conducteur.vehicule.immatriculation,
      }}
      price={tarif.prixParPassager}
      departureDate={dateDepart}
      departureTime={heureDepart}
      availableSeats={statut.nbPlacesDisponibles}
      className="rounded-none rounded-b-2xl shadow-[0_4px_18px_rgba(8,49,110,0.09)]"
      actions={
        role === 'driver' ? (
          <div className="flex justify-end w-full gap-3">
            <button
              onClick={onCompleteTrip}
              className="flex items-center gap-2 py-2 px-4 rounded-lg font-bold text-xl text-center justify-center w-80 h-12 text-white cursor-pointer"
              style={{ background: '#0aad6a' }}
            >
              <FaFlagCheckered size={16} /> {isFR ? 'Terminer' : 'Complete'}
            </button>
            <button
              onClick={onCancelTrip}
              className="flex items-center gap-2 py-2 px-4 rounded-lg font-bold text-xl text-center justify-center w-80 h-12 text-white cursor-pointer"
              style={{ background: '#e03050' }}
            >
              <FaBan size={16} /> {isFR ? 'Annuler' : 'Cancel'}
            </button>
          </div>
        ) : (
          <>
            <a
              href={`tel:${conducteur.telephone ?? ''}`}
              onClick={onCallDriver}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white cursor-pointer no-underline"
              style={{ background: '#0aad6a' }}
            >
              <FaPhone size={13} /> {isFR ? 'Appeler le conducteur' : 'Call driver'}
            </a>
            <button
              onClick={onCancelTrip}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white cursor-pointer"
              style={{ background: '#e03050' }}
            >
              <FaBan size={13} /> {isFR ? 'Annuler le trajet' : 'Cancel trip'}
            </button>
          </>
        )
      }
    />
  );
}
