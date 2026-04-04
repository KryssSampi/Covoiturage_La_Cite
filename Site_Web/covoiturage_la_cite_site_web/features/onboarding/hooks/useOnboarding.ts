'use client';

/**
 * features/onboarding/hooks/useOnboarding.ts
 *
 * State machine du flux d'onboarding post-inscription.
 * Les étapes conducteur sont conditionnelles au choix du rôle.
 *
 * Étapes :
 *  1. politics     — Acceptation de la politique
 *  2. role         — Choix rôle (passager/conducteur) + rôle scolaire
 *  3. phone        — Numéro de téléphone
 *  4. vehicle      — Infos véhicule (conducteur seulement)
 *  5. vehiclePhotos — 6 photos du véhicule (conducteur seulement)
 *  6. documents    — Documents conducteur (conducteur seulement)
 *  7. profilePhoto — Photo de profil
 */

import { useState, useCallback } from 'react';

export type OnboardingStep =
  | 'politics'
  | 'role'
  | 'phone'
  | 'vehicle'
  | 'vehiclePhotos'
  | 'documents'
  | 'profilePhoto'
  | 'done';

export interface OnboardingFormData {
  // Étape 2 : Rôle
  role: 'passenger' | 'driver';
  schoolRole: 'Etudiant' | 'Professeur' | 'Administrateur';
  // Étape 3 : Téléphone
  phoneNumber: string;
  // Étape 4 : Véhicule
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  vehicleLicensePlate: string;
  vehicleCapacity: number;
  // Étape 5 : Photos
  vehicleId: string;
  vehiclePhotoUrls: string[];
  // Étape 6 : Documents (map docType → fileUrl + expiryDate)
  documents: Record<string, { fileUrl: string; expiryDate?: string }>;
  // Étape 7 : Profil
  avatarUrl: string;
}

interface UseOnboardingReturn {
  step: OnboardingStep;
  formData: OnboardingFormData;
  isLoading: boolean;
  error: string | null;
  showAbandonWarning: boolean;
  // Navigation
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  // Setters
  setField: <K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => void;
  // Actions API
  submitPolitics: () => Promise<void>;
  submitRole: () => Promise<void>;
  submitPhone: () => Promise<void>;
  submitVehicle: () => Promise<void>;
  submitVehiclePhotos: () => Promise<void>;
  submitDocument: (docType: string, fileUrl: string, expiryDate?: string) => Promise<void>;
  submitProfilePicture: () => Promise<void>;
  confirmAbandonDriver: () => Promise<void>;
  cancelAbandonDriver: () => void;
  triggerAbandonWarning: () => void;
}

const INITIAL_FORM: OnboardingFormData = {
  role: 'passenger',
  schoolRole: 'Etudiant',
  phoneNumber: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: new Date().getFullYear(),
  vehicleColor: '',
  vehicleLicensePlate: '',
  vehicleCapacity: 4,
  vehicleId: '',
  vehiclePhotoUrls: [],
  documents: {},
  avatarUrl: '',
};

async function apiPost(path: string, body?: unknown): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const res = await fetch(`/api/onboarding/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: json?.error ?? 'Erreur réseau' };
  return { success: true, data: json };
}

export function useOnboarding(): UseOnboardingReturn {
  const [step, setStep] = useState<OnboardingStep>('politics');
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAbandonWarning, setShowAbandonWarning] = useState(false);

  const setField = useCallback(<K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  // Calcul de la séquence d'étapes selon le rôle
  const getStepSequence = useCallback((role: 'passenger' | 'driver'): OnboardingStep[] => {
    const base: OnboardingStep[] = ['politics', 'role', 'phone'];
    if (role === 'driver') {
      base.push('vehicle', 'vehiclePhotos', 'documents');
    }
    base.push('profilePhoto');
    return base;
  }, []);

  const goToNextStep = useCallback(() => {
    const sequence = getStepSequence(formData.role);
    const currentIndex = sequence.indexOf(step);
    if (currentIndex < sequence.length - 1) {
      setStep(sequence[currentIndex + 1]);
    } else {
      setStep('done');
    }
    setError(null);
  }, [step, formData.role, getStepSequence]);

  const goToPreviousStep = useCallback(() => {
    const sequence = getStepSequence(formData.role);
    const currentIndex = sequence.indexOf(step);
    if (currentIndex > 0) {
      setStep(sequence[currentIndex - 1]);
    }
    setError(null);
  }, [step, formData.role, getStepSequence]);

  // ── Actions API ──────────────────────────────────────────────────────────

  const submitPolitics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiPost('accept-politics');
      if (!result.success) { setError(result.error ?? 'Erreur'); return; }
      goToNextStep();
    } finally {
      setIsLoading(false);
    }
  }, [goToNextStep]);

  const submitRole = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiPost('set-role', {
        role: formData.role,
        schoolRole: formData.schoolRole,
      });
      if (!result.success) { setError(result.error ?? 'Erreur'); return; }
      goToNextStep();
    } finally {
      setIsLoading(false);
    }
  }, [formData.role, formData.schoolRole, goToNextStep]);

  const submitPhone = useCallback(async () => {
    if (!formData.phoneNumber.trim()) {
      setError('Veuillez saisir votre numéro de téléphone.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiPost('set-phone', { phoneNumber: formData.phoneNumber });
      if (!result.success) { setError(result.error ?? 'Erreur'); return; }
      goToNextStep();
    } finally {
      setIsLoading(false);
    }
  }, [formData.phoneNumber, goToNextStep]);

  const submitVehicle = useCallback(async () => {
    const { vehicleMake, vehicleModel, vehicleYear, vehicleColor, vehicleLicensePlate, vehicleCapacity } = formData;
    if (!vehicleMake || !vehicleModel || !vehicleColor || !vehicleLicensePlate) {
      setError('Veuillez remplir tous les champs du véhicule.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiPost('submit-vehicle', {
        make: vehicleMake,
        model: vehicleModel,
        year: vehicleYear,
        color: vehicleColor,
        licensePlate: vehicleLicensePlate,
        capacity: vehicleCapacity,
      });
      if (!result.success) { setError(result.error ?? 'Erreur'); return; }
      const data = result.data as { vehicleId: string };
      setField('vehicleId', data.vehicleId);
      goToNextStep();
    } finally {
      setIsLoading(false);
    }
  }, [formData, setField, goToNextStep]);

  const submitVehiclePhotos = useCallback(async () => {
    if (formData.vehiclePhotoUrls.length === 0) {
      setError('Veuillez ajouter au moins une photo de votre véhicule.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiPost('submit-vehicle-photos', {
        vehicleId: formData.vehicleId,
        photoUrls: formData.vehiclePhotoUrls,
      });
      if (!result.success) { setError(result.error ?? 'Erreur'); return; }
      goToNextStep();
    } finally {
      setIsLoading(false);
    }
  }, [formData.vehicleId, formData.vehiclePhotoUrls, goToNextStep]);

  const submitDocument = useCallback(async (docType: string, fileUrl: string, expiryDate?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiPost('submit-document', {
        vehicleId: formData.vehicleId,
        documentType: docType,
        fileUrl,
        expiryDate,
      });
      if (!result.success) { setError(result.error ?? 'Erreur'); return; }
      setField('documents', { ...formData.documents, [docType]: { fileUrl, expiryDate } });
    } finally {
      setIsLoading(false);
    }
  }, [formData.vehicleId, formData.documents, setField]);

  const submitProfilePicture = useCallback(async () => {
    if (!formData.avatarUrl) {
      setError('Veuillez sélectionner une photo de profil.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiPost('set-profile-picture', { avatarUrl: formData.avatarUrl });
      if (!result.success) { setError(result.error ?? 'Erreur'); return; }
      goToNextStep();
    } finally {
      setIsLoading(false);
    }
  }, [formData.avatarUrl, goToNextStep]);

  // ── Abandon conducteur ───────────────────────────────────────────────────

  const triggerAbandonWarning = useCallback(() => setShowAbandonWarning(true), []);
  const cancelAbandonDriver = useCallback(() => setShowAbandonWarning(false), []);

  const confirmAbandonDriver = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiPost('abandon-driver');
      if (!result.success) { setError(result.error ?? 'Erreur'); return; }
      setField('role', 'passenger');
      setShowAbandonWarning(false);
      // Sauter directement à la photo de profil
      setStep('profilePhoto');
    } finally {
      setIsLoading(false);
    }
  }, [setField]);

  return {
    step,
    formData,
    isLoading,
    error,
    showAbandonWarning,
    goToNextStep,
    goToPreviousStep,
    setField,
    submitPolitics,
    submitRole,
    submitPhone,
    submitVehicle,
    submitVehiclePhotos,
    submitDocument,
    submitProfilePicture,
    confirmAbandonDriver,
    cancelAbandonDriver,
    triggerAbandonWarning,
  };
}
