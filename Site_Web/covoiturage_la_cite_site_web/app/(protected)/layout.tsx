"use client";

import { Footer } from "@/shared/components/footer";
import { Header } from "@/shared/components/header";
import { useLoader } from "@/core/context/loader.context";
import { LoaderManager } from "@/shared/components/LoaderManager";
import { useAppState } from "@/core/state/app_state";
import { DbProvider } from "@/core/context/db.context";
import { TripProvider } from "@/core/context/trip.context";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { NotificationAlert } from "@/features/notifications/components/NotificationAlert";
import { useNotificationPush } from "@/features/notifications/hooks/useNotificationPush";
import { useUserActivityTracking } from "@/features/notifications/hooks/useUserActivityTracking";
import { useWebNotifications } from "@/features/notifications/hooks/useWebNotifications";

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
  const router = useRouter();

  // false sur le serveur ET lors du premier rendu client → aucun mismatch d'hydratation
  const mounted = useIsMounted();

  // Suivi activité & notifications — actifs uniquement si connecté
  const userId   = appState.userConnected?.id;
  const userRole = appState.userConnected?.role?.toString().toLowerCase();
  useUserActivityTracking(userId, appState.userConnected?.createdAt, userRole);
  const { current, hasAlert, queueLength, dismissCurrent } = useNotificationPush(userId, userRole);
  const { showBrowserNotification } = useWebNotifications(userId);

  // Notification bureau synchronisée sur chaque nouveau current
  useEffect(() => {
    if (!current || current.id === "__SUMMARY__") return;
    showBrowserNotification(current.title, current.message, current.link);
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirection vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (mounted && !appState.userConnected) {
      setActiveLoader(true);
      router.replace("/login");
    }
  }, [mounted, appState.userConnected, router, setActiveLoader]);

  // Avant le montage : null côté serveur ET client → rendu identique, aucun mismatch
  if (!mounted) return null;

  // Après montage : si non connecté, le useEffect ci-dessus gère la redirection
  if (!appState.userConnected) return null;

  return (
    <>
      <LoaderManager />
      <NotificationAlert
        notification={current}
        isVisible={hasAlert}
        queueLength={queueLength}
        onDismiss={dismissCurrent}
        notificationsHref={userId && userRole ? `/${userRole}/notifications/${userId}` : undefined}
      />
      <DbProvider>
        <TripProvider>
          <Header />
          {children}
          <Footer />
        </TripProvider>
      </DbProvider>
    </>
  );
}
