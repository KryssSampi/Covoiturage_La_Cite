import type { SignalementData } from '../types/progression-signalement.types';

/**
 * Génère et ouvre le rapport PDF d'un signalement dans un nouvel onglet.
 * Fonction pure côté génération HTML — les effets de bord (window.open, print)
 * sont intentionnels et attendus dans ce contexte navigateur.
 */
export function genererRapportPDF(
  data:     SignalementData,
  trajetId: string,
  refNum:   string,
): void {
  const sev: Record<string, string> = {
    danger_immediat: '\u{1F198} Danger immédiat',
    incident_recent: '\u26A0\uFE0F Incident récent',
    malaise:         '\u{1F61F} Malaise / Inconfort',
    informatif:      '\u{1F4CB} Informatif',
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
}
