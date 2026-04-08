// features/auth/components/OtpStep.tsx
// Composant pour l'étape OTP (code de vérification) dans le flux d'authentification.
import React, { useState, useEffect, useRef } from 'react';
import { useAuthSession } from '../hooks/useAuthSession';
import ErrorMessage from './ErrorMessage';

export default function OtpStep({ auth, isFr }: { auth: ReturnType<typeof useAuthSession>; isFr: boolean }) {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null);
  const [validityRemaining, setValidityRemaining] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Récupère l'état OTP côté serveur (date d'expiration, resends restants)
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function fetchOtpStatus() {
      try {
        const res = await fetch('/api/auth/otp-status');
        if (!res.ok) return;
        const body = await res.json();
        const data = body?.data ?? body; // ApiResponse wrapper ou raw
        if (cancelled) return;
        if (data?.otpExpiresAt) {
          const expires = new Date(data.otpExpiresAt);
          setOtpExpiresAt(expires);
          const sec = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 1000));
          setValidityRemaining(sec);
        } else {
          // Keine expiration yet — retry a few times in case server just sent the email
          attempts += 1;
          if (attempts <= 5 && !cancelled) {
            setTimeout(fetchOtpStatus, 500);
          } else {
            setOtpExpiresAt(null);
            setValidityRemaining(0);
          }
        }
      } catch (err) {
        console.error("[OtpStep]", err);
        // ignore
      }
    }

    fetchOtpStatus();

    return () => { cancelled = true; };
  }, []);

  // Tick validity and resend cooldown every second
  useEffect(() => {
    const t = setInterval(() => {
      setValidityRemaining((s) => Math.max(0, s - 1));
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    auth.submitCode(code);
  };

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
  };

  const handleResend = async () => {
    // démarrer blocage local immédiat pour 30s
    setResendCooldown(30);
    try {
      await auth.renewCode();
      // après renvoi, interroger le statut OTP pour mettre à jour expiry
      const res = await fetch('/api/auth/otp-status');
      if (res.ok) {
        const body = await res.json();
        const data = body?.data ?? body;
        if (data?.otpExpiresAt) {
          const expires = new Date(data.otpExpiresAt);
          setOtpExpiresAt(expires);
          const sec = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 1000));
          setValidityRemaining(sec);
        }
      }
    } catch {
      // en cas d'erreur côté serveur, on laisse le cooldown local mais on affiche l'erreur via auth
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <button
          type="button"
          onClick={auth.goBackToEmail}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {isFr ? 'Changer d\'email' : 'Change email'}
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {isFr ? 'Vérification' : 'Verification'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isFr
            ? 'Un code de vérification a été envoyé à'
            : 'A verification code has been sent to'}
        </p>
        <p className="mt-0.5 text-xl font-medium text-gray-700">{auth.email}</p>
      </div>

      <div>
        <label htmlFor="auth-code" className="mb-1 block text-sm font-medium text-gray-700">
          {isFr ? 'Code de vérification' : 'Verification code'}
        </label>
        <input
          ref={inputRef}
          id="auth-code"
          type="text"
          inputMode="numeric"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="000000"
          maxLength={6}
          disabled={auth.isLoading}
          autoComplete="one-time-code"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center text-2xl font-mono tracking-[0.3em] text-gray-900
                     placeholder:text-gray-300 placeholder:tracking-[0.3em]
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <ErrorMessage message={auth.error} />

      <button
        type="submit"
        disabled={auth.isLoading || code.length < 6}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {auth.isLoading
          ? (isFr ? 'Vérification...' : 'Verifying...')
          : (isFr ? 'Vérifier' : 'Verify')}
      </button>

      <div className="text-center">
        {validityRemaining > 0 && (
          <p className="text-sm text-gray-500 mb-2">
            {isFr ? 'Code valide pendant' : 'Code valid for'} : {Math.floor(validityRemaining / 60)}:{String(validityRemaining % 60).padStart(2, '0')}
          </p>
        )}

        {auth.remainingResends > 0 ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={auth.isLoading || resendCooldown > 0}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition-colors"
          >
            {resendCooldown > 0
              ? (isFr ? `Renvoyer dans ${resendCooldown}s` : `Resend in ${resendCooldown}s`)
              : (isFr
                ? `Renvoyer le code (${auth.remainingResends} restant${auth.remainingResends > 1 ? 's' : ''})`
                : `Resend code (${auth.remainingResends} remaining)`)
            }
          </button>
        ) : (
          <p className="text-sm text-gray-400">
            {isFr ? 'Aucun renvoi disponible.' : 'No resends available.'}
          </p>
        )}
      </div>
    </form>
  );
}
