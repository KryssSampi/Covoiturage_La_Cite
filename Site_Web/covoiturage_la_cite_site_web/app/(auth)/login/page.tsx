"use client";
import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Language, useAppState } from "@/core/state/app_state";
import { loginAction } from "@/features/auth/auth.actions";

const t = {
  [Language.FR]: {
    title: "Bon retour !",
    subtitle: "Connectez-vous à votre compte",
    email: "Adresse e-mail",
    emailPlaceholder: "exemple@lacite.edu",
    password: "Mot de passe",
    passwordPlaceholder: "••••••••",
    forgot: "Mot de passe oublié ?",
    submit: "Se connecter",
    submitting: "Connexion en cours…",
    noAccount: "Pas encore de compte ?",
    register: "S'inscrire",
    brand: "Covoiturage La Cité",
    tagline: "Partagez le trajet, partagez l'avenir.",
  },
  [Language.EN]: {
    title: "Welcome back!",
    subtitle: "Sign in to your account",
    email: "Email address",
    emailPlaceholder: "example@lacite.edu",
    password: "Password",
    passwordPlaceholder: "••••••••",
    forgot: "Forgot password?",
    submit: "Sign in",
    submitting: "Signing in…",
    noAccount: "No account yet?",
    register: "Register",
    brand: "Carpooling La Cité",
    tagline: "Share the ride, share the future.",
  },
};

function SubmitButton({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-800 text-white py-3 rounded-full font-semibold text-lg
                 hover:bg-blue-700 active:scale-95 transition-all duration-200 hover:shadow-lg
                 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
                 flex items-center justify-center gap-2"
    >
      {pending && (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {pending ? loadingLabel : label}
    </button>
  );
}

export default function LoginPage() {
  const appState = useAppState();
  const lang = appState.lang ?? Language.FR;
  const tx = t[lang] ?? t[Language.FR];

  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche — visible desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-700 rounded-full opacity-40" />
        <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-blue-900 rounded-full opacity-30" />

        <div className="relative z-10 text-center text-white">
          {/* Icône voiture */}
          <div className="mb-8 flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H5a2 2 0 01-2-2v-1l2-5h14l2 5v1a2 2 0 01-2 2h-3m-8 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold mb-3">{tx.brand}</h2>
          <p className="text-blue-200 text-lg max-w-xs mx-auto">{tx.tagline}</p>

          {/* Statistiques fictives */}
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { value: "500+", label: lang === Language.FR ? "Étudiants" : "Students" },
              { value: "1200+", label: lang === Language.FR ? "Trajets" : "Rides" },
              { value: "98%", label: lang === Language.FR ? "Satisfaits" : "Satisfied" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 rounded-xl py-4 px-2">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-blue-200 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Badge mobile */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="bg-blue-800 rounded-xl p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H5a2 2 0 01-2-2v-1l2-5h14l2 5v1a2 2 0 01-2 2h-3m-8 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
            </div>
            <span className="text-blue-800 font-bold text-lg">{tx.brand}</span>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-blue-800 mb-1">{tx.title}</h1>
            <p className="text-gray-500 mb-7">{tx.subtitle}</p>

            {/* Message d'erreur */}
            {state?.error && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {tx.email}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 12A4 4 0 118 12a4 4 0 018 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={tx.emailPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all duration-200 text-gray-900"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="motDePasse"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {tx.password}
                  </label>
                  <Link
                    href="/mot-de-passe-oublie"
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {tx.forgot}
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </span>
                  <input
                    id="motDePasse"
                    name="motDePasse"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder={tx.passwordPlaceholder}
                    className="w-full pl-10 pr-11 py-2.5 border border-gray-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all duration-200 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <SubmitButton label={tx.submit} loadingLabel={tx.submitting} />
            </form>

            <p className="text-center text-gray-500 mt-6 text-sm">
              {tx.noAccount}{" "}
              <Link
                href="/inscription"
                className="text-blue-800 font-semibold hover:underline transition-colors"
              >
                {tx.register}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
