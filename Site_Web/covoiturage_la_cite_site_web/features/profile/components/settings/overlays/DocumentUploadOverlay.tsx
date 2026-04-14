/**
 * DocumentUploadOverlay — Overlay de téléversement de documents requis
 * Composant dumb : reçoit toute la logique via le hook useDocumentUpload
 */

"use client";

import { useEffect } from "react";
import { FaXmark, FaCircleCheck, FaCamera } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";
import { useDocumentUpload } from "@/features/profile/setting/hooks/useDocumentUpload";
import { translations } from "../constants/vehicleTranslations";
import { DocumentCard } from "./DocumentCard";

interface DocumentUploadOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Record<string, { fileUrl: string; expiryDate?: string }>;
  onDocumentSubmitted: (docType: string, fileUrl: string, expiryDate?: string) => void;
  requiredDocumentTypes?: string[];
  requiredCategories?: ("vehiclePhotos" | "vehicleDocuments")[];
  requiredPhotoType?: "interior" | "exterior" | "both";
}

const ALL_DOCS = [
  { type: "DriversLicense", labelFR: "Permis de conduire", labelEN: "Driver's License", descriptionFR: "Recto/verso de votre permis de conduire provincial.", descriptionEN: "Front/back of your provincial driver license.", requiresExpiry: true },
  { type: "Insurance", labelFR: "Assurance automobile", labelEN: "Auto Insurance", descriptionFR: "Certificat d'assurance en cours de validité.", descriptionEN: "Valid insurance certificate.", requiresExpiry: true },
  { type: "VehicleRegistration", labelFR: "Immatriculation du véhicule", labelEN: "Vehicle Registration", descriptionFR: "Certificat d'immatriculation (carte grise).", descriptionEN: "Registration certificate.", requiresExpiry: false },
  { type: "CriminalRecord", labelFR: "Vérification des antécédents judiciaires", labelEN: "Criminal Record Check", descriptionFR: "Récente (moins de 6 mois).", descriptionEN: "Recent (less than 6 months).", requiresExpiry: false },
];

export function DocumentUploadOverlay({
  isOpen,
  onClose,
  documents,
  onDocumentSubmitted,
  requiredDocumentTypes,
  requiredCategories,
  requiredPhotoType,
}: DocumentUploadOverlayProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  const {
    activeForm,
    setActiveForm,
    fileInputRef,
    photoUrls,
    setPhotoUrls,
    handlePhotoUpload,
    removePhoto,
    MAX_PHOTOS,
  } = useDocumentUpload();

  const categories = requiredCategories ?? [];
  const hasPhotosCategory = categories.includes("vehiclePhotos") || !!requiredPhotoType;
  const hasDocsCategory =
    categories.includes("vehicleDocuments") ||
    (requiredDocumentTypes?.length ?? 0) > 0 ||
    (!hasPhotosCategory && categories.length === 0);
  const docsToShow = hasDocsCategory
    ? (
      requiredDocumentTypes && requiredDocumentTypes.length > 0
        ? ALL_DOCS.filter((doc) => requiredDocumentTypes.includes(doc.type))
        : ALL_DOCS
    )
    : [];

  const submittedDocsCount = docsToShow.filter((doc) => documents[doc.type]).length;
  const allDocsSubmitted = docsToShow.length > 0 && docsToShow.every((doc) => documents[doc.type]);

  const photoTypeLabel = requiredPhotoType === "interior" ? t.photoInterior
    : requiredPhotoType === "exterior" ? t.photoExterior
    : t.photoBoth;

  useEffect(() => {
    if (!isOpen) return;

    setPhotoUrls([]);
    if (hasPhotosCategory && !hasDocsCategory) {
      setActiveForm("photos");
      return;
    }
    setActiveForm("documents");
  }, [isOpen, hasPhotosCategory, hasDocsCategory, setPhotoUrls, setActiveForm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">{t.documentsList}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <FaXmark size={16} />
          </button>
        </div>

        {hasPhotosCategory && hasDocsCategory && (
          <div className="mb-4 flex gap-2">
            <button type="button" onClick={() => setActiveForm("photos")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeForm === "photos" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {t.photoCategory}
            </button>
            <button type="button" onClick={() => setActiveForm("documents")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeForm === "documents" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {t.docCategory}
            </button>
          </div>
        )}

        {hasPhotosCategory && (activeForm === "photos" || !hasDocsCategory) && (
          <div className="mb-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-3">
              <h4 className="text-sm font-semibold text-blue-700 mb-1">{t.photoCategory}</h4>
              <p className="text-xs text-blue-500">{t.selectPhotoType}: <strong>{photoTypeLabel}</strong></p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {photoUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600">×</button>
                </div>
              ))}
              {photoUrls.length < MAX_PHOTOS && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
                  <FaCamera size={20} /><span className="text-xs">{isFR ? "Photo" : "Photo"}</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
            <p className="text-xs text-gray-400 text-center mt-2">{photoUrls.length} / {MAX_PHOTOS} {isFR ? translations.fr.photosAdded : translations.en.photosAdded}</p>
          </div>
        )}

        {hasDocsCategory && (activeForm === "documents" || !hasPhotosCategory) && docsToShow.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">{t.docCategory}</h4>
            <div className="flex flex-col gap-3">
              {docsToShow.map((doc) => (
                <DocumentCard key={doc.type} doc={doc} isFR={isFR} submitted={documents[doc.type]} onUpload={onDocumentSubmitted} />
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{submittedDocsCount} / {docsToShow.length} {t.docsSubmitted}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${(submittedDocsCount / docsToShow.length) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {allDocsSubmitted && (
          <div className="mt-4 rounded-xl bg-green-100 p-3 text-center text-sm font-medium text-green-700">
            <FaCircleCheck className="inline mr-1" size={12} />
            {isFR ? "Tous les documents ont été soumis" : "All documents submitted"}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onClose} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}
