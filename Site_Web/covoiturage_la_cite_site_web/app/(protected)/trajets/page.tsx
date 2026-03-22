// src/app/trajets/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAppState } from '@/core/state/app_state';
import { FaUser, FaUserGroup } from 'react-icons/fa6';

// Représentation minimale d'un trajet pour l'affichage public
interface Trajet {
  id: string;
  depart: string;
  arrivee: string;
  date: string;
  prix: number;
  places: number;
  conducteur: string;
}

export default function TrajetsPage() {
  const appState = useAppState()
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chargement des trajets disponibles depuis la base JSON
    fetch('/api/trips?status=published')
      .then((res) => res.json())
      .then((data: unknown[]) => {
        // Conversion du modèle serveur vers l'affichage
        const mapped: Trajet[] = (data as {
          id: string;
          departure: string;
          destination: string;
          departureTime: string;
          pricePerPassenger: number;
          maxPassengers: number;
          currentPassengers: number;
          driverId: string;
        }[]).map((t) => ({
          id:         t.id,
          depart:     t.departure,
          arrivee:    t.destination,
          date:       t.departureTime,
          prix:       t.pricePerPassenger,
          places:     t.maxPassengers - t.currentPassengers,
          conducteur: t.driverId, // sera enrichi si nécessaire
        }));
        setTrajets(mapped);
      })
      .catch(() => setTrajets([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white shadow">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            MonCovoiturage
          </Link>
          <div className="space-x-4">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Accueil
            </Link>
            <Link href="/trajets" className="text-gray-700 hover:text-blue-600 font-semibold">
              Trajets
            </Link>
          </div>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Bienvenue {appState.userConnected?.nom}</h1>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trajets disponibles
          </h1>
          <p className="text-gray-600">
            {trajets.length} trajets trouvés
          </p>
        </div>

        {/* Barre de recherche */}
        <SearchBar />

        {/* Liste des trajets */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des trajets...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trajets.map(trajet => (
              <TrajetCard key={trajet.id} trajet={trajet} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Composant barre de recherche
function SearchBar() {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Départ"
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Arrivée"
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold">
          Rechercher
        </button>
      </div>
    </div>
  );
}

// Composant Trajet Card
function TrajetCard({ trajet }: { trajet: Trajet }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {trajet.depart} → {trajet.arrivee}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {new Date(trajet.date).toLocaleString('fr-FR')}
          </p>
        </div>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
          {trajet.prix}€
        </span>
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600 flex items-center gap-1">
            <FaUser size={13} color="#6b7280" /> {trajet.conducteur}
          </div>
          <div className="text-sm text-gray-600 flex items-center gap-1">
            <FaUserGroup size={13} color="#6b7280" /> {trajet.places} places
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">
          Réserver
        </button>
      </div>
    </div>
  );
}