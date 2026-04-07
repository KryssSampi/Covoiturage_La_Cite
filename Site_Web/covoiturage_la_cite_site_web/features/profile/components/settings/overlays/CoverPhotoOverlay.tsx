"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FaXmark, FaUpload, FaEye, FaCheck, FaArrowsRotate, FaTrash } from "react-icons/fa6";
import { ImageComplianceNotice } from "./ImageComplianceNotice";

export interface UploadedCoverImage {
  id: string;
  url: string;
}

interface CoverPhotoOverlayProps {
  isOpen: boolean;
  isFR: boolean;
  currentCoverUrl: string;
  defaultCoverUrls: string[];
  uploadedCoverImages: UploadedCoverImage[];
  onUploadImages: (dataUrls: string[]) => void;
  onDeleteUploadedImage: (imageId: string) => void;
  onPreview: (url: string) => void;
  onSave: (url: string) => void;
  onClose: () => void;
}

export function CoverPhotoOverlay({
  isOpen,
  isFR,
  currentCoverUrl,
  defaultCoverUrls,
  uploadedCoverImages,
  onUploadImages,
  onDeleteUploadedImage,
  onPreview,
  onSave,
  onClose,
}: CoverPhotoOverlayProps) {
  const [selectedUrl, setSelectedUrl] = useState(currentCoverUrl);
  const [openedContextImageId, setOpenedContextImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contextRef = useRef<HTMLDivElement | null>(null);

  const isResetDisabled = selectedUrl === currentCoverUrl;

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!contextRef.current) return;
      if (!contextRef.current.contains(event.target as Node)) {
        setOpenedContextImageId(null);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const allImages = useMemo(() => {
    const defaults = defaultCoverUrls.map((url) => ({ id: `default-${url}`, url, source: "default" as const }));
    const uploaded = uploadedCoverImages.map((image) => ({ id: image.id, url: image.url, source: "uploaded" as const }));
    return [...defaults, ...uploaded];
  }, [defaultCoverUrls, uploadedCoverImages]);

  if (!isOpen) return null;

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (readerEvent) => resolve(readerEvent.target?.result as string);
            reader.readAsDataURL(file);
          })
      )
    ).then((dataUrls) => onUploadImages(dataUrls));

    if (event.target) event.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">{isFR ? "Choisir une photo de couverture" : "Choose cover photo"}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <FaXmark size={16} />
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs text-blue-700">
            {isFR
              ? "Importer n'applique pas automatiquement l'image. Vous pouvez prévisualiser avant de sélectionner."
              : "Uploading does not apply the image automatically. You can preview before selecting."}
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <FaUpload size={11} />
            {isFR ? "Importer" : "Upload"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
        </div>

        <div className="max-h-[52vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {allImages.map((image) => {
              const isSelected = selectedUrl === image.url;
              return (
                <div
                  key={image.id}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                    isSelected ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUrl(image.url);
                      if (image.source === "uploaded") {
                        setOpenedContextImageId((prev) => (prev === image.id ? null : image.id));
                      } else {
                        setOpenedContextImageId(null);
                      }
                    }}
                    className="block w-full text-left"
                  >
                    <div className="relative aspect-[4/1] w-full bg-gray-100">
                      <Image src={image.url} alt="Cover choice" fill className="object-cover" />
                    </div>
                  </button>

                  {image.source === "uploaded" && openedContextImageId === image.id && (
                    <div ref={contextRef} className="absolute right-2 top-2 z-10 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          const shouldResetToCurrent = selectedUrl === image.url;
                          onDeleteUploadedImage(image.id);
                          if (shouldResetToCurrent) {
                            setSelectedUrl(currentCoverUrl);
                            onPreview(currentCoverUrl);
                          }
                          setOpenedContextImageId(null);
                        }}
                        className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <FaTrash size={10} />
                        {isFR ? "Supprimer cette image" : "Delete this image"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => {
              setSelectedUrl(currentCoverUrl);
              onPreview(currentCoverUrl);
            }}
            disabled={isResetDisabled}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaArrowsRotate size={11} />
            {isFR ? "Réinitialiser" : "Reset"}
          </button>
          <button
            type="button"
            onClick={() => onPreview(selectedUrl)}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            <FaEye size={11} />
            {isFR ? "Voir l'aperçu" : "Preview"}
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(selectedUrl);
              onClose();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <FaCheck size={11} />
            {isFR ? "Enregistrer" : "Save"}
          </button>
        </div>

        <ImageComplianceNotice isFR={isFR} />
      </div>
    </div>
  );
}
