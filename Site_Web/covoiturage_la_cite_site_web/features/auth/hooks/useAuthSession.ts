'use client';

/**
 * features/auth/hooks/useAuthSession.ts
 * Hook multi-étapes unifié pour l'authentification par session.
 *
 * Flux unifié :
 *  email → verify-email
 *    ├─ userExists  → password → OTP 2FA → login
 *    └─ !userExists → OTP envoyé → verify-code → register form (nom, prénom, mdp) → register → auto-login
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export type AuthStep = 'loading' | 'email' | 'password' | 'otp' | 'register' | 'blocked';

export interface BlockedInfo {
  blockedUntil: number;
  remainingSeconds: number;
}

export interface AuthLoginUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: string;
  canBeDriver: boolean;
  onboardingCompleted: boolean;
}

export interface PasswordStrength {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
}

export function evaluatePassword(password: string): PasswordStrength {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordStrong(strength: PasswordStrength): boolean {
  return strength.minLength && strength.hasUppercase && strength.hasLowercase && strength.hasDigit && strength.hasSpecial;
}

export function useAuthSession(onLoginSuccess: (user: AuthLoginUser) => void) {
  const [step, setStep] = useState<AuthStep>('loading');
  const [email, setEmailState] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [blocked, setBlocked] = useState<BlockedInfo | null>(null);
  const [remainingResends, setRemainingResends] = useState(3);
  const onLoginRef = useRef(onLoginSuccess);
  onLoginRef.current = onLoginSuccess;

  // ── Init session au montage ──────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/auth/session/init', { method: 'POST' });
        if (!cancelled) {
          if (res.ok) {
            setStep('email');
          } else {
            setStep('email');
            setError('Tentative de connexion expirée. Rechargez la page.');
          }
        }
      } catch {
        if (!cancelled) {
          setStep('email');
          setError('Erreur de connexion au serveur.');
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────

  const handleBlocked = useCallback((data: { blockedUntil: string; remainingSeconds: number }) => {
    const until = new Date(data.blockedUntil).getTime() / 1000;
    setBlocked({ blockedUntil: until, remainingSeconds: data.remainingSeconds });
    setStep('blocked');
    setIsLoading(false);
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    setError('');
  }, []);

  const submitEmail = useCallback(async (emailValue: string) => {
    const trimmed = emailValue.trim().toLowerCase();
    if (!trimmed) {
      setError('Adresse email requise.');
      return;
    }
    if (!trimmed.endsWith('@collegelacite.ca') && !trimmed.endsWith('@lacitec.on.ca')) {
      setError('Utilisez votre email @collegelacite.ca ou @lacitec.on.ca.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/session/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (data.blocked) {
        handleBlocked(data);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? 'Erreur de vérification.');
        setIsLoading(false);
        return;
      }

      setEmailState(trimmed);

      if (data.userExists) {
        // Utilisateur existant → mot de passe
        setIsNewUser(false);
        setStep('password');
      } else {
        // Nouvel utilisateur → OTP déjà envoyé par le serveur, vérifier le code
        setIsNewUser(true);
        setStep('otp');
        setRemainingResends(3);
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  }, [handleBlocked]);

  const submitPassword = useCallback(async (password: string) => {
    if (!password) {
      setError('Mot de passe requis.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/session/password-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.blocked) {
        handleBlocked(data);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? 'Mot de passe incorrect.');
        setIsLoading(false);
        return;
      }

      // Login direct (session déjà validée)
      if (data.user) {
        onLoginRef.current(data.user);
        return;
      }

      // OTP envoyé pour 2FA
      setIsNewUser(false);
      setStep('otp');
      setRemainingResends(3);
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  }, [handleBlocked]);

  const submitCode = useCallback(async (code: string, rememberOtp = false) => {
    if (!code || code.length < 6) {
      setError('Entrez le code à 6 chiffres.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/session/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, rememberOtp }),
      });

      const data = await res.json();

      if (data.blocked) {
        handleBlocked(data);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? 'Erreur de vérification.');
        setIsLoading(false);
        return;
      }

      // Utilisateur existant → login réussi (le serveur finalise automatiquement)
      if (data.user) {
        onLoginRef.current(data.user);
        return;
      }

      // Code correct pour nouvel utilisateur → formulaire d'inscription
      if (data.codeValid !== false && isNewUser) {
        setStep('register');
        return;
      }

      // Code incorrect
      if (data.codeValid === false) {
        const msg = data.remainingAttempts > 0
          ? `Code incorrect. ${data.remainingAttempts} tentative(s) restante(s).`
          : 'Code incorrect. Plus de tentatives disponibles.';
        setError(msg);
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  }, [handleBlocked, isNewUser]); // rememberOtp is a param, not state dep

  const renewCode = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/session/renew-code', { method: 'POST' });
      const data = await res.json();

      if (data.blocked) {
        handleBlocked(data);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? 'Impossible de renvoyer le code.');
        setIsLoading(false);
        return;
      }

      setRemainingResends(data.remainingResends ?? 0);
      setError('');
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  }, [handleBlocked]);

  const submitRegister = useCallback(async (firstName: string, lastName: string, password: string, schoolRole?: string) => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Prénom et nom requis.');
      return;
    }

    const strength = evaluatePassword(password);
    if (!isPasswordStrong(strength)) {
      setError('Le mot de passe ne respecte pas tous les critères.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/session/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), password, schoolRole }),
      });

      const data = await res.json();

      if (data.blocked) {
        handleBlocked(data);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la création du compte.');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        onLoginRef.current(data.user);
        return;
      }

      setError('Réponse inattendue du serveur.');
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  }, [handleBlocked]);

  const goBackToEmail = useCallback(() => {
    setStep('email');
    setIsNewUser(false);
    setError('');
  }, []);

  return {
    step,
    email,
    isNewUser,
    error,
    isLoading,
    blocked,
    remainingResends,
    setEmail,
    submitEmail,
    submitPassword,
    submitCode,
    renewCode,
    submitRegister,
    goBackToEmail,
  };
}
