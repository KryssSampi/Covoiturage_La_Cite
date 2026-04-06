'use client';

/**
 * useIdentityVerification
 *
 * Hook personnalisé qui encapsule la logique de vérification d'identité :
 * - Chargement des modèles face-api.js
 * - Gestion de la caméra (démarrage/arrêt)
 * - Détection de visage et estimation de pose
 * - Capture automatique des photos
 * - Soumission des captures via le hook onboarding
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import type { useOnboarding } from './useOnboarding';

// ── Types exportés pour le composant UI ────────────────────────────────────────

export type PoseId = 'front' | 'right' | 'left' | 'up';

export interface PoseConfig {
  id: PoseId;
  label: string;
  instruction: string;
  icon: string;
  /** yaw ∈ [-1, 1] — positif = nez décalé vers la droite (tête tournée droite) */
  check: (yaw: number, pitch: number) => boolean;
}

export type VerificationStatus = 'loading-models' | 'start-camera' | 'detecting' | 'done';

export interface VideoDims {
  w: number;
  h: number;
}

// ── Constantes ─────────────────────────────────────────────────────────────────

// yaw : positif → tête tournée à droite de l'utilisateur (nez va vers la droite caméra)
// pitch : positif → menton levé (nez descend dans le cadre)
export const POSES: PoseConfig[] = [
  {
    id: 'front',
    label: 'De face',
    instruction: 'Regardez droit devant vous',
    icon: 'front',
    check: (y, p) => Math.abs(y) < 0.15 && Math.abs(p) < 0.12,
  },
  {
    id: 'right',
    label: 'Profil droit',
    instruction: 'Tournez la tête vers votre droite',
    icon: 'right',
    // La caméra frontale est affichée en miroir pour l'utilisateur (scaleX(-1)),
    // mais face-api.js reçoit le flux RAW non-miroir.
    // Quand l'utilisateur tourne à droite, son nez va vers la GAUCHE sur le flux raw → yaw négatif.
    check: (y) => y < -0.38,
  },
  {
    id: 'left',
    label: 'Profil gauche',
    instruction: 'Tournez la tête vers votre gauche',
    icon: 'left',
    // Inverse : tête à gauche = nez vers la droite sur le flux raw → yaw positif.
    check: (y) => y > 0.38,
  },
  {
    id: 'up',
    label: 'Menton levé',
    instruction: 'Levez légèrement le menton',
    icon: 'up',
    check: (_y, p) => p > -0.22,
  },
];

export const HOLD_FRAMES = 7; // 7 × 250 ms ≈ 1,75 s
export const MODEL_CDN = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

// ── Fonctions utilitaires exportées ────────────────────────────────────────────

/** Estime yaw et pitch à partir des 68 landmarks face-api.js */
export function estimatePose(positions: { x: number; y: number }[]): { yaw: number; pitch: number } {
  if (positions.length < 68) return { yaw: 0, pitch: 0 };

  const nose = positions[30];
  const jawLeft = positions[0];
  const jawRight = positions[16];
  const faceWidth = jawRight.x - jawLeft.x;
  if (faceWidth < 1) return { yaw: 0, pitch: 0 };

  const faceCenterX = (jawLeft.x + jawRight.x) / 2;
  const yaw = (nose.x - faceCenterX) / (faceWidth / 2);

  // Pitch : ratio position nez / hauteur œil→menton
  const eyeIdxs = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];
  const eyeCenterY = eyeIdxs.reduce((s, i) => s + positions[i].y, 0) / eyeIdxs.length;
  const chinY = positions[8].y;
  const faceHeight = chinY - eyeCenterY;
  if (faceHeight < 1) return { yaw, pitch: 0 };

  // noseRatio ≈ 0,35 à l'horizontal → menton levé = ratio augmente
  const noseRatio = (nose.y - eyeCenterY) / faceHeight;
  const pitch = (noseRatio - 0.35) * 3;

  return { yaw, pitch };
}

/** Calcule la couleur de l'anneau de progression selon holdProgress */
export function getStrokeColor(faceOk: boolean, holdProgress: number): string {
  if (!faceOk) return 'rgba(255,255,255,0.5)';
  const from = [245, 158, 11]; // #f59e0b (amber)
  const to = [16, 185, 129]; // #10b981 (green)
  const t = Math.max(0, Math.min(1, holdProgress));
  const rgb = from.map((f, i) => Math.round(f + (to[i] - f) * t));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

// ── Interface de retour du hook ────────────────────────────────────────────────

export interface UseIdentityVerificationReturn {
  // Refs pour les éléments DOM
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

  // Actions
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  handleConfirm: () => Promise<void>;

  // Calculs dérivés
  strokeColor: string;
  perim: number;
}

// ── Hook principal ─────────────────────────────────────────────────────────────

export function useIdentityVerification(
  onboarding: ReturnType<typeof useOnboarding>
): UseIdentityVerificationReturn {
  const { isLoading, error: hookError, submitIdentityVerification } = onboarding;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const poseIdxRef = useRef(0);
  const holdCountRef = useRef(0);
  const [isStreaming, setIsStreaming] = useState(false);

  const [status, setStatus] = useState<VerificationStatus>('loading-models');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoDims, setVideoDims] = useState<VideoDims>({ w: 0, h: 0 });
  const [poseIndex, setPoseIndex] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [faceOk, setFaceOk] = useState(false);
  const [poseOk, setPoseOk] = useState(false);
  const [captures, setCaptures] = useState<(string | null)[]>([null, null, null, null]);

  // ── 1. Charger les modèles depuis CDN ───────────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const faceapi = await import('face-api.js');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_CDN),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_CDN),
        ]);
        if (alive) setStatus('start-camera');
      } catch {
        if (alive)
          setLoadError(
            'Impossible de charger les modèles de détection. Vérifiez votre connexion internet et rechargez la page.'
          );
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ── 2. Démarrer la caméra ───────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    try {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => { try { t.stop(); } catch {} });
        streamRef.current = null;
      }
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch {}
        try { (videoRef.current.srcObject as MediaStream | null) = null; } catch {}
      }
    } finally {
      setIsStreaming(false);
      setVideoReady(false);
      setStatus('start-camera');
      // reset detection state
      holdCountRef.current = 0;
      poseIdxRef.current = 0;
      setPoseIndex(0);
      setHoldProgress(0);
      setFaceOk(false);
      setPoseOk(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setLoadError(null);
    console.debug('[IdentityVerification] startCamera invoked');
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      // Stop any previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => { try { t.stop(); } catch {} });
      }
      streamRef.current = s;

      // Attach ended listeners
      try {
        s.getTracks().forEach((t) => {
          const onEnded = () => {
            console.debug('[IdentityVerification] track ended', t.kind);
            stopCamera();
          };
          try { t.addEventListener('ended', onEnded); } catch {}
        });
      } catch (e) {
        console.debug('[IdentityVerification] attach track listeners failed', e);
      }

      // CRITICAL: set status BEFORE isStreaming so React renders the <video>
      // element first; the useEffect below will then attach the stream.
      setVideoReady(false);
      setStatus('detecting');
      setIsStreaming(true);
    } catch (err) {
      const msg = 'Impossible d\'accéder à la caméra. Vérifiez les permissions du navigateur.';
      console.debug('[IdentityVerification] getUserMedia failed', err);
      setLoadError(msg);
      setIsStreaming(false);
      setVideoReady(false);
      setStatus('start-camera');
    }
  }, [stopCamera]);

  // ── Attach stream to <video> once the element is in the DOM ────────────────
  useEffect(() => {
    if (!isStreaming || status !== 'detecting') return;

    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    video.srcObject = streamRef.current;

    const attachAndPlay = async () => {
      try {
        await video.play();
      } catch (e) {
        console.debug('[IdentityVerification] video.play() failed (autoplay policy?)', e);
      }
      setVideoReady(video.readyState >= 2);
      setVideoDims({ w: video.videoWidth || 0, h: video.videoHeight || 0 });
    };

    // If metadata already loaded, play immediately; otherwise wait for event
    if (video.readyState >= 1) {
      attachAndPlay();
    } else {
      video.addEventListener('loadedmetadata', attachAndPlay, { once: true });
    }

    return () => {
      video.removeEventListener('loadedmetadata', attachAndPlay);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming, status]);

  // ── 3. Boucle de détection ──────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'detecting') return;

    const run = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const faceapi = await import('face-api.js');
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.45 }))
        .withFaceLandmarks(true);

      if (!detection) {
        setFaceOk(false);
        setPoseOk(false);
        holdCountRef.current = Math.max(0, holdCountRef.current - 1);
        setHoldProgress(holdCountRef.current / HOLD_FRAMES);
        return;
      }

      setFaceOk(true);
      const positions = detection.landmarks.positions as unknown as { x: number; y: number }[];
      const { yaw, pitch } = estimatePose(positions);
      const currentPose = POSES[poseIdxRef.current];
      const matched = currentPose.check(yaw, pitch);
      setPoseOk(matched);

      if (matched) {
        holdCountRef.current += 1;
        setHoldProgress(Math.min(holdCountRef.current / HOLD_FRAMES, 1));

        if (holdCountRef.current >= HOLD_FRAMES) {
          // ── Auto-capture ──────────────────────────────────────────────────
          const captureIdx = poseIdxRef.current;
          holdCountRef.current = 0;

          if (canvasRef.current && video) {
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            setCaptures((prev) => {
              const next = [...prev];
              next[captureIdx] = dataUrl;
              return next;
            });
          }

          const nextIdx = captureIdx + 1;
          if (nextIdx >= POSES.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            streamRef.current?.getTracks().forEach((t) => t.stop());
            poseIdxRef.current = POSES.length;
            setPoseIndex(POSES.length);
            setStatus('done');
          } else {
            poseIdxRef.current = nextIdx;
            setPoseIndex(nextIdx);
            setHoldProgress(0);
            setPoseOk(false);
          }
        }
      } else {
        holdCountRef.current = Math.max(0, holdCountRef.current - 1);
        setHoldProgress(holdCountRef.current / HOLD_FRAMES);
      }
    };

    intervalRef.current = setInterval(run, 250);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  // Mettre à jour les dimensions vidéo quand elles changent
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      setVideoDims({ w: v.videoWidth || 0, h: v.videoHeight || 0 });
      setVideoReady(v.readyState >= 2);
    };
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, []);

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Soumettre ───────────────────────────────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    const photos = captures.filter(Boolean) as string[];
    await submitIdentityVerification(photos);
  }, [captures, submitIdentityVerification]);

  // ── Calculs dérivés ─────────────────────────────────────────────────────────
  const perim = 2 * Math.PI * 84; // périmètre simplifié sur rx
  const strokeColor = getStrokeColor(faceOk, holdProgress);

  return {
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
    startCamera,
    stopCamera,
    handleConfirm,
    strokeColor,
    perim,
  };
}
