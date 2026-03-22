"use client";

import { useEffect } from "react";
import { useAppState } from "@/core/state/app_state";
import { useParams, useRouter } from "next/navigation";
import UsersList from "@/features/admin/components/UsersList";
import AdminTripsPanel from "@/features/admin/components/AdminTripsPanel";


export default function AdminDashboardPage() {
  const appState = useAppState();
    const router = useRouter();
  const params = useParams();
  const user = appState.userConnected;

  useEffect(() => {
    // Vérification d'accès (optionnel, peut être géré globalement)
    if (!user )  {
       window.location.href = '/' //si pas connecté, redirection vers la page d'accueil
     }
     else if ( user.id !== params.id || user.role.toString().toLowerCase() !== 'admin') {
      router.push(`/${user.role.toString().toLowerCase()}/${user.id}`);   // Redirection vers la page d'accueil spécifique à leur rôle
    }
  }, [user, params, router]);
 if (!user || user.id !== params.id || user.role.toString().toLowerCase() !== 'admin') {
     return  <div className=" bg-white w-full h-screen flex flex-col items-center justify-center">
<div className="flex items-center justify-center">
  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
</div>
<p className="text-center text-gray-500 mt-4">Redirection en cours...</p>
     </div>; // Ou un message de chargement, ou une redirection côté client
  }
 
  return (
    <div className="p-8 w-full min-h-screen flex flex-col">
      {/* En-tête du tableau de bord admin */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Tableau de bord — Administrateur
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Connecté en tant que{' '}
          <span className="font-medium">
            {user.prenom} {user.nom}
          </span>{' '}
          · {user.email}
        </p>
      </div>

      {/* Section : liste des utilisateurs */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Utilisateurs inscrits
        </h2>
        <UsersList />
      </section>

      {/* Section : gestion des trajets + simulation d'événements */}
      <AdminTripsPanel />

      {/* Bouton de déconnexion */}
      <div className="mt-8">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          onClick={() => appState.logout()}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}