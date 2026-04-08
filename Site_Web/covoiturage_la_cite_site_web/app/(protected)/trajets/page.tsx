// src/app/trajets/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useAppState } from '@/core/state/app_state';
import { FaUser, FaUserGroup } from 'react-icons/fa6';

// Representation minimale d'un trajet pour l'affichage public
interface Trajet {
  id: string;
  depart: string;
  arrivee: string;
  date: string;
  prix: number;
  places: number;
  conducteur: string;
}

interface SearchFilters {
  depart: string;
  arrivee: string;
  date: string;
}

export default function TrajetsPage() {
  const appState = useAppState();
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    depart: '',
    arrivee: '',
    date: '',
  });

  const applyFilters = useCallback((items: Trajet[], activeFilters: SearchFilters): Trajet[] => {
    const depart = activeFilters.depart.trim().toLowerCase();
    const arrivee = activeFilters.arrivee.trim().toLowerCase();
    const date = activeFilters.date;

    return items.filter((item) => {
      const matchesDepart = !depart || item.depart.toLowerCase().includes(depart);
      const matchesArrivee = !arrivee || item.arrivee.toLowerCase().includes(arrivee);
      const itemDate = Number.isNaN(new Date(item.date).getTime())
        ? ''
        : new Date(item.date).toISOString().slice(0, 10);
      const matchesDate = !date || itemDate === date;

      return matchesDepart && matchesArrivee && matchesDate;
    });
  }, []);

  // Chargement des trajets disponibles depuis l'API
  const loadData = useCallback(async (activeFilters: SearchFilters = filters) => {
    setLoading(true);
    setFetchError(false);

    try {
      const res = await fetch('/api/trips?status=published');
      if (!res.ok) {
        setFetchError(true);
        return;
      }

      const data: unknown[] = await res.json();

      // Conversion du modele serveur vers l'affichage
      const mapped: Trajet[] = (data as {
        id: string;
        departure?: string;
        destination?: string;
        departureAddress?: string;
        arrivalAddress?: string;
        departureDate?: string;
        departureTime: string;
        pricePerPassenger: number;
        maxPassengers: number;
        currentPassengers: number;
        driverId: string;
        driverName?: string;
      }[]).map((t) => ({
        id: t.id,
        depart: t.departureAddress ?? t.departure ?? '',
        arrivee: t.arrivalAddress ?? t.destination ?? '',
        date: t.departureDate && t.departureTime ? `${t.departureDate}T${t.departureTime}` : t.departureTime,
        prix: t.pricePerPassenger,
        places: Math.max(0, t.maxPassengers - t.currentPassengers),
        conducteur: t.driverName ?? t.driverId,
      }));

      setTrajets(applyFilters(mapped, activeFilters));
    } catch (err) {
      console.error('[trajets/page] loadData', err);
      setFetchError(true);
      setTrajets([]);
    } finally {
      setLoading(false);
    }
  }, [applyFilters, filters]);

  // Chargement initial
  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Polling 60s - SSE db-watch desactive (Server Core)
  useEffect(() => {
    const id = setInterval(() => {
      void loadData(filters);
    }, 60_000);

    return () => clearInterval(id);
  }, [loadData, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tete */}
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Bienvenue {appState.userConnected?.firstName}</h1>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trajets disponibles</h1>
          <p className="text-gray-600">{trajets.length} trajets trouves</p>
        </div>

        {/* Barre de recherche */}
        <SearchBar
          filters={filters}
          onChange={setFilters}
          onSearch={() => void loadData(filters)}
          onReset={() => {
            const resetFilters = { depart: '', arrivee: '', date: '' };
            setFilters(resetFilters);
            void loadData(resetFilters);
          }}
        />

        {/* Liste des trajets */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des trajets...</p>
          </div>
        ) : fetchError ? (
          <div className="text-center py-12">
            <p className="text-red-500 font-medium">Impossible de charger les trajets. Veuillez reessayer.</p>
            <button onClick={() => void loadData(filters)} className="mt-4 text-blue-600 underline text-sm">
              Reessayer
            </button>
          </div>
        ) : trajets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun trajet disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trajets.map((trajet) => (
              <TrajetCard key={trajet.id} trajet={trajet} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Composant barre de recherche
function SearchBar({
  filters,
  onChange,
  onSearch,
  onReset,
}: {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
  onSearch: () => void;
  onReset: () => void;
}) {
  const onInputChange = (key: keyof SearchFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <form className="grid md:grid-cols-5 gap-4" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Depart"
          value={filters.depart}
          onChange={(event) => onInputChange('depart', event.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Arrivee"
          value={filters.arrivee}
          onChange={(event) => onInputChange('arrivee', event.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={filters.date}
          onChange={(event) => onInputChange('date', event.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold">
          Rechercher
        </button>
        <button
          type="button"
          onClick={onReset}
          className="bg-gray-100 text-gray-700 px-6 py-2 rounded hover:bg-gray-200 font-semibold"
        >
          Reinitialiser
        </button>
      </form>
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
            {trajet.depart} -&gt; {trajet.arrivee}
          </h3>
          <p className="text-gray-600 text-sm mt-1">{new Date(trajet.date).toLocaleString('fr-FR')}</p>
        </div>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">{trajet.prix} EUR</span>
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

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">Reserver</button>
      </div>
    </div>
  );
}
