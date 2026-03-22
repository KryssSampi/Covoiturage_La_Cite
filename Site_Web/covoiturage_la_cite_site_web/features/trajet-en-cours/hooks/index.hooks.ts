'use client';
// ═══════════════════════════════════════════════════════
// Hooks pour la feature "Trajet en cours"
// Simule un trajet en temps réel, gère la messagerie
// et le système de signalement.
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TrajetProgressionFixture,
  ProgressionCalculee,
  StatutEtape,
  UseProgressionReturn,
  SignalementData,
  SignalementOptions,
  CibleSignalement,
  NiveauSecurite,
  EtapeSignalement,
  UseSignalementReturn,
} from '../types/progression-signalement.types';
import {
  Correspondant,
  Message,
  ConversationState,
  UseMessagerieReturn,
} from '../types/messagerie.types';
import { genererNouvelleProgression, messagesInitiauxFixture } from '../fixtures/index.fixtures';


// ═══════════════════════════════════════════════════════
// useProgression — Simule un trajet en temps réel
// ═══════════════════════════════════════════════════════

function calculer(
  fixture: TrajetProgressionFixture,
  sec: number,
): ProgressionCalculee {
  const { dureeTotaleSecondes, distanceTotaleKm, etapes } = fixture;
  const clampedSec = Math.min(sec, dureeTotaleSecondes);
  const pct = (clampedSec / dureeTotaleSecondes) * 100;

  const distParcourue = parseFloat(((distanceTotaleKm * pct) / 100).toFixed(1));
  const distRestante  = parseFloat((distanceTotaleKm - distParcourue).toFixed(1));
  const secRestantes  = Math.max(dureeTotaleSecondes - clampedSec, 0);

  const eta = new Date();
  eta.setSeconds(eta.getSeconds() + secRestantes);
  const etaTexte = eta.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });

  // Statuts des étapes : fait / actif / en_attente
  const statutsEtapes: StatutEtape[] = etapes.map(() => 'en_attente');
  let etapeActuelleIndex = 0;

  for (let i = 0; i < etapes.length; i++) {
    if (clampedSec >= etapes[i].tempsSecondes) {
      statutsEtapes[i] = 'fait';
      etapeActuelleIndex = i;
    }
  }

  // La prochaine étape non atteinte = active (sauf si trajet terminé)
  const prochaine = etapes.findIndex((e) => clampedSec < e.tempsSecondes);
  if (prochaine !== -1 && clampedSec < dureeTotaleSecondes) {
    statutsEtapes[prochaine] = 'actif';
    etapeActuelleIndex = prochaine;
  }

  return {
    pourcentage:            parseFloat(pct.toFixed(1)),
    distanceParcourueKm:    distParcourue,
    distanceRestanteKm:     distRestante,
    dureeRestanteSecondes:  secRestantes,
    etaTexte,
    statutsEtapes,
    etapeActuelleIndex,
    estTermine: clampedSec >= dureeTotaleSecondes,
  };
}

export function useProgression(
  fixtureInitiale: TrajetProgressionFixture,
): UseProgressionReturn {
  const [fixture, setFixture] = useState<TrajetProgressionFixture>(fixtureInitiale);
  const [secondes, setSecondes] = useState<number>(0);
  const [actif] = useState<boolean>(true);
  const pauseRef = useRef<boolean>(false);

  useEffect(() => {
    if (!actif) return;

    const id = setInterval(() => {
      setSecondes((prev) => {
        const next = prev + 1;
        if (next > fixture.dureeTotaleSecondes && !pauseRef.current) {
          pauseRef.current = true;
          // Pause 3 s puis nouvelle fixture
          setTimeout(() => {
            const newFixture = genererNouvelleProgression();
            setFixture(newFixture);
            setSecondes(0);
            pauseRef.current = false;
          }, 3000);
          return fixture.dureeTotaleSecondes;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [actif, fixture]);

  const progression = calculer(fixture, secondes);

  return { fixture, secondesEcoulees: secondes, progression, estActif: actif };
}


// ═══════════════════════════════════════════════════════
// useMessagerie — Gère les conversations en temps réel
// ═══════════════════════════════════════════════════════

export function useMessagerie(
  correspondants: Correspondant[],
  initialCorrespondantId?: string,
): UseMessagerieReturn {
  const defaultId = initialCorrespondantId ?? correspondants[0]?.id ?? '';

  const [state, setState] = useState<ConversationState>({
    correspondantActifId: defaultId,
    messages: { ...messagesInitiauxFixture },
  });

  const messagesActifs: Message[] =
    state.messages[state.correspondantActifId] ?? [];

  const correspondantActif: Correspondant | undefined = correspondants.find(
    (c) => c.id === state.correspondantActifId,
  );

  /** Envoie un message "de moi" dans la conversation active */
  const envoyerMessage = useCallback(
    (contenu: string) => {
      if (!contenu.trim()) return;
      const msg: Message = {
        id: `msg-${Date.now()}-moi`,
        contenu: contenu.trim(),
        role: 'moi',
        horodatage: new Date(),
        type: 'texte',
        correspondantId: state.correspondantActifId,
        estLu: true,
      };
      setState((prev) => ({
        ...prev,
        messages: {
          ...prev.messages,
          [prev.correspondantActifId]: [
            ...(prev.messages[prev.correspondantActifId] ?? []),
            msg,
          ],
        },
      }));
    },
    [state.correspondantActifId],
  );

  /** Simule la réception d'un message depuis le correspondant actif */
  const simulerReception = useCallback(
    (contenu: string) => {
      if (!contenu.trim()) return;
      const msg: Message = {
        id: `msg-${Date.now()}-sim`,
        contenu: contenu.trim(),
        role: 'autre',
        horodatage: new Date(),
        type: 'texte',
        correspondantId: state.correspondantActifId,
        estLu: false,
      };
      setState((prev) => ({
        ...prev,
        messages: {
          ...prev.messages,
          [prev.correspondantActifId]: [
            ...(prev.messages[prev.correspondantActifId] ?? []),
            msg,
          ],
        },
      }));
    },
    [state.correspondantActifId],
  );

  /** Broadcast : envoie le même message à TOUS les correspondants (conducteur) */
  const broadcast = useCallback((contenu: string) => {
    if (!contenu.trim()) return;
    setState((prev) => {
      const updated = { ...prev.messages };
      correspondants.forEach((c) => {
        const systemeMsg: Message = {
          id: `msg-${Date.now()}-bc-${c.id}`,
          contenu: contenu.trim(),
          role: 'moi',
          horodatage: new Date(),
          type: 'texte',
          correspondantId: c.id,
          estLu: true,
        };
        updated[c.id] = [...(updated[c.id] ?? []), systemeMsg];
      });
      return { ...prev, messages: updated };
    });
  }, [correspondants]);

  const changerCorrespondant = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      correspondantActifId: id,
      messages: {
        ...prev.messages,
        [id]: prev.messages[id] ?? [],
      },
    }));
  }, []);

  // Nombre de messages non lus par correspondant
  const nbNonLus: Record<string, number> = correspondants.reduce(
    (acc, c) => {
      const msgs = state.messages[c.id] ?? [];
      acc[c.id] = msgs.filter((m) => !m.estLu && m.role === 'autre').length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    conversationState: state,
    messagesActifs,
    correspondantActif,
    envoyerMessage,
    changerCorrespondant,
    simulerReception,
    broadcast,
    nbNonLus,
  };
}


// ═══════════════════════════════════════════════════════
// useSignalement — Système de signalement en 5 étapes
// ═══════════════════════════════════════════════════════

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
    const sev: Record<string, string> = {
      danger_immediat: '\u{1F198} Danger immédiat',
      incident_recent: '\u26A0\uFE0F Incident récent',
      malaise: '\u{1F61F} Malaise / Inconfort',
      informatif: '\u{1F4CB} Informatif',
    };
    const now = new Date().toLocaleDateString('fr-CA', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Signalement #${refNum} — La Cité Covoiturage</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Helvetica Neue',Arial,sans-serif;color:#0d1f3c;padding:48px;line-height:1.65;font-size:13px}
  .logo{font-size:18px;font-weight:800;color:#08316e;margin-bottom:4px}
  .header{border-bottom:3px solid #08316e;padding-bottom:20px;margin-bottom:32px}
  .ref{font-size:11px;color:#7a90b8;margin-top:3px}
  h2{font-size:11px;font-weight:800;color:#08316e;text-transform:uppercase;letter-spacing:.5px;
     padding-bottom:5px;border-bottom:1px solid rgba(8,49,110,.12);margin:24px 0 12px}
  .row{display:flex;gap:16px;margin-bottom:8px}
  .key{min-width:180px;color:#7a90b8;font-size:11px}
  .val{font-weight:600;color:#0d1f3c;flex:1}
  .desc{background:#f8f9fc;border:1px solid rgba(8,49,110,.1);border-radius:6px;
        padding:14px;font-size:12px;line-height:1.75;margin-top:6px;white-space:pre-wrap}
  .alert{background:rgba(224,48,80,.06);border-left:4px solid #e03050;
         padding:10px 14px;border-radius:0 6px 6px 0;color:#9a2030;margin:14px 0}
  .footer{margin-top:48px;padding-top:14px;border-top:1px solid rgba(8,49,110,.1);
          font-size:10px;color:#7a90b8}
  @media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div class="logo">\u{1F697} La Cité Covoiturage</div>
  <div style="font-size:17px;font-weight:800;margin-top:12px">\u26A0\uFE0F Rapport de Signalement Officiel</div>
  <div class="ref">Référence : <strong>#${refNum || 'EN COURS'}</strong> &nbsp;·&nbsp; Trajet : <strong>#${trajetId}</strong></div>
  <div class="ref">Généré le : ${now}</div>
</div>

<h2>Informations du signalement</h2>
<div class="row"><span class="key">Cible du signalement</span><span class="val">${data.cibleNom || '\u2014'} (${data.cible || '\u2014'})</span></div>
<div class="row"><span class="key">Motif retenu</span><span class="val">${data.motifLabel || 'Non spécifié'}</span></div>
<div class="row"><span class="key">Niveau de sécurité</span><span class="val">${data.niveauSecurite ? sev[data.niveauSecurite] : 'Non spécifié'}</span></div>
<div class="row"><span class="key">Heure de l'incident</span><span class="val">${data.heureIncident || 'Non précisée'}</span></div>
<div class="row"><span class="key">Preuves jointes</span><span class="val">${data.preuves.length} fichier(s) + journal GPS automatique</span></div>

${data.niveauSecurite === 'danger_immediat'
  ? '<div class="alert">\u26A0\uFE0F Ce signalement concerne un danger immédiat. Traitement prioritaire requis.</div>'
  : ''}

<h2>Description détaillée</h2>
<div class="desc">${data.description.trim() || 'Aucune description fournie.'}</div>

<h2>Options de traitement</h2>
<div class="row"><span class="key">Signalement anonyme</span><span class="val">${data.options.anonyme ? 'Oui \u2014 identité confidentielle' : 'Non'}</span></div>
<div class="row"><span class="key">Contact admin accepté</span><span class="val">${data.options.accepterContact ? 'Oui' : 'Non'}</span></div>
<div class="row"><span class="key">Blocage utilisateur</span><span class="val">${data.options.bloquerUtilisateur ? 'Demandé' : 'Non demandé'}</span></div>
<div class="row"><span class="key">Notification résultat</span><span class="val">${data.options.notifierResultat ? 'Oui \u2014 email attendu' : 'Non'}</span></div>

<h2>Processus de traitement</h2>
<div class="row"><span class="key">Délai de traitement</span><span class="val">48 heures maximum</span></div>
<div class="row"><span class="key">Preuves GPS</span><span class="val">Journal de position complet joint automatiquement</span></div>
<div class="row"><span class="key">Conformité</span><span class="val">Traité selon les politiques La Cité Covoiturage et la LPRPDE/PIPEDA</span></div>

<div class="footer">
  Ce document est généré automatiquement par La Cité Covoiturage.
  En cas d'urgence immédiate, composez le <strong>911</strong>.
  Document confidentiel — usage interne uniquement.
</div>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank');
    if (win) setTimeout(() => win.print(), 600);
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
