'use client';

/**
 * IdentityVerificationForm
 *
 * Composant de présentation pur pour la vérification d'identité.
 * Ne contient aucune logique métier — reçoit tout via des props.
 */

import { FiCheck, FiArrowRight, FiArrowLeft, FiArrowUp, FiUser } from 'react-icons/fi';
import type {
  PoseConfig,
  VerificationStatus,
  VideoDims,
} from '../../hooks/useIdentityVerification';
import { POSES } from '../../hooks/useIdentityVerification';
import { Language, useAppState } from '@/core/state/app_state';

// ── Props du composant ─────────────────────────────────────────────────────────

export interface IdentityVerificationFormProps {
  // Refs DOM — OBLIGATOIRES pour que le flux vidéo et la capture fonctionnent
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;

  // État de la vérification
  status: VerificationStatus;
  loadError: string | null;
  videoReady: boolean;
  videoDims: VideoDims;
  poseIndex: number;
  holdProgress: number;
  faceOk: boolean;
  poseOk: boolean;
  captures: (string | null)[];
  isStreaming: boolean;
  isLoading: boolean;
  hookError: string | null;

  // Calculs dérivés
  strokeColor: string;
  perim: number;

  // Actions
  startCamera: () => void;
  stopCamera: () => void;
  handleConfirm: () => void;

  // Configuration des poses (optionnel, utilise POSES par défaut)
  poses?: PoseConfig[];
}

// ── Helper pour rendre les icônes ──────────────────────────────────────────────

function IconFor(
  key: string,
  props?: { size?: number; className?: string }
): React.ReactElement {
  const size = props?.size ?? 20;
  const className = props?.className ?? '';
  switch (key) {
    case 'front':
      return <FiUser size={size} className={className} />;
    case 'right':
      return <FiArrowRight size={size} className={className} />;
    case 'left':
      return <FiArrowLeft size={size} className={className} />;
    case 'up':
      return <FiArrowUp size={size} className={className} />;
    default:
      return <FiUser size={size} className={className} />;
  }
}

// ── Composant principal ────────────────────────────────────────────────────────

export default function IdentityVerificationForm({
  videoRef,
  canvasRef,
  status,
  loadError,
  videoReady,
  videoDims,
  poseIndex,
  holdProgress,
  faceOk,
  poseOk,
  captures,
  isStreaming,
  isLoading,
  hookError,
  strokeColor,
  perim,
  startCamera,
  stopCamera,
  handleConfirm,
  poses = POSES,
}: IdentityVerificationFormProps) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  return (
    <div className="flex flex-col gap-5">
      {/* Titre */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {isFR ? "Vérification d'identité" : 'Identity Verification'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isFR
            ? 'Capturez votre visage sous 4 angles. La capture est automatique — maintenez chaque pose.'
            : 'Capture your face from 4 angles. Capture is automatic — hold each pose.'}
        </p>
      </div>

      {/* 4 indicateurs de pose */}
      <div className="grid grid-cols-4 gap-2">
        {poses.map((pose, idx) => {
          const captured = captures[idx] != null;
          const isCurrent = idx === poseIndex && status === 'detecting';
          return (
            <div
              key={pose.id}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all ${
                captured
                  ? 'border-green-400 bg-green-50'
                  : isCurrent
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              {captures[idx] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={captures[idx]!}
                  alt={pose.label}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-green-400"
                />
              ) : (
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                    isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  {IconFor(pose.icon, {
                    size: 22,
                    className: isCurrent ? 'text-blue-600' : 'text-gray-500',
                  })}
                </div>
              )}
              <span
                className={`text-xs font-medium leading-tight text-center ${
                  captured ? 'text-green-700' : isCurrent ? 'text-green-700' : 'text-gray-400'
                }`}
              >
                {captured ? (
                  <span className="flex items-center gap-1 justify-center">
                    <FiCheck className="text-green-700" />
                    OK
                  </span>
                ) : (
                  pose.label
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chargement des modèles */}
      {status === 'loading-models' && !loadError && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-600 font-medium">
            {isFR
              ? 'Chargement du système de vérification...'
              : 'Loading verification system...'}
          </p>
          <p className="text-xs text-gray-400">
            {isFR
              ? 'Première utilisation : ~5–10 secondes'
              : 'First use: ~5–10 seconds'}
          </p>
        </div>
      )}

      {/* Erreur */}
      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 text-center">
          {loadError}
          {status === 'start-camera' && (
            <button
              type="button"
              onClick={startCamera}
              className="mt-2 block mx-auto text-sm font-medium text-blue-600 hover:underline"
            >
              {isFR ? 'Réessayer' : 'Retry'}
            </button>
          )}
        </div>
      )}

      {/* Bouton démarrer caméra */}
      {!isStreaming && status !== 'loading-models' && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="text-sm text-gray-500">
            {loadError
              ? loadError
              : (isFR
                ? 'Le système de détection est prêt. Activez la caméra pour commencer.'
                : 'Detection system is ready. Enable camera to start.')}
          </p>
          <button
            type="button"
            onClick={startCamera}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {isFR ? 'Activer la caméra' : 'Enable Camera'}
          </button>
        </div>
      )}

      {/* Flux caméra avec détection */}
      {status === 'detecting' && (
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-full max-w-sm">
            <video
              ref={videoRef}
              className="h-64 w-full rounded-2xl object-cover bg-black"
              style={{ transform: 'scaleX(-1)' }}
              autoPlay
              playsInline
              muted
            />
            {/* Canvas hors-écran utilisé pour la capture de frames */}
            <canvas ref={canvasRef} className="hidden" />
            {/* Stop overlay when streaming */}
            {isStreaming && (
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="rounded-md bg-white/80 px-3 py-1 text-xs font-medium text-red-600 shadow"
                >
                  {isFR ? 'Arrêter' : 'Stop'}
                </button>
              </div>
            )}
            {/* Overlay SVG : zone sombre + ovale guide + anneau de progression */}
            <svg
              className="absolute inset-0 h-full w-full pointer-events-none"
              viewBox="0 0 320 256"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <mask id="face-oval-mask">
                  <rect width="320" height="256" fill="white" />
                  <ellipse cx="160" cy="116" rx="80" ry="100" fill="black" />
                </mask>
              </defs>
              {/* Zone sombre autour du visage */}
              <rect
                width="320"
                height="256"
                fill="rgba(0,0,0,0.38)"
                mask="url(#face-oval-mask)"
              />
              {/* Anneau de base (blanc semi-transparent) */}
              <ellipse
                cx="160"
                cy="116"
                rx="84"
                ry="104"
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="3"
              />
              {/* Anneau de progression */}
              <ellipse
                cx="160"
                cy="116"
                rx="84"
                ry="104"
                fill="none"
                stroke={strokeColor}
                strokeWidth={poseOk ? 4.5 : 3.5}
                strokeDasharray={`${perim * holdProgress} ${perim * (1 - holdProgress)}`}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 0.12s ease, stroke 0.15s ease',
                }}
              />
            </svg>

            {/* Animated arrow or guide for profile poses */}
            {poseIndex < poses.length && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {poses[poseIndex].icon !== 'front' && (
                  <div
                    className={`arrow-icon ${
                      poses[poseIndex].icon === 'right'
                        ? 'arrow-right'
                        : poses[poseIndex].icon === 'left'
                          ? 'arrow-left'
                          : 'arrow-up'
                    }`}
                  >
                    {poses[poseIndex].icon === 'right' && (
                      <FiArrowRight
                        size={48}
                        className="text-white/90 drop-shadow-lg"
                      />
                    )}
                    {poses[poseIndex].icon === 'left' && (
                      <FiArrowLeft
                        size={48}
                        className="text-white/90 drop-shadow-lg"
                      />
                    )}
                    {poses[poseIndex].icon === 'up' && (
                      <FiArrowUp
                        size={48}
                        className="text-white/90 drop-shadow-lg"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
            <style>{`
              .arrow-icon { display:flex; align-items:center; justify-content:center; }
              @keyframes arrowRightMove { 0% { transform: translateX(0); opacity:1 } 50% { transform: translateX(18px); opacity:0.95 } 100% { transform: translateX(0); opacity:1 } }
              @keyframes arrowLeftMove { 0% { transform: translateX(0); opacity:1 } 50% { transform: translateX(-18px); opacity:0.95 } 100% { transform: translateX(0); opacity:1 } }
              @keyframes arrowUpMove { 0% { transform: translateY(0); opacity:1 } 50% { transform: translateY(-14px); opacity:0.95 } 100% { transform: translateY(0); opacity:1 } }
              .arrow-right { animation: arrowRightMove 0.9s ease-in-out 0s 3; }
              .arrow-left { animation: arrowLeftMove 0.9s ease-in-out 0s 3; }
              .arrow-up { animation: arrowUpMove 0.9s ease-in-out 0s 3; }
            `}</style>
          </div>

          {/* Diagnostic & instructions */}
          <div className="w-full max-w-sm text-xs text-gray-500 text-center mt-2">
            <div>
              {isFR ? 'Statut vidéo' : 'Video status'}: {videoReady ? (isFR ? 'prête' : 'ready') : (isFR ? 'non prête' : 'not ready')}
            </div>
            <div>{isFR ? 'Résolution' : 'Resolution'}: {videoDims.w}×{videoDims.h}</div>
            {!videoReady && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {isFR ? 'Activer la caméra' : 'Enable Camera'}
                </button>
              </div>
            )}
          </div>

          {/* Instruction de pose */}
          {poseIndex < poses.length && (
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center">
                {IconFor(poses[poseIndex].icon, {
                  size: 48,
                  className: 'text-gray-900',
                })}
              </div>
              <p className="font-semibold text-gray-900">
                {poses[poseIndex].label}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {poses[poseIndex].instruction}
              </p>
              <p
                className={`mt-2 text-xs font-medium ${
                  faceOk
                    ? poseOk
                      ? 'text-green-600'
                      : 'text-amber-600'
                    : 'text-gray-400'
                }`}
              >
                {faceOk
                  ? poseOk
                    ? `${isFR ? 'Maintien en cours' : 'Holding'}… ${Math.round(holdProgress * 100)}%`
                    : isFR ? 'Visage détecté — ajustez la pose' : 'Face detected — adjust pose'
                  : isFR ? 'Aucun visage détecté' : 'No face detected'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Récap : toutes les captures effectuées */}
      {status === 'done' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {poses.map((pose, idx) => (
              <div
                key={pose.id}
                className="flex flex-col items-center gap-1 overflow-hidden rounded-xl border border-green-200 bg-green-50"
              >
                {captures[idx] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={captures[idx]!}
                    alt={pose.label}
                    className="h-28 w-full object-cover"
                  />
                )}
                <span className="py-1 text-xs font-medium text-green-700 flex items-center gap-1">
                  <FiCheck className="text-green-700" /> {pose.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500">
            {isFR
              ? '4 captures effectuées. Confirmez pour terminer l\'onboarding.'
              : '4 captures completed. Confirm to finish onboarding.'}
          </p>
        </div>
      )}

      {hookError && (
        <p className="text-center text-sm text-red-600">{hookError}</p>
      )}

      {status === 'done' && (
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white
                     hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {isLoading
            ? (isFR ? 'Envoi en cours...' : 'Sending...')
            : (isFR ? "Confirmer l'identité" : 'Confirm Identity')}
        </button>
      )}
    </div>
  );
}
