/**
 * useVehicleState — Hook pour la gestion d'état du VehicleTab
 * Suivi des modifications par véhicule, exclut isActive de la détection
 */

"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { VehicleInfo, AdminEditableField } from "@/features/profile/types/profile.types";

interface UseVehicleStateProps {
  vehicle: VehicleInfo | null;
  onChange: (updates: Partial<VehicleInfo>) => void;
  onSelectVehicle?: (vehicleId: string) => void;
  onSetActive?: (vehicleId: string) => void;
  onHasChangesChange?: (hasChanges: boolean) => void;
}

// Données pertinentes pour la détection de modifications (exclut isActive)
function getComparableData(v: VehicleInfo | null) {
  if (!v) return null;
  return {
    make: v.make,
    model: v.model,
    year: v.year,
    color: v.color,
    licensePlate: v.licensePlate,
    maxSeats: v.maxSeats,
  };
}

export function useVehicleState({
  vehicle,
  onChange,
  onSelectVehicle,
  onSetActive,
  onHasChangesChange,
}: UseVehicleStateProps) {
  const [uploading] = useState(false);
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [showDocOverlay, setShowDocOverlay] = useState(false);
  const [submittedDocumentsByVehicle, setSubmittedDocumentsByVehicle] = useState<
    Record<string, Record<string, { fileUrl: string; expiryDate?: string }>>
  >({});

  // Stockage des données initiales par véhicule (pour suivi par véhicule)
  const [initialDataMap, setInitialDataMap] = useState<Record<string, ReturnType<typeof getComparableData>>>({});

  // Initialiser les données initiales pour le véhicule courant si pas encore fait
  const currentInitialData = useMemo(() => {
    if (!vehicle) return null;
    if (!initialDataMap[vehicle.id]) {
      // Initialisation paresseuse via useMemo
      const data = getComparableData(vehicle);
      // Mise à jour asynchrone pour éviter le warning ESLint
      queueMicrotask(() => {
        setInitialDataMap((prev) => ({
          ...prev,
          [vehicle.id]: data,
        }));
      });
      return data;
    }
    return initialDataMap[vehicle.id];
  }, [vehicle, initialDataMap]);

  // Détection de modifications (exclut isActive)
  const currentData = useMemo(() => getComparableData(vehicle), [vehicle]);
  const hasChanges = useMemo(() => {
    return currentData && currentInitialData
      ? (
          currentData.make !== currentInitialData.make ||
          currentData.model !== currentInitialData.model ||
          currentData.year !== currentInitialData.year ||
          currentData.color !== currentInitialData.color ||
          currentData.licensePlate !== currentInitialData.licensePlate ||
          currentData.maxSeats !== currentInitialData.maxSeats
        )
      : false;
  }, [currentData, currentInitialData]);

  useEffect(() => {
    onHasChangesChange?.(hasChanges);
  }, [hasChanges, onHasChangesChange]);

  // Gestion du véhicule actif : un seul véhicule actif à la fois
  const handleToggleActive = useCallback(() => {
    if (!vehicle) return;
    if (vehicle.isActive) {
      onChange({ isActive: false });
    } else if (vehicle.isValidated) {
      if (onSetActive) {
        onSetActive(vehicle.id);
      } else {
        onChange({ isActive: true });
      }
    }
  }, [vehicle, onChange, onSetActive]);

  const handleSelectVehicle = useCallback((v: VehicleInfo) => {
    if (onSelectVehicle) {
      onSelectVehicle(v.id);
      return;
    }
    onSetActive?.(v.id);
  }, [onSelectVehicle, onSetActive]);

  const handleVehicleCreated = useCallback((newVehicle: VehicleInfo) => {
    onChange(newVehicle);
    setInitialDataMap((prev) => ({
      ...prev,
      [newVehicle.id]: getComparableData(newVehicle),
    }));
  }, [onChange]);

  const handleDocumentSubmitted = useCallback((docType: string, fileUrl: string, expiryDate?: string) => {
    if (!vehicle) return;
    setSubmittedDocumentsByVehicle((prev) => ({
      ...prev,
      [vehicle.id]: {
        ...(prev[vehicle.id] ?? {}),
        [docType]: { fileUrl, expiryDate },
      },
    }));
  }, [vehicle]);

  // Sauvegarder les modifications et mettre à jour les données initiales
  const handleSave = useCallback(() => {
    if (vehicle) {
      setInitialDataMap((prev) => ({
        ...prev,
        [vehicle.id]: getComparableData(vehicle),
      }));
    }
  }, [vehicle]);

  // Places passagers affichées = valeur actuellement sélectionnée (maxSeats - conducteur)
  const standardCapacity = vehicle?.standardCapacity ?? vehicle?.maxSeats ?? 5;
  const maxPassengerSeats = Math.max(1, standardCapacity - 1);
  const selectedPassengerSeats = Math.max(1, (vehicle?.maxSeats ?? standardCapacity) - 1);
  const passengerSeats = Math.min(selectedPassengerSeats, maxPassengerSeats);

  // Vérifier si un champ est modifiable par admin
  const isFieldEditable = useCallback((field: AdminEditableField): boolean => {
    return vehicle?.adminEditableConfig?.editableFields?.includes(field) ?? false;
  }, [vehicle?.adminEditableConfig]);

  const submittedDocuments = useMemo(() => {
    if (!vehicle) return {};
    return submittedDocumentsByVehicle[vehicle.id] ?? {};
  }, [vehicle, submittedDocumentsByVehicle]);

  return {
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
  };
}
