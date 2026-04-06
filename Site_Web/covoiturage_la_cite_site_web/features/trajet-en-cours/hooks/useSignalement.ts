'use client';
// ═══════════════════════════════════════════════════════
// useSignalement — Système de signalement en 5 étapes
// ═══════════════════════════════════════════════════════
import { useState, useCallback } from 'react';
import {
  SignalementData,
  SignalementOptions,
  CibleSignalement,
  NiveauSecurite,
  EtapeSignalement,
  UseSignalementReturn,
} from '../types/progression-signalement.types';
import { genererRapportPDF } from '../utils/signalement-pdf.utils';

const INIT: SignalementData = {
  cible: null,
  cibleNom: '',
  motifId: null,
  motifLabel: '',
  niveauSecurite: null,
  description: '',
  heureIncident: '',
  preuves: [],
  options: {
    anonyme: false,
    accepterContact: true,
    bloquerUtilisateur: false,
    notifierResultat: true,
  },
};

function genRef() {
  return `SIG-2026-${String(Math.floor(10000 + Math.random() * 90000))}`;
}

export function useSignalement(
  trajetId: string,
  cibleNomParDefaut = '',
  cibleRoleParDefaut?: CibleSignalement,
): UseSignalementReturn {
  const [etape, setEtape] = useState<EtapeSignalement>(1);
  const [data, setData] = useState<SignalementData>({
    ...INIT,
    cibleNom: cibleNomParDefaut,
    cible: cibleRoleParDefaut ?? null,
  });
  const [soumis, setSoumis] = useState(false);
  const [refNum, setRefNum] = useState('');

  const peutContinuer: boolean = (() => {
    switch (etape) {
      case 1: return !!data.cible;
      case 2: return !!data.motifId;
      case 3: return !!data.niveauSecurite;
      case 4: return data.description.trim().length >= 50;
      case 5: return true;
      default: return false;
    }
  })();

  const setCible = useCallback((c: CibleSignalement) =>
    setData((p) => ({ ...p, cible: c, motifId: null, motifLabel: '' })), []);

  const setMotif = useCallback((id: string, label: string) =>
    setData((p) => ({ ...p, motifId: id, motifLabel: label })), []);

  const setNiveauSecurite = useCallback((n: NiveauSecurite) =>
    setData((p) => ({ ...p, niveauSecurite: n })), []);

  const setDescription = useCallback((d: string) =>
    setData((p) => ({ ...p, description: d })), []);

  const setHeureIncident = useCallback((h: string) =>
    setData((p) => ({ ...p, heureIncident: h })), []);

  const ajouterPreuve = useCallback((pv: string) =>
    setData((p) => ({
      ...p,
      preuves: p.preuves.length < 5 ? [...p.preuves, pv] : p.preuves,
    })), []);

  const supprimerPreuve = useCallback((i: number) =>
    setData((p) => ({ ...p, preuves: p.preuves.filter((_, idx) => idx !== i) })), []);

  const setOption = useCallback((key: keyof SignalementOptions, val: boolean) =>
    setData((p) => ({ ...p, options: { ...p.options, [key]: val } })), []);

  const suivant = useCallback(() => {
    if (peutContinuer && etape < 5) setEtape((p) => (p + 1) as EtapeSignalement);
  }, [peutContinuer, etape]);

  const precedent = useCallback(() => {
    if (etape > 1) setEtape((p) => (p - 1) as EtapeSignalement);
  }, [etape]);

  const soumettre = useCallback(() => {
    const ref = genRef();
    setRefNum(ref);
    setSoumis(true);
    console.log('[Signalement]', { trajetId, ref, ...data });
  }, [data, trajetId]);

  const reinitialiser = useCallback(() => {
    setEtape(1);
    setData({ ...INIT, cibleNom: cibleNomParDefaut, cible: cibleRoleParDefaut ?? null });
    setSoumis(false);
    setRefNum('');
  }, [cibleNomParDefaut, cibleRoleParDefaut]);

  /** Génère et ouvre un rapport PDF du signalement */
  const telechargerPDF = useCallback(() => {
    genererRapportPDF(data, trajetId, refNum);
  }, [data, trajetId, refNum]);

  return {
    etapeActuelle: etape,
    signalement: data,
    estSoumis: soumis,
    referenceSignalement: refNum,
    peutContinuer,
    setCible, setMotif, setNiveauSecurite,
    setDescription, setHeureIncident,
    ajouterPreuve, supprimerPreuve, setOption,
    suivant, precedent, soumettre,
    reinitialiser, telechargerPDF,
  };
}
