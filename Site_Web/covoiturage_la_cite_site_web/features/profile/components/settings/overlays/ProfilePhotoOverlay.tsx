"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaXmark, FaCamera, FaUpload, FaEye, FaCheck, FaArrowsRotate } from "react-icons/fa6";
import { ImageComplianceNotice } from "./ImageComplianceNotice";

interface ProfilePhotoOverlayProps {
  isOpen: boolean;
  isFR: boolean;
  currentAvatarUrl?: string;
  onPreview: (url?: string) => void;
  onSave: (url?: string) => void;
  onClose: () => void;
}

export function ProfilePhotoOverlay({
  isOpen,
  isFR,
  currentAvatarUrl,
  onPreview,
  onSave,
  onClose,
}: ProfilePhotoOverlayProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | undefined>(currentAvatarUrl);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isResetDisabled = selectedUrl === currentAvatarUrl;

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraStream(null);
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!cameraActive || !cameraStream || !videoRef.current) return;

    const video = videoRef.current;
    video.srcObject = cameraStream;
    void video.play().catch(() => undefined);
  }, [cameraActive, cameraStream]);

  const openCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
      });
      streamRef.current = stream;
      setCameraStream(stream);
      setCameraActive(true);
    } catch {
      setCameraError(
        isFR ? "Impossible d'accéder à la caméra. Vérifiez les permissions." : "Unable to access camera. Check permissions."
      );
    }
  }, [isFR]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setSelectedUrl(dataUrl);
    closeCamera();
  }, [closeCamera]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (readerEvent) => setSelectedUrl(readerEvent.target?.result as string);
    reader.readAsDataURL(file);
    if (event.target) event.target.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">{isFR ? "Photo de profil" : "Profile photo"}</h3>
          <button
            type="button"
            onClick={() => {
              closeCamera();
              onClose();
            }}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <FaXmark size={16} />
          </button>
        </div>

        <div className="mb-4 flex justify-center">
          {selectedUrl ? (
            <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-blue-100">
              <Image src={selectedUrl} alt="Profile preview" fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500">
              {isFR ? "Aucune photo sélectionnée" : "No photo selected"}
            </div>
          )}
        </div>

        {cameraActive && (
          <div className="mb-4 rounded-xl bg-gray-900 p-3">
            <video ref={videoRef} autoPlay playsInline muted className="mx-auto h-64 w-full max-w-md rounded-lg bg-black object-cover" />
            <div className="mt-3 flex justify-center gap-2">
              <button
                type="button"
                onClick={capturePhoto}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-100"
              >
                <FaCamera size={12} />
                {isFR ? "Capturer" : "Capture"}
              </button>
              <button
                type="button"
                onClick={closeCamera}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                <FaXmark size={12} />
                {isFR ? "Annuler" : "Cancel"}
              </button>
            </div>
          </div>
        )}

        {!cameraActive && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={openCamera}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FaCamera size={14} />
              {isFR ? "Prendre une photo" : "Take photo"}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FaUpload size={14} />
              {isFR ? "Importer une image" : "Upload image"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {cameraError && <p className="mb-3 text-center text-xs text-amber-700">{cameraError}</p>}

        <div className="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => {
              setSelectedUrl(currentAvatarUrl);
              onPreview(currentAvatarUrl);
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
            disabled={!selectedUrl}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
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
            disabled={!selectedUrl}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaCheck size={11} />
            {isFR ? "Enregistrer" : "Save"}
          </button>
        </div>

        <ImageComplianceNotice isFR={isFR} position="inline" />
      </div>
    </div>
  );
}
