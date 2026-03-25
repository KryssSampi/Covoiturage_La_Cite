"use client";

import Image from "next/image";

export interface AdminUserRow {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
  is_active?: boolean;
  profile_verified?: boolean;
  photo_url?: string | null;
  created_at?: string;
  dernier_login?: string;
}

const BADGE_ROLE: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800",
  driver: "bg-blue-100 text-blue-800",
  passenger: "bg-green-100 text-green-800",
};

export default function UsersList({
  users = [],
  loading = false,
  error = null,
}: {
  users?: AdminUserRow[];
  loading?: boolean;
  error?: string | null;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        <span className="ml-3 text-gray-500">Chargement des utilisateurs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        <p className="font-semibold">Erreur</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">Aucun utilisateur trouve.</p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl shadow">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4 text-left">Nom complet</th>
            <th className="py-3 px-4 text-left">Courriel</th>
            <th className="py-3 px-4 text-left">Role</th>
            <th className="py-3 px-4 text-left">Statut</th>
            <th className="py-3 px-4 text-left">Verifie</th>
            <th className="py-3 px-4 text-left">Inscrit le</th>
            <th className="py-3 px-4 text-left">Dernier login</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 flex items-center gap-2">
                {user.photo_url ? (
                  <Image
                    src={user.photo_url}
                    alt={`${user.prenom} ${user.nom}`}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                    {(user.prenom?.[0] ?? "") + (user.nom?.[0] ?? "")}
                  </div>
                )}
                <span className="font-medium text-gray-800">
                  {user.prenom} {user.nom}
                </span>
              </td>

              <td className="py-3 px-4 text-gray-600">{user.email}</td>

              <td className="py-3 px-4">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    BADGE_ROLE[user.role.toLowerCase()] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user.role}
                </span>
              </td>

              <td className="py-3 px-4">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    user.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {user.is_active ? "Actif" : "Inactif"}
                </span>
              </td>

              <td className="py-3 px-4 text-center">
                {user.profile_verified ? "Oui" : "-"}
              </td>

              <td className="py-3 px-4 text-gray-500">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("fr-CA")
                  : "-"}
              </td>

              <td className="py-3 px-4 text-gray-500">
                {user.dernier_login
                  ? new Date(user.dernier_login).toLocaleString("fr-CA")
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-400 border-t">
        {users.length} utilisateur{users.length > 1 ? "s" : ""} au total
      </div>
    </div>
  );
}
