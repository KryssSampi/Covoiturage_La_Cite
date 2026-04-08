/**
 * VehicleTab — Onglet "Véhicule" (Refondu v7 — Architecture modulaire)
 * Couche de composition pure : importe hooks et sous-composants dumb.
 * Aucune logique métier, gestion d'état ou effet secondaire dans ce fichier.
 */

"use client";

import { useCallback } from "react";
import Image from "next/image";
import {
  FaCar,
  FaUsers,
  FaUpload,
  FaFileLines,
  FaPlus,
  FaSpinner,
  FaToggleOn,
  FaToggleOff,
  FaCamera,
  FaCheck,
} from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";
import type { VehicleInfo, AdminEditableField } from "../../types/profile.types";
import { mockVehicles } from "../../fixtures/vehicles.fixtures";
import { VEHICLE_MAKES, VEHICLE_COLORS, VEHICLE_YEARS, getModelsByMake } from "@/features/onboarding/data/vehicles";
import {
  useVehicleState,
  StatusBadge,
  StatusIcons,
  VehicleCard,
  AddVehicleCard,
  VehicleField,
} from "@/features/profile/setting";
import { AddVehicleOverlay } from "./overlays/AddVehicleOverlay";
import { DocumentUploadOverlay } from "./overlays/DocumentUploadOverlay";
import { translations } from "./constants/vehicleTranslations";

const VEHICLE_PHOTO_FALLBACK = "/assets/placeholder/no-car-image.jpg";
const ALL_DOCUMENT_TYPES = ["DriversLicense", "Insurance", "VehicleRegistration", "CriminalRecord"] as const;

interface VehicleTabProps {
  vehicle: VehicleInfo | null;
  vehicles?: VehicleInfo[];
  onChange: (updates: Partial<VehicleInfo>) => void;
  onSelectVehicle?: (vehicleId: string) => void;
  onSetActive?: (vehicleId: string) => void;
  allowVehicleCreation?: boolean;
  onUploadDocument?: () => void;
  onHasChangesChange?: (hasChanges: boolean) => void;
}

export function VehicleTab({
  vehicle,
  vehicles = [],
  onChange,
  onSelectVehicle,
  onSetActive,
  allowVehicleCreation = true,
  onHasChangesChange,
}: VehicleTabProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;
  const declaredCategories = vehicle?.requiredDocumentCategories ?? [];
  const inferredHasPhotos = declaredCategories.includes("vehiclePhotos") || !!vehicle?.requiredPhotoType;
  const shouldInferDocsFallback =
    !!vehicle?.adminRequestDocuments &&
    declaredCategories.length === 0 &&
    !vehicle?.requiredPhotoType &&
    (vehicle?.requiredDocumentTypes?.length ?? 0) === 0;
  const inferredHasDocuments =
    declaredCategories.includes("vehicleDocuments") ||
    (vehicle?.requiredDocumentTypes?.length ?? 0) > 0 ||
    shouldInferDocsFallback;
  const effectiveRequiredCategories = [
    ...(inferredHasPhotos ? ["vehiclePhotos" as const] : []),
    ...(inferredHasDocuments ? ["vehicleDocuments" as const] : []),
  ];
  const effectiveRequiredDocumentTypes = inferredHasDocuments
    ? (vehicle?.requiredDocumentTypes && vehicle.requiredDocumentTypes.length > 0
      ? vehicle.requiredDocumentTypes
      : [...ALL_DOCUMENT_TYPES])
    : [];
  const effectiveRequiredPhotoType = inferredHasPhotos ? (vehicle?.requiredPhotoType ?? "both") : undefined;

  const {
    uploading,
    showAddOverlay,
    setShowAddOverlay,
    showDocOverlay,
    setShowDocOverlay,
    submittedDocuments,
    handleToggleActive,
    handleSelectVehicle,
    handleVehicleCreated,
    handleDocumentSubmitted,
    handleSave,
    hasChanges,
    passengerSeats,
    maxPassengerSeats,
    isFieldEditable,
  } = useVehicleState({ vehicle, onChange, onSelectVehicle, onSetActive, onHasChangesChange });

  const handleFieldChange = useCallback((field: AdminEditableField, value: string | number) => {
    onChange({ [field]: value });
  }, [onChange]);

  if (!vehicle) {
    return (
      <div>
        <p className="mb-4 text-sm text-gray-500">{t.description}</p>
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <FaCar size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">{t.noVehicle}</p>
          <p className="text-xs text-gray-400 mt-1">{t.noVehicleDesc}</p>
          {!allowVehicleCreation && (
            <p className="mt-4 text-xs font-medium text-amber-700">
              {isFR
                ? "Ajout/modification structurelle du véhicule réservé à l'administration."
                : "Vehicle creation/structural updates are restricted to administrators."}
            </p>
          )}
          {allowVehicleCreation && (
            <button
              type="button"
              onClick={() => setShowAddOverlay(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <FaPlus size={12} />
              {t.addVehicle}
            </button>
          )}
        </div>
        {allowVehicleCreation && (
          <AddVehicleOverlay
            key={showAddOverlay ? "open" : "closed"}
            isOpen={showAddOverlay}
            onClose={() => setShowAddOverlay(false)}
            onVehicleCreated={handleVehicleCreated}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-sm text-gray-500">{t.description}</p>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges}
          className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            hasChanges
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {hasChanges ? <FaUpload size={11} /> : <FaCheck size={11} />}
          {hasChanges
            ? (isFR ? "Enregistrer les modifications" : "Save changes")
            : (isFR ? "Aucune modification" : "No changes")}
        </button>
      </div>

      {/* Véhicule actif — Layout principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex h-full flex-col items-center">
          <p className="mb-2 w-full text-sm font-medium text-gray-700 text-center lg:text-left">{isFR ? "Photo du véhicule" : "Vehicle photo"}</p>
          <div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-gray-100 lg:h-full lg:min-h-[320px] lg:max-w-none">
            <Image
              src={vehicle.photoUrl ?? VEHICLE_PHOTO_FALLBACK}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover object-center"
            />
          </div>
        </div>

        <div className="space-y-3">
          <VehicleField
            field="make"
            label={t.make}
            value={vehicle.make}
            editable={isFieldEditable("make")}
            options={VEHICLE_MAKES.map((m) => ({ label: m.make, value: m.make }))}
            onChange={handleFieldChange}
          />
          <VehicleField
            field="model"
            label={t.model}
            value={vehicle.model}
            editable={isFieldEditable("model")}
            options={getModelsByMake(vehicle.make).map((m) => ({ label: m, value: m }))}
            onChange={handleFieldChange}
          />
          <VehicleField
            field="year"
            label={t.year}
            value={vehicle.year}
            editable={isFieldEditable("year")}
            options={VEHICLE_YEARS.map((y) => ({ label: String(y), value: y }))}
            onChange={handleFieldChange}
          />
          <VehicleField
            field="color"
            label={t.color}
            value={vehicle.color}
            editable={isFieldEditable("color")}
            options={VEHICLE_COLORS.map((c) => ({ label: c.label, value: c.value }))}
            onChange={handleFieldChange}
          />
          <VehicleField
            field="licensePlate"
            label={t.plate}
            value={vehicle.licensePlate}
            editable={isFieldEditable("licensePlate")}
            onChange={handleFieldChange}
          />

          {/* Places passagers — max = capacité réelle du véhicule - 1 (conducteur) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t.seats}</label>
            <div className="relative">
              <select
                value={passengerSeats}
                onChange={(e) => onChange({ maxSeats: Number(e.target.value) + 1 })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none appearance-none"
              >
                {Array.from({ length: maxPassengerSeats }, (_, i) => i + 1).map((c) => (
                  <option key={c} value={c}>
                    {c} {isFR ? `place${c > 1 ? "s" : ""}` : `seat${c > 1 ? "s" : ""}`}
                  </option>
                ))}
              </select>
              <FaUsers size={12} className="absolute right-3 top-3 text-gray-400" />
              <span className="absolute right-8 top-3 text-gray-400">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges d'état */}
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge
          icon={vehicle.isActive ? StatusIcons.active : StatusIcons.inactive}
          label={vehicle.isActive ? t.active : t.inactive}
          variant={vehicle.isActive ? "green" : "yellow"}
        />
        <StatusBadge
          icon={vehicle.isValidated ? StatusIcons.validated : StatusIcons.notValidated}
          label={vehicle.isValidated ? t.validated : t.notValidated}
          variant={vehicle.isValidated ? "blue" : "yellow"}
        />
        {vehicle.adminRequestDocuments && (
          <StatusBadge
            icon={StatusIcons.documentsRequired}
            label={t.documentsRequired}
            variant="red"
          />
        )}
      </div>

      {/* Toggle véhicule actif — grisé si véhicule non validé */}
      <div className={`mt-4 flex items-center justify-between rounded-xl border p-4 ${
        !vehicle.isValidated
          ? "border-gray-200 bg-gray-100 opacity-60"
          : "border-gray-100 bg-white"
      }`}>
        <div>
          <span className="text-sm font-medium text-gray-700">{t.toggleActive}</span>
          <p className="text-xs text-gray-400 mt-0.5">
            {!vehicle.isValidated
              ? (isFR ? "Véhicule en attente de validation" : "Vehicle pending validation")
              : (isFR ? "Un seul véhicule peut être actif à la fois" : "Only one vehicle can be active at a time")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={!vehicle.isValidated}
          className={`text-2xl transition-colors ${!vehicle.isValidated ? "cursor-not-allowed" : ""}`}
          style={{ color: vehicle.isActive ? "#22c55e" : "#9ca3af" }}
        >
          {vehicle.isActive ? <FaToggleOn size={32} /> : <FaToggleOff size={32} />}
        </button>
      </div>

      {/* Section documents requis */}
      {vehicle.adminRequestDocuments && (
        <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <FaFileLines size={14} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-orange-700">{t.documentsList}</h3>
          </div>
          <ul className="mb-4 space-y-1.5 text-sm text-gray-600">
            {inferredHasPhotos && (
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCamera size={10} className="text-blue-500" />
                  <span className="font-medium text-gray-700">{t.photoCategory}</span>
                  {effectiveRequiredPhotoType && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {effectiveRequiredPhotoType === "interior" ? t.photoInterior
                        : effectiveRequiredPhotoType === "exterior" ? t.photoExterior
                        : t.photoBoth}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{isFR ? "Via l'overlay" : "Via overlay"}</span>
              </li>
            )}
            {effectiveRequiredDocumentTypes.map((docType) => {
              const isSubmitted = !!submittedDocuments[docType];
              const docLabels: Record<string, { fr: string; en: string }> = {
                DriversLicense: { fr: "Permis de conduire", en: "Driver's License" },
                Insurance: { fr: "Assurance automobile", en: "Auto Insurance" },
                VehicleRegistration: { fr: "Immatriculation du véhicule", en: "Vehicle Registration" },
                CriminalRecord: { fr: "Vérification des antécédents judiciaires", en: "Criminal Record Check" },
              };
              const label = docLabels[docType]?.[isFR ? "fr" : "en"] ?? docType;
              return (
                <li key={docType} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isSubmitted ? (
                      <FaUpload size={10} className="text-green-500" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                    )}
                    <span className={isSubmitted ? "text-green-600 line-through" : ""}>{label}</span>
                  </div>
                  {isSubmitted && (
                    <span className="text-xs font-medium text-green-600">
                      {isFR ? "Soumis" : "Submitted"}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setShowDocOverlay(true)}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {uploading ? (
              <FaSpinner size={12} className="animate-spin" />
            ) : (
              <FaUpload size={12} />
            )}
            {uploading ? (isFR ? "Téléversement..." : "Uploading...") : t.uploadDocs}
          </button>
        </div>
      )}

      {/* Section "Vos véhicules" */}
      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-4xl" style={{ width: "100%" }}>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">{t.yourVehicles}</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {allowVehicleCreation && <AddVehicleCard onClick={() => setShowAddOverlay(true)} />}
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isActive={v.id === vehicle.id}
                onSelect={() => handleSelectVehicle(v)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Overlays */}
      {allowVehicleCreation && (
        <AddVehicleOverlay
          key={showAddOverlay ? "open" : "closed"}
          isOpen={showAddOverlay}
          onClose={() => setShowAddOverlay(false)}
          onVehicleCreated={handleVehicleCreated}
        />
      )}

      <DocumentUploadOverlay
        isOpen={showDocOverlay}
        onClose={() => setShowDocOverlay(false)}
        documents={submittedDocuments}
        onDocumentSubmitted={handleDocumentSubmitted}
        requiredDocumentTypes={effectiveRequiredDocumentTypes}
        requiredCategories={effectiveRequiredCategories}
        requiredPhotoType={effectiveRequiredPhotoType}
      />
    </div>
  );
}
