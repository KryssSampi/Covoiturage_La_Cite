"use client";

/**
 * PublicHeaderWrapper — affiche le header protégé si l'utilisateur est connecté,
 * sinon le header public (homepage).
 */
import { useAppState } from '@/core/state/app_state';
import { Header as PublicHeader }    from '@/features/homepage/component/header';
import { Header as ProtectedHeader } from '@/shared/components/header';

export function PublicHeaderWrapper() {
  const appState = useAppState();

  if (appState.userConnected) {
    return <ProtectedHeader />;
  }

  return <PublicHeader />;
}
