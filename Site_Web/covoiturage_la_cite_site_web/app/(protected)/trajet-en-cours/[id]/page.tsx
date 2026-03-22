import TrajetEnCoursPage from '@/features/trajet-en-cours/components/TrajetEnCoursPage';

/**
 * Route : /trajet-en-cours/[id]
 *
 * Page « Trajet en cours » — affichée lorsqu'un trajet imminent est démarré.
 * Reçoit l'ID du trajet via les paramètres dynamiques de l'URL.
 *
 * Le composant TrajetEnCoursPage utilise pour l'instant des fixtures.
 * L'ID sera utilisé pour le fetch réel des données du trajet.
 */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrajetEnCoursRoutePage({ params }: PageProps) {
  const { id } = await params;

  // Passe l'id du trajet au composant client pour chargement via useDb()
  return <TrajetEnCoursPage tripId={id} />;
}
