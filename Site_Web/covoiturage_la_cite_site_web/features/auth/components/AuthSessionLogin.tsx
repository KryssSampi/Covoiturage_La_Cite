// Composant principal d'authentification multi-étapes
// Orchestration du flux : Email → Mot de passe/OTP → Inscription → Connexion
import { useAuthSession, type AuthLoginUser } from '../hooks/useAuthSession';
import { useAppState, Language } from '@/core/state/app_state';
import LoadingStep from './LoadingStep';
import EmailStep from './EmailStep';
import PasswordStep from './PasswordStep';
import OtpStep from './OtpStep';
import RegisterFormStep from './RegisterFormStep';
import BlockedStep from './BlockedStep';

export interface AuthSessionLoginProps {
  onLoginSuccess: (user: AuthLoginUser) => void;
}

export function AuthSessionLogin({ onLoginSuccess }: AuthSessionLoginProps) {
  const appState = useAppState();
  const isFr = appState.lang === Language.FR;
  const auth = useAuthSession(onLoginSuccess);

  return (
    <div className="w-200 min-h-70 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      {auth.step === 'loading' && <LoadingStep isFr={isFr} />}
      {auth.step === 'email' && <EmailStep auth={auth} isFr={isFr} />}
      {auth.step === 'password' && <PasswordStep auth={auth} isFr={isFr} />}
      {auth.step === 'otp' && <OtpStep auth={auth} isFr={isFr} />}
      {auth.step === 'register' && <RegisterFormStep auth={auth} isFr={isFr} />}
      {auth.step === 'blocked' && <BlockedStep blocked={auth.blocked} isFr={isFr} />}
    </div>
  );
}
