/**
 * useDocumentUpload — Hook pour la logique de l'overlay de téléversement de documents
 */

"use client";

import { useState, useRef, useCallback } from "react";

const MAX_PHOTOS = 6;

export function useDocumentUpload() {
  const [activeForm, setActiveForm] = useState<'photos' | 'documents'>('documents');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_PHOTOS - photoUrls.length;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setPhotoUrls((prev) => [...prev, url]);
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = "";
  }, [photoUrls.length]);

  const removePhoto = useCallback((index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    activeForm,
    setActiveForm,
    fileInputRef,
    photoUrls,
    setPhotoUrls,
    handlePhotoUpload,
    removePhoto,
    MAX_PHOTOS,
  };
}
