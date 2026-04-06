'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { useOnboarding } from '../../hooks/useOnboarding';
import { FaCamera, FaTimes } from 'react-icons/fa';
import { FaFileImport, FaUser } from 'react-icons/fa6';
import { Language, useAppState } from '@/core/state/app_state';

interface Props {
  onboarding: ReturnType<typeof useOnboarding>;
}

export default function ProfilePhotoStep({ onboarding }: Props) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const { formData, setField, isLoading, error, submitProfilePicture } = onboarding;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [streamRef, setStreamRef] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const preview = formData.avatarUrl;
  const [showRenderAfterConfirm, setShowRenderAfterConfirm] = useState(false);

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
      // attach to video if available
      if (videoRef.current) {
        try {
          videoRef.current.srcObject = stream;
          const p = videoRef.current.play();
          p?.catch(() => {});
        } catch {}
      }
      setStreamRef(stream);
      setCameraActive(true);
    } catch {
      setCameraError(isFR
        ? "Impossible d'accéder à la caméra. Vérifiez les permissions."
        : "Unable to access camera. Check permissions.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Ensure video element receives the MediaStream reliably when streamRef changes
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (streamRef) {
      try {
        v.srcObject = streamRef;
        const p = v.play();
        p?.catch(() => {});
      } catch {}
    }
  }, [streamRef]);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {isFR ? 'Photo de profil' : 'Profile Photo'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isFR
            ? 'Ajoutez une photo pour que les autres membres vous reconnaissent.'
            : 'Add a photo so other members can recognize you.'}
        </p>
      </div>

      {/* Aperçu */}
      <div className="flex justify-center">
        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={isFR ? 'Photo de profil' : 'Profile photo'}
              className="h-32 w-32 rounded-full object-cover border-4 border-blue-100"
            />
            <button
              type="button"
              onClick={() => setField('avatarUrl', '')}
              aria-label={isFR ? 'Supprimer la photo' : 'Delete photo'}
              className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-100 border-2 border-dashed border-gray-300">
            <span className="text-4xl"><FaUser color="#08316e" /></span>
          </div>
        )}
      </div>

      {/* Flux caméra */}
      {cameraActive && (
        <div className="relative overflow-hidden flex w-full justify-center items-center rounded-xl">
          {!streamRef ? (
            <div className="h-64 flex max-w-2xl items-center justify-center bg-black text-white">
              {isFR ? 'Chargement du flux caméra...' : 'Loading camera stream...'}
            </div>
          ) : (
            <video
              ref={videoRef}
              className="max-w-lg h-64 rounded-xl object-cover bg-black"
              autoPlay
              playsInline
              muted
            />
          )}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 px-4">
            <button
              type="button"
              onClick={capturePhoto}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-md hover:bg-gray-100"
            >
              <FaCamera className="inline-block mr-2" /> {isFR ? 'Capturer' : 'Capture'}
            </button>
            <button
              type="button"
              onClick={closeCamera}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-500 shadow-md hover:bg-gray-100"
            >
              <FaTimes className="inline-block mr-2" /> {isFR ? 'Annuler' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {cameraError && <p className="text-sm text-amber-600 text-center">{cameraError}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Boutons choix */}
      {!cameraActive && (
        <div className="grid  grid-cols-2 gap-3">
          <button
            type="button"
            onClick={openCamera}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-4 text-sm
                       hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl"><FaCamera color="#08316e" /></span>
            <span className="font-medium text-gray-700">
              {isFR ? 'Prendre une photo' : 'Take a photo'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-4 text-sm
                       hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl"><FaFileImport color="#08316e" /></span>
            <span className="font-medium text-gray-700">
              {isFR ? 'Choisir depuis la galerie' : 'Choose from gallery'}
            </span>
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
        onClick={async () => {
          setShowRenderAfterConfirm(true);
          await submitProfilePicture();
        }}
        disabled={isLoading || !preview}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isLoading
          ? (isFR ? 'Traitement...' : 'Processing...')
          : (isFR ? 'Terminer' : 'Finish')}
      </button>

      {showRenderAfterConfirm && preview && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">
            {isFR ? 'Aperçu du rendu actuel' : 'Current render preview'}
          </h3>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={isFR ? 'Rendu actuel' : 'Current render'} className="h-24 w-24 rounded-md object-cover border" />
            <div className="text-sm text-gray-600">
              {isFR
                ? 'Voici à quoi ressemble votre photo de profil après confirmation.'
                : 'This is what your profile photo looks like after confirmation.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
