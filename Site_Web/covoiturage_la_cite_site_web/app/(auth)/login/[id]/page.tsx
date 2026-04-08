"use client";

/**
 * Page de connexion via AuthSession (publicId).
 * [id] = publicId de l'AuthSession créée par le QR scan / email link.
 *
 * Flow :
 * 1. Lire le publicId de l'URL
 * 2. Appeler GET /api/auth/session/{publicId} pour connaître le state
 *    - INIT → afficher email + demander OTP
 *    - OTP_SENT → afficher champ OTP
 *    - OTP_VERIFIED → demander mot de passe ou continuer SSO
 *    - PASSWORD_LOGIN_REQUIRED → formulaire mot de passe
 *    - COMPLETED → rediriger vers tableau de bord
 * 3. Selon l'état, déclencher les actions appropriées (register, verify-code, etc.)
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AuthSessionLoginPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const publicId = params.id;

  const [sessionState, setSessionState] = useState<string>("loading");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch session status
  const fetchSessionStatus = useCallback(async () => {
    if (!publicId) return;
    try {
      const res = await fetch(`/api/auth/session/${publicId}`);
      if (!res.ok) {
        setSessionState("expired");
        return;
      }
      const data = await res.json();
      setSessionState(data.state ?? "unknown");
      if (data.email) setEmail(data.email);
    } catch (err) {
      console.error("[login/[id]] fetchSessionStatus", err);
      setSessionState("error");
    }
  }, [publicId]);

  useEffect(() => {
    if (!publicId) {
      setLoading(false);
      return;
    }
    fetchSessionStatus().finally(() => setLoading(false));
  }, [publicId, fetchSessionStatus]);

  // Initiate OTP
  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/session/renew-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur envoi OTP");
        return;
      }
      await fetchSessionStatus();
    } catch (err) {
      console.error("[login/[id]] sendOtp", err);
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/session/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, code: otpCode }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Code invalide");
        return;
      }
      await fetchSessionStatus();
    } catch (err) {
      console.error("[login/[id]] verifyOtp", err);
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // Password login
  const handlePasswordLogin = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/session/password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Mot de passe incorrect");
        return;
      }
      await fetchSessionStatus();
    } catch (err) {
      console.error("[login/[id]] passwordLogin", err);
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // Registration
  const handleRegister = async () => {
    if (!email.includes("@")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/session/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur inscription");
        return;
      }
      await fetchSessionStatus();
    } catch (err) {
      console.error("[login/[id]] register", err);
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  if (!publicId) {
    return (
      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        <h2 className="text-xl font-bold">Lien invalide</h2>
        <p className="mt-2 text-gray-600">
          Le lien de connexion ne contient pas d'identifiant de session.
        </p>
      </div>
    );
  }

  if (loading && sessionState === "loading") {
    return (
      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg text-center">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-gray-600">Vérification de la session...</p>
      </div>
    );
  }

  // Session expired
  if (sessionState === "expired" || sessionState === "error") {
    return (
      <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-8 shadow-lg">
        <h2 className="text-xl font-bold text-red-700">Session expirée</h2>
        <p className="mt-2 text-gray-600">
          Cette session a expiré ou est invalide. Veuillez scanner à nouveau le QR code.
        </p>
        <a
          href="/login"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
        >
          Retour à la connexion
        </a>
      </div>
    );
  }

  // Completed — will be redirected by polling
  if (sessionState === "completed") {
    return (
      <div className="max-w-md rounded-xl border border-green-200 bg-green-50 p-8 shadow-lg text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-green-700">Connexion réussie !</h2>
        <p className="mt-2 text-gray-600">Redirection vers votre tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
      <h2 className="text-xl font-bold mb-6">Connexion à Covoiturage La Cité</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* INIT: Enter email to get OTP */}
      {sessionState === "init" && (
        <div>
          <p className="mb-4 text-gray-600">
            Entrez votre adresse courriel pour recevoir un code de vérification.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse courriel
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@college.edu"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={!email.includes("@") || loading}
              className="w-full rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Envoi en cours..." : "Envoyer le code"}
            </button>
          </div>
        </div>
      )}

      {/* OTP_SENT: Enter the OTP */}
      {(sessionState === "otp_sent" || sessionState === "otp_resend") && (
        <div>
          <p className="mb-4 text-gray-600">
            Entrez le code à 6 chiffres envoyé à{" "}
            <span className="font-medium">{email || "votre courriel"}</span>.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Code de vérification
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-lg tracking-widest focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={otpCode.length !== 6 || loading}
              className="w-full rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Vérification..." : "Vérifier le code"}
            </button>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              Renvoyer le code
            </button>
          </div>
        </div>
      )}

      {/* OTP_VERIFIED: Password */}
      {sessionState === "otp_verified" && (
        <div>
          <p className="mb-4 text-gray-600">
            Email vérifié ! Définissez votre mot de passe ou connectez-vous.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handlePasswordLogin}
              disabled={password.length < 8 || loading}
              className="w-full rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </div>
      )}

      {/* PASSWORD or REGISTER state depending on whether user exists */}
      {sessionState === "password" && (
        <div>
          <p className="mb-4 text-gray-600">
            Connectez-vous avec votre mot de passe.
          </p>
          <div>
            <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">
              Adresse courriel
            </label>
            <input
              id="email-login"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@college.edu"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password-login"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handlePasswordLogin}
            disabled={!password || !email || loading}
            className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <p className="mt-3 text-center text-sm text-gray-500">
            Pas encore de compte ?{" "}
            <button onClick={handleRegister} className="text-blue-600 hover:underline">
              Créer un compte
            </button>
          </p>
        </div>
      )}

      {!["init", "otp_sent", "otp_resend", "otp_verified", "password", "completed"].includes(sessionState) && (
        <div className="text-center text-gray-600">
          <p>État inconnu : {sessionState}</p>
          <button onClick={fetchSessionStatus} className="mt-4 text-blue-600 hover:underline">
            Rafraîchir
          </button>
        </div>
      )}
    </div>
  );
}