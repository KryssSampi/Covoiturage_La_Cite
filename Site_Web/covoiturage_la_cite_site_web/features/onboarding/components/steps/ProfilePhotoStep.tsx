'use client';

import { useRef, useState, useCallback } from 'react';
import type { useOnboarding } from '../../hooks/useOnboarding';

interface Props {
  onboarding: ReturnType<typeof useOnboarding>;
}

export default function ProfilePhotoStep({ onboarding }: Props) {
  const { formData, setField, isLoading, error, submitProfilePicture } = onboarding;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [streamRef, setStreamRef] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const preview = formData.avatarUrl;

  // ── Galerie ──────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setField('avatarUrl', ev.target?.result as string);
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  // ── Caméra ───────────────────────────────────────────────────────────────
  const openCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamRef(stream);
      setCameraActive(true);
    } catch {
      setCameraError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  }, []);

  const closeCamera = useCallback(() => {
    streamRef?.getTracks().forEach((t) => t.stop());
    setStreamRef(null);
    setCameraActive(false);
  }, [streamRef]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setField('avatarUrl', dataUrl);
    closeCamera();
  }, [setField, closeCamera]);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Photo de profil</h2>
        <p className="mt-1 text-sm text-gray-500">
          Ajoutez une photo pour que les autres membres vous reconnaissent.
        </p>
      </div>

      {/* Aperçu */}
      <div className="flex justify-center">
        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Photo de profil"
              className="h-32 w-32 rounded-full object-cover border-4 border-blue-100"
            />
            <button
              type="button"
              onClick={() => setField('avatarUrl', '')}
              aria-label="Supprimer la photo"
              className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-100 border-2 border-dashed border-gray-300">
            <span className="text-4xl">👤</span>
          </div>
        )}
      </div>

      {/* Flux caméra */}
      {cameraActive && (
        <div className="relative overflow-hidden rounded-xl">
          <video ref={videoRef} className="w-full rounded-xl" playsInline muted />
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 px-4">
            <button
              type="button"
              onClick={capturePhoto}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-md hover:bg-gray-100"
            >
              📸 Capturer
            </button>
            <button
              type="button"
              onClick={closeCamera}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-500 shadow-md hover:bg-gray-100"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {cameraError && <p className="text-sm text-amber-600 text-center">{cameraError}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Boutons choix */}
      {!cameraActive && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={openCamera}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-4 text-sm
                       hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl">📷</span>
            <span className="font-medium text-gray-700">Prendre une photo</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-4 text-sm
                       hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl">🖼️</span>
            <span className="font-medium text-gray-700">Choisir depuis la galerie</span>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={submitProfilePicture}
        disabled={isLoading || !preview}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Traitement...' : 'Terminer'}
      </button>
    </div>
  );
}
