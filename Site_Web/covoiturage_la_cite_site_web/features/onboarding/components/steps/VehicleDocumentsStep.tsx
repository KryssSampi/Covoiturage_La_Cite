'use client';

import { useRef } from 'react';
import type { useOnboarding } from '../../hooks/useOnboarding';
import { FaCircleCheck, FaFileImport } from 'react-icons/fa6';
import { Language, useAppState } from '@/core/state/app_state';

interface Props {
  onboarding: ReturnType<typeof useOnboarding>;
}

interface DocConfig {
  type: string;
  label: string;
  description: string;
  requiresExpiry: boolean;
}

function getRequiredDocs(isFR: boolean): DocConfig[] {
  return [
    {
      type: 'DriversLicense',
      label: isFR ? 'Permis de conduire' : "Driver's License",
      description: isFR
        ? 'Recto/verso de votre permis de conduire provincial.'
        : 'Front/back of your provincial driver license.',
      requiresExpiry: true,
    },
    {
      type: 'Insurance',
      label: isFR ? 'Assurance automobile' : 'Auto Insurance',
      description: isFR
        ? "Certificat d'assurance en cours de validité."
        : 'Valid insurance certificate.',
      requiresExpiry: true,
    },
    {
      type: 'VehicleRegistration',
      label: isFR ? 'Immatriculation du véhicule' : 'Vehicle Registration',
      description: isFR
        ? "Certificat d'immatriculation (carte grise)."
        : 'Registration certificate.',
      requiresExpiry: false,
    },
    {
      type: 'CriminalRecord',
      label: isFR ? 'Vérification des antécédents judiciaires' : 'Criminal Record Check',
      description: isFR
        ? 'Récente (moins de 6 mois). Disponible à la bibliothèque du Collège.'
        : 'Recent (less than 6 months). Available at the College library.',
      requiresExpiry: false,
    },
  ];
}

function DocumentCard({
  doc,
  submitted,
  onUpload,
  isLoading,
  isFR,
}: {
  doc: DocConfig;
  submitted?: { fileUrl: string; expiryDate?: string };
  onUpload: (docType: string, fileUrl: string, expiryDate?: string) => void;
  isLoading: boolean;
  isFR: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const fileUrl = ev.target?.result as string;
      const expiry = expiryRef.current?.value || undefined;
      onUpload(doc.type, fileUrl, expiry);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${submitted ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{submitted ? <FaCircleCheck color="#34D399" /> : <FaFileImport color="#08316e" />}</span>
            <h3 className="text-sm font-semibold text-gray-900">{doc.label}</h3>
          </div>
          <p className="mt-1 text-xs text-gray-500">{doc.description}</p>
        </div>
      </div>

      {doc.requiresExpiry && (
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            {isFR ? "Date d'expiration" : 'Expiry Date'}
          </label>
          <input
            ref={expiryRef}
            type="date"
            defaultValue={submitted?.expiryDate}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800
                       focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors
          ${submitted
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {submitted
          ? (isFR ? ' Remplacer' : ' Replace')
          : (isFR ? 'Téléverser' : 'Upload')}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default function VehicleDocumentsStep({ onboarding }: Props) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const { formData, isLoading, error, submitDocument, goToNextStep, triggerAbandonWarning } = onboarding;
  const REQUIRED_DOCS = getRequiredDocs(isFR);

  const allSubmitted = REQUIRED_DOCS.every((doc) => formData.documents[doc.type]);
  const submittedCount = REQUIRED_DOCS.filter((doc) => formData.documents[doc.type]).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {isFR ? 'Documents conducteur' : 'Driver Documents'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {submittedCount} / {REQUIRED_DOCS.length} {isFR ? 'documents soumis' : 'documents submitted'}
        </p>
      </div>

      {/* Barre de progression des documents */}
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all"
          style={{ width: `${(submittedCount / REQUIRED_DOCS.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-col gap-3">
        {REQUIRED_DOCS.map((doc) => (
          <DocumentCard
            key={doc.type}
            doc={doc}
            submitted={formData.documents[doc.type]}
            onUpload={submitDocument}
            isLoading={isLoading}
            isFR={isFR}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={goToNextStep}
        disabled={!allSubmitted || isLoading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isLoading
          ? (isFR ? 'Traitement...' : 'Processing...')
          : allSubmitted
            ? (isFR ? 'Continuer' : 'Continue')
            : (isFR ? `Encore ${REQUIRED_DOCS.length - submittedCount} document(s)` : `${REQUIRED_DOCS.length - submittedCount} document(s) remaining`)}
      </button>

      <button
        type="button"
        onClick={triggerAbandonWarning}
        className="text-xs text-gray-400 hover:text-gray-600 underline text-center transition-colors"
      >
        {isFR ? 'Continuer en tant que passager uniquement' : 'Continue as passenger only'}
      </button>
    </div>
  );
}
