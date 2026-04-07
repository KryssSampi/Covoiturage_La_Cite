/**
 * useAddVehicleOverlay — Hook pour la logique de l'overlay d'ajout de véhicule
 */

"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import type { VehicleInfo } from "@/features/profile/types/profile.types";
import { getMaxPassengerSeatsByModel, getStandardCapacityByModel } from "@/features/onboarding/data/vehicles";

type VehicleAddStep = "description" | "photos" | "documents";

interface VehicleFormData {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  vehicleLicensePlate: string;
  vehicleCapacity: number;
  vehiclePhotoUrls: string[];
  documents: Record<string, { fileUrl: string; expiryDate?: string }>;
}

const MAX_PHOTOS = 6;
const REQUIRED_DOC_TYPES = ["DriversLicense", "Insurance", "VehicleRegistration", "CriminalRecord"] as const;

const INITIAL_FORM: VehicleFormData = {
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: new Date().getFullYear(),
  vehicleColor: "",
  vehicleLicensePlate: "",
  vehicleCapacity: 4,
  vehiclePhotoUrls: [],
  documents: {},
};

export function useAddVehicleOverlay(onVehicleCreated: (vehicle: VehicleInfo) => void) {
  const [step, setStep] = useState<VehicleAddStep>("description");
  const [formData, setFormData] = useState<VehicleFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxPassengerSeats = useMemo(
    () => getMaxPassengerSeatsByModel(formData.vehicleMake, formData.vehicleModel),
    [formData.vehicleMake, formData.vehicleModel]
  );

  const isDescriptionStepValid = useMemo(() => {
    const hasRequiredTextFields =
      formData.vehicleMake.trim().length > 0 &&
      formData.vehicleModel.trim().length > 0 &&
      formData.vehicleColor.trim().length > 0 &&
      formData.vehicleLicensePlate.trim().length > 0;

    const hasValidYear = Number.isFinite(formData.vehicleYear) && formData.vehicleYear > 0;
    const hasValidCapacity = formData.vehicleCapacity >= 1 && formData.vehicleCapacity <= maxPassengerSeats;

    return hasRequiredTextFields && hasValidYear && hasValidCapacity;
  }, [formData, maxPassengerSeats]);

  const isPhotosStepValid = formData.vehiclePhotoUrls.length > 0;
  const isDocumentsStepValid = REQUIRED_DOC_TYPES.every((docType) => !!formData.documents[docType]);

  const reset = useCallback(() => {
    setStep("description");
    setFormData(INITIAL_FORM);
    setSaving(false);
  }, []);

  const handleNext = useCallback(() => {
    setStep((prev) => (prev === "description" ? "photos" : "documents"));
  }, []);

  const handlePrevious = useCallback(() => {
    setStep((prev) => (prev === "photos" ? "description" : "documents"));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isDescriptionStepValid || !isPhotosStepValid || !isDocumentsStepValid) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));

    const passengerCapacity = Math.min(Math.max(1, formData.vehicleCapacity), maxPassengerSeats);
    const standardCapacity = getStandardCapacityByModel(formData.vehicleMake, formData.vehicleModel);

    const newVehicle: VehicleInfo = {
      id: `v${Date.now()}`,
      make: formData.vehicleMake.trim(),
      model: formData.vehicleModel.trim(),
      year: formData.vehicleYear,
      color: formData.vehicleColor.trim(),
      licensePlate: formData.vehicleLicensePlate.trim().toUpperCase(),
      maxSeats: passengerCapacity + 1,
      photoUrl: formData.vehiclePhotoUrls[0] ?? undefined,
      isActive: false,
      isValidated: false,
      adminRequestDocuments: true,
      standardCapacity,
      requiredDocumentCategories: ["vehiclePhotos", "vehicleDocuments"],
      requiredDocumentTypes: ["DriversLicense", "Insurance", "VehicleRegistration", "CriminalRecord"],
      requiredPhotoType: "both",
    };

    onVehicleCreated(newVehicle);
    setSaving(false);
    reset();
  }, [formData, isDescriptionStepValid, isPhotosStepValid, isDocumentsStepValid, maxPassengerSeats, onVehicleCreated, reset]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_PHOTOS - formData.vehiclePhotoUrls.length;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setFormData((prev) => ({ ...prev, vehiclePhotoUrls: [...prev.vehiclePhotoUrls, url] }));
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = "";
  }, [formData.vehiclePhotoUrls.length]);

  const removePhoto = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      vehiclePhotoUrls: prev.vehiclePhotoUrls.filter((_, i) => i !== index),
    }));
  }, []);

  const handleDocumentUpload = useCallback((docType: string, fileUrl: string, expiryDate?: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [docType]: { fileUrl, expiryDate } },
    }));
  }, []);

  const setField = useCallback(<K extends keyof VehicleFormData>(field: K, value: VehicleFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    step,
    formData,
    saving,
    maxPassengerSeats,
    requiredDocTypes: REQUIRED_DOC_TYPES,
    isDescriptionStepValid,
    isPhotosStepValid,
    isDocumentsStepValid,
    fileInputRef,
    handleNext,
    handlePrevious,
    handleSubmit,
    handlePhotoUpload,
    removePhoto,
    handleDocumentUpload,
    setField,
    reset,
    MAX_PHOTOS,
  };
}
