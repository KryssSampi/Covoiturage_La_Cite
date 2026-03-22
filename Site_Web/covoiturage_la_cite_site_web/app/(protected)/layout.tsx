"use client";

import { Footer } from "@/shared/components/footer";
import { Header } from "@/shared/components/header";
import { LoaderProvider, useLoader } from "@/core/context/loader.context";
import { LoaderManager } from "@/shared/components/LoaderManager";
import { useAppState } from "@/core/state/app_state";
import { DbProvider } from "@/core/context/db.context";
import { TripProvider } from "@/core/context/trip.context";
import { useEffect, useSyncExternalStore } from "react";

/**
 * Détecte si le composant est monté côté client.
 * useSyncExternalStore fournit un snapshot différent pour le serveur (false)
 * et pour le client (true), sans useEffect ni useState → aucun mismatch SSR.
 */
function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},  // subscribe : no-op, l'état ne change jamais
    () => true,      // getSnapshot côté client : monté
    () => false,     // getServerSnapshot côté serveur : non monté
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appState        = useAppState();
  const { setActiveLoader } = useLoader();

  // false sur le serveur ET lors du premier rendu client → aucun mismatch d'hydratation
  const mounted = useIsMounted();

  // Redirection vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (mounted && !appState.userConnected) {
      setActiveLoader(true);
      window.location.href = "/login";
    }
  }, [mounted, appState.userConnected, setActiveLoader]);

  // Avant le montage : null côté serveur ET client → rendu identique, aucun mismatch
  if (!mounted) return null;

  // Après montage : si non connecté, le useEffect ci-dessus gère la redirection
  if (!appState.userConnected) return null;

  return (
    <LoaderProvider>
      <LoaderManager />
      <DbProvider>
        <TripProvider>
          <Header />
          {children}
          <Footer />
        </TripProvider>
      </DbProvider>
    </LoaderProvider>
  );
}
