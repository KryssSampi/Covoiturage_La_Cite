// features/auth/components/RegisterFormStep.tsx
// Composant pour l'étape d'inscription (nouvel utilisateur après OTP) dans le flux d'authentification.
import React, { useState, useEffect, useRef } from 'react';
import { useAuthSession, evaluatePassword, isPasswordStrong } from '../hooks/useAuthSession';
import ErrorMessage from './ErrorMessage';
import PasswordCriterion from './PasswordCriterion';

export default function RegisterFormStep({ auth, isFr }: { auth: ReturnType<typeof useAuthSession>; isFr: boolean }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [schoolRole, setSchoolRole] = useState('Etudiant');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const firstNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstNameRef.current?.focus(); }, []);

  const strength = evaluatePassword(password);
  const strong = isPasswordStrong(strength);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = firstName.trim() && lastName.trim() && strong && passwordsMatch && !auth.isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    auth.submitRegister(firstName, lastName, password, schoolRole);
  };

  return (
    <form onSubmit={handleSubmit} className="uniform-form flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {isFr ? 'Créer votre compte' : 'Create your account'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{auth.email}</p>
      </div>

      {/* Prénom */}
      <div>
        <label htmlFor="reg-firstname" className="mb-1 block text-sm font-medium text-gray-700">
          {isFr ? 'Prénom' : 'First name'}
        </label>
        <input
          ref={firstNameRef}
          id="reg-firstname"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={isFr ? 'Jean' : 'John'}
          disabled={auth.isLoading}
          autoComplete="given-name"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {/* Nom */}
      <div>
        <label htmlFor="reg-lastname" className="mb-1 block text-sm font-medium text-gray-700">
          {isFr ? 'Nom' : 'Last name'}
        </label>
        <input
          id="reg-lastname"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder={isFr ? 'Dupont' : 'Smith'}
          disabled={auth.isLoading}
          autoComplete="family-name"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {/* Mot de passe */}
      <div>
        <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-gray-700">
          {isFr ? 'Mot de passe' : 'Password'}
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={auth.isLoading}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-gray-900 placeholder:text-gray-400
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                       disabled:bg-gray-50 disabled:text-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Critères de force */}
        {password.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <PasswordCriterion met={strength.minLength} label={isFr ? '8 caractères minimum' : 'At least 8 characters'} />
            <PasswordCriterion met={strength.hasUppercase} label={isFr ? 'Une lettre majuscule' : 'One uppercase letter'} />
            <PasswordCriterion met={strength.hasLowercase} label={isFr ? 'Une lettre minuscule' : 'One lowercase letter'} />
            <PasswordCriterion met={strength.hasDigit} label={isFr ? 'Un chiffre' : 'One digit'} />
            <PasswordCriterion met={strength.hasSpecial} label={isFr ? 'Un caractère spécial (!@#$...)' : 'One special character (!@#$...)'} />
          </div>
        )}
      </div>

      {/* Confirmation mot de passe */}
      <div>
        <label htmlFor="reg-confirm" className="mb-1 block text-sm font-medium text-gray-700">
          {isFr ? 'Confirmer le mot de passe' : 'Confirm password'}
        </label>
        <input
          id="reg-confirm"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          disabled={auth.isLoading}
          autoComplete="new-password"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-50 disabled:text-gray-500"
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="mt-1 text-sm text-red-500">
            {isFr ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.'}
          </p>
        )}
        {passwordsMatch && (
          <p className="mt-1 flex items-center gap-1 text-sm text-green-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {isFr ? 'Les mots de passe correspondent.' : 'Passwords match.'}
          </p>
        )}
      </div>

      <ErrorMessage message={auth.error} />

      {/* Rôle à la cité */}
      <div>
        <label htmlFor="reg-schoolrole" className="mb-1 block text-sm font-medium text-gray-700">
          {isFr ? "Votre rôle à la cité" : "Your role at the school"}
        </label>
        <select
          id="reg-schoolrole"
          value={schoolRole}
          onChange={(e) => setSchoolRole(e.target.value)}
          disabled={auth.isLoading}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option>Etudiant</option>
          <option>Professeur</option>
          <option>Administrateur</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {auth.isLoading
          ? (isFr ? 'Création du compte...' : 'Creating account...')
          : (isFr ? 'Créer mon compte' : 'Create my account')}
      </button>
    </form>
  );
}
