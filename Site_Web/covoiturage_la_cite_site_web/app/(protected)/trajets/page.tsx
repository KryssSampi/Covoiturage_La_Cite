// src/app/trajets/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Données mockées (remplacer par fetch('/api/trajets'))
    setTimeout(() => {
      setTrajets([
        {
          id: '1',
          depart: 'Paris',
          arrivee: 'Lyon',
          date: '2024-02-15 14:00',
          prix: 25,
          places: 3,
          conducteur: 'Marie D.'
        },
        {
          id: '2',
          depart: 'Marseille',
          arrivee: 'Nice',
          date: '2024-02-16 09:30',
          prix: 15,
          places: 2,
          conducteur: 'Pierre L.'
        },
        {
          id: '3',
          depart: 'Toulouse',
          arrivee: 'Bordeaux',
          date: '2024-02-17 16:00',
          prix: 20,
          places: 4,
          conducteur: 'Sophie M.'
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trajets disponibles
          </h1>
          <p className="text-gray-600">
            {trajets.length} trajets trouvés
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar />

        {/* Trajets List */}
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

// Composant Search Bar
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
          <div className="text-sm text-gray-600">
            👤 {trajet.conducteur}
          </div>
          <div className="text-sm text-gray-600">
            💺 {trajet.places} places
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">
          Réserver
        </button>
      </div>
    </div>
  );
}