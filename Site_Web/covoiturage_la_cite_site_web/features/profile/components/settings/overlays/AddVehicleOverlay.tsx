/**
 * AddVehicleOverlay — Overlay d'ajout de véhicule en 3 étapes
 * Composant dumb : reçoit toute la logique via le hook useAddVehicleOverlay
 */

"use client";

import {
  FaXmark,
  FaChevronLeft,
  FaChevronRight,
  FaCircleCheck,
  FaSpinner,
  FaCamera,
} from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";
import type { VehicleInfo } from "@/features/profile/types/profile.types";
import { VEHICLE_MAKES, VEHICLE_COLORS, VEHICLE_YEARS, getMaxPassengerSeatsByModel, getModelsByMake } from "@/features/onboarding/data/vehicles";
import { useAddVehicleOverlay } from "@/features/profile/setting/hooks/useAddVehicleOverlay";
import { translations } from "../constants/vehicleTranslations";
import { DocumentCard } from "./DocumentCard";

interface AddVehicleOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleCreated: (vehicle: VehicleInfo) => void;
}

const MAX_PHOTOS = 6;

export function AddVehicleOverlay({ isOpen, onClose, onVehicleCreated }: AddVehicleOverlayProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  const {
    step,
    formData,
    saving,
    maxPassengerSeats,
    requiredDocTypes,
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
  } = useAddVehicleOverlay(onVehicleCreated);

  if (!isOpen) return null;

  const models = getModelsByMake(formData.vehicleMake);
  const steps: { key: typeof step; label: string }[] = [
    { key: "description", label: t.stepDescription },
    { key: "photos", label: t.stepPhotos },
    { key: "documents", label: t.stepDocuments },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === step);
  const submittedCount = requiredDocTypes.filter(
    (doc) => formData.documents[doc]
  ).length;
  const nextDisabled = step === "description" ? !isDescriptionStepValid : !isPhotosStepValid;
  const submitDisabled = saving || !isDocumentsStepValid || !isDescriptionStepValid || !isPhotosStepValid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">{t.addVehicle}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <FaXmark size={16} />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="mb-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                i < currentStepIndex ? "bg-green-500 text-white" : i === currentStepIndex ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {i < currentStepIndex ? <FaCircleCheck size={12} /> : i + 1}
              </div>
              <span className={`text-xs ${i === currentStepIndex ? "font-medium text-blue-600" : "text-gray-400"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className="h-px w-4 bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* Étape 1: Description */}
        {step === "description" && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">{isFR ? "Informations sur le véhicule" : "Vehicle Information"}</h2>
              <p className="mt-1 text-sm text-gray-500">{isFR ? "Ces informations seront visibles par vos passagers." : "This information will be visible to your passengers."}</p>
            </div>
            <div>
              <label htmlFor="v-make" className="mb-1 block text-sm font-medium text-gray-700">{t.make}</label>
              <select
                id="v-make"
                value={formData.vehicleMake}
                onChange={(e) => {
                  setField("vehicleMake", e.target.value);
                  setField("vehicleModel", "");
                  setField("vehicleCapacity", 1);
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">{t.selectMake}</option>
                {VEHICLE_MAKES.map((m) => (<option key={m.make} value={m.make}>{m.make}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="v-model" className="mb-1 block text-sm font-medium text-gray-700">{t.model}</label>
              <select
                id="v-model"
                value={formData.vehicleModel}
                onChange={(e) => {
                  const selectedModel = e.target.value;
                  setField("vehicleModel", selectedModel);
                  if (selectedModel) {
                    setField("vehicleCapacity", getMaxPassengerSeatsByModel(formData.vehicleMake, selectedModel));
                  }
                }}
                disabled={!formData.vehicleMake}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50">
                <option value="">{t.selectModel}</option>
                {models.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="v-year" className="mb-1 block text-sm font-medium text-gray-700">{t.year}</label>
                <select id="v-year" value={formData.vehicleYear} onChange={(e) => setField("vehicleYear", Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {VEHICLE_YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="v-color" className="mb-1 block text-sm font-medium text-gray-700">{t.color}</label>
                <select id="v-color" value={formData.vehicleColor} onChange={(e) => setField("vehicleColor", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">{t.color}</option>
                  {VEHICLE_COLORS.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="v-plate" className="mb-1 block text-sm font-medium text-gray-700">{t.plate}</label>
              <input id="v-plate" type="text" value={formData.vehicleLicensePlate} onChange={(e) => setField("vehicleLicensePlate", e.target.value.toUpperCase())}
                placeholder={t.platePlaceholder} maxLength={10}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="v-capacity" className="mb-1 block text-sm font-medium text-gray-700">{t.seats}</label>
              <select
                id="v-capacity"
                value={formData.vehicleCapacity}
                onChange={(e) => setField("vehicleCapacity", Number(e.target.value))}
                disabled={!formData.vehicleModel}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                {!formData.vehicleModel ? (
                  <option value={1}>{t.selectModelFirstForSeats}</option>
                ) : (
                  Array.from({ length: maxPassengerSeats }, (_, i) => i + 1).map((c) => (
                    <option key={c} value={c}>{c} {isFR ? `place${c > 1 ? "s" : ""}` : `seat${c > 1 ? "s" : ""}`}</option>
                  ))
                )}
              </select>
              <p className="mt-1 text-xs text-gray-500">{t.seatsAvailabilityHint}</p>
              {formData.vehicleModel && (
                <p className="mt-1 text-xs text-blue-600">
                  {isFR
                    ? `Maximum pour ${formData.vehicleModel}: ${maxPassengerSeats} place${maxPassengerSeats > 1 ? "s" : ""} passager.`
                    : `Maximum for ${formData.vehicleModel}: ${maxPassengerSeats} passenger seat${maxPassengerSeats > 1 ? "s" : ""}.`}
                </p>
              )}
            </div>
            {!isDescriptionStepValid && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                {t.completeRequiredFields}
              </p>
            )}
          </div>
        )}

        {/* Étape 2: Photos */}
        {step === "photos" && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">{isFR ? "Photos du véhicule" : "Vehicle Photos"}</h2>
              <p className="mt-1 text-sm text-gray-500">{isFR ? `Ajoutez jusqu'à ${MAX_PHOTOS} photos de votre véhicule.` : `Add up to ${MAX_PHOTOS} photos of your vehicle.`}</p>
              <p className="mt-1 text-xs text-blue-600">{t.firstPhotoDefaultHint}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {formData.vehiclePhotoUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600">×</button>
                </div>
              ))}
              {formData.vehiclePhotoUrls.length < MAX_PHOTOS && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
                  <FaCamera size={20} /><span className="text-xs">{isFR ? "Photo" : "Photo"}</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple capture="environment" onChange={handlePhotoUpload} className="hidden" />
            <p className="text-xs text-gray-400 text-center">{formData.vehiclePhotoUrls.length} / {MAX_PHOTOS} {isFR ? translations.fr.photosAdded : translations.en.photosAdded}</p>
            {!isPhotosStepValid && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                {t.addAtLeastOnePhoto}
              </p>
            )}
          </div>
        )}

        {/* Étape 3: Documents */}
        {step === "documents" && (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">{isFR ? "Documents conducteur" : "Driver Documents"}</h2>
              <p className="mt-1 text-sm text-gray-500">{submittedCount} / 4 {isFR ? translations.fr.docsSubmitted : translations.en.docsSubmitted}</p>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${(submittedCount / requiredDocTypes.length) * 100}%` }} />
            </div>
            <div className="flex flex-col gap-3">
              {[
                { type: "DriversLicense", labelFR: "Permis de conduire", labelEN: "Driver's License", descriptionFR: "Recto/verso de votre permis de conduire provincial.", descriptionEN: "Front/back of your provincial driver license.", requiresExpiry: true },
                { type: "Insurance", labelFR: "Assurance automobile", labelEN: "Auto Insurance", descriptionFR: "Certificat d'assurance en cours de validité.", descriptionEN: "Valid insurance certificate.", requiresExpiry: true },
                { type: "VehicleRegistration", labelFR: "Immatriculation du véhicule", labelEN: "Vehicle Registration", descriptionFR: "Certificat d'immatriculation (carte grise).", descriptionEN: "Registration certificate.", requiresExpiry: false },
                { type: "CriminalRecord", labelFR: "Vérification des antécédents judiciaires", labelEN: "Criminal Record Check", descriptionFR: "Récente (moins de 6 mois).", descriptionEN: "Recent (less than 6 months).", requiresExpiry: false },
              ].filter((doc) => requiredDocTypes.includes(doc.type as typeof requiredDocTypes[number])).map((doc) => (
                <DocumentCard key={doc.type} doc={doc} isFR={isFR} submitted={formData.documents[doc.type]} onUpload={handleDocumentUpload} />
              ))}
            </div>
            {!isDocumentsStepValid && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                {t.uploadAllRequiredDocuments}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {step !== "description" && (
            <button type="button" onClick={handlePrevious} className="flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
              <FaChevronLeft size={10} />{t.previous}
            </button>
          )}
          <div className="flex-1" />
          {step !== "documents" ? (
            <button
              type="button"
              onClick={() => {
                if (nextDisabled) return;
                handleNext();
              }}
              disabled={nextDisabled}
              className={`flex items-center gap-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                nextDisabled
                  ? "cursor-not-allowed bg-gray-200 text-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {t.next}<FaChevronRight size={10} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitDisabled}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <FaSpinner size={12} className="animate-spin" /> : <FaCircleCheck size={12} />}{t.submit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
