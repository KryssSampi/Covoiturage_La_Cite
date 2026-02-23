"use client";

import { useEffect } from "react";
import {useAppState } from "@/core/state/app_state";
import { useParams,useRouter } from "next/navigation";


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

    <div className="p-8 w-full h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord de l&apos;administrateur - {params.id}</h1>
      <p>Bienvenue sur votre tableau de bord {user.prenom} {user.nom} ! Ici, vous pouvez gérer vos trajets, consulter vos réservations et mettre à jour votre profil.
  vous êtes un  {user.role.toString()} et votre adresse email est {user.email}.</p>
  <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => appState.logout()}>
    Se déconnecter
  </button>
    </div>

  );
}