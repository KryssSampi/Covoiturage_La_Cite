"use client";

/**
 * Composant UsersList : affiche la liste des utilisateurs dans le tableau de bord admin.
 * Les données sont chargées depuis la route API /api/users.
 */

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { UserModel } from '@/domain/models/UserModel';

// Couleurs associées à chaque rôle utilisateur
const BADGE_ROLE: Record<string, string> = {
  admin:     'bg-purple-100 text-purple-800',
  driver:    'bg-blue-100 text-blue-800',
  passenger: 'bg-green-100 text-green-800',
};

export default function UsersList() {
  const [users, setUsers]     = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Chargement des utilisateurs au montage du composant
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');

        if (!res.ok) {
          throw new Error(`Erreur HTTP ${res.status}`);
        }

        const data = await res.json();
        setUsers(data.users ?? []);
      } catch (err) {
        console.error('[UsersList] Erreur lors du chargement :', err);
        setError('Impossible de charger les utilisateurs. Vérifiez la connexion à la base de données.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // --- État : chargement ---
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        <span className="ml-3 text-gray-500">Chargement des utilisateurs…</span>
      </div>
    );
  }

  // --- État : erreur ---
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        <p className="font-semibold">Erreur</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  // --- État : aucun utilisateur ---
  if (users.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">Aucun utilisateur trouvé.</p>
    );
  }

  // --- Affichage de la liste ---
  return (
    <div className="w-full overflow-x-auto rounded-xl shadow">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4 text-left">Nom complet</th>
            <th className="py-3 px-4 text-left">Courriel</th>
            <th className="py-3 px-4 text-left">Rôle</th>
            <th className="py-3 px-4 text-left">Statut</th>
            <th className="py-3 px-4 text-left">Vérifié</th>
            <th className="py-3 px-4 text-left">Inscrit le</th>
            <th className="py-3 px-4 text-left">Dernier login</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">

              {/* Nom + photo */}
              <td className="py-3 px-4 flex items-center gap-2">
                {user.photo_url ? (
                  <Image
                    src={user.photo_url}
                    alt={`${user.prenom} ${user.nom}`}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/assets/placeholder/placeholer-profile-picture.png"; }}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                    {(user.prenom?.[0] ?? '') + (user.nom?.[0] ?? '')}
                  </div>
                )}
                <span className="font-medium text-gray-800">
                  {user.prenom} {user.nom}
                </span>
              </td>

              {/* Courriel */}
              <td className="py-3 px-4 text-gray-600">{user.email}</td>

              {/* Badge rôle */}
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    BADGE_ROLE[user.role.toLowerCase()] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {user.role}
                </span>
              </td>

              {/* Statut actif */}
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    user.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {user.is_active ? 'Actif' : 'Inactif'}
                </span>
              </td>

              {/* Profil vérifié */}
              <td className="py-3 px-4 text-center">
                {user.profile_verified ? '✅' : '—'}
              </td>

              {/* Date d'inscription */}
              <td className="py-3 px-4 text-gray-500">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString('fr-CA')
                  : '—'}
              </td>

              {/* Dernier login */}
              <td className="py-3 px-4 text-gray-500">
                {user.dernier_login
                  ? new Date(user.dernier_login).toLocaleString('fr-CA')
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Compteur d'utilisateurs */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-400 border-t">
        {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
      </div>
    </div>
  );
}
