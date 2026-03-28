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
  const severityMap: Record<string, { label: string; color: string; bg: string }> = {
    danger_immediat: { label: 'Danger immédiat',  color: '#9a2030', bg: '#fde8ec' },
    incident_recent: { label: 'Incident récent',  color: '#c05010', bg: '#fef0e6' },
    malaise:         { label: 'Malaise / Inconfort', color: '#7a5500', bg: '#fef8e6' },
    informatif:      { label: 'Informatif',       color: '#08316e', bg: '#eef3fb' },
  };

  const sev = data.niveauSecurite ? severityMap[data.niveauSecurite] : null;

  const now = new Date().toLocaleDateString('fr-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const urgentBanner = data.niveauSecurite === 'danger_immediat'
    ? `<div class="alert-box">
        <div class="alert-icon">!</div>
        <div>
          <strong>Signalement prioritaire — Danger immédiat</strong><br>
          Ce dossier nécessite un traitement immédiat par l'équipe de sécurité.
        </div>
       </div>`
    : '';

  const optionRow = (label: string, val: boolean) =>
    `<tr><td class="key">${label}</td><td class="val">${val ? '<span class="badge-yes">Oui</span>' : '<span class="badge-no">Non</span>'}</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Signalement #${refNum} — La Cité Covoiturage</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #1a2a45;
    background: #fff;
    font-size: 12px;
    line-height: 1.6;
  }
  .page { padding: 48px 52px; max-width: 820px; margin: 0 auto; }

  /* En-tête */
  .header {
    display: flex; align-items: flex-start; justify-content: space-between;
    border-bottom: 3px solid #08316e;
    padding-bottom: 20px; margin-bottom: 32px;
  }
  .logo-block { display: flex; flex-direction: column; gap: 3px; }
  .logo {
    font-size: 20px; font-weight: 800; color: #08316e; letter-spacing: -0.02em;
  }
  .logo span { color: #1a5cb0; }
  .logo-sub { font-size: 11px; color: #7a90b8; font-weight: 500; }
  .header-meta { text-align: right; }
  .report-title { font-size: 15px; font-weight: 800; color: #08316e; margin-bottom: 6px; }
  .meta-line { font-size: 11px; color: #5a6a85; line-height: 1.8; }
  .meta-line strong { color: #1a2a45; }
  .ref-badge {
    display: inline-block; margin-top: 5px;
    background: #08316e; color: #fff;
    font-size: 10px; font-weight: 700;
    padding: 3px 10px; border-radius: 4px; letter-spacing: 0.5px;
  }

  /* Sections */
  .section { margin-bottom: 28px; }
  .section-title {
    font-size: 10px; font-weight: 800; color: #08316e;
    text-transform: uppercase; letter-spacing: 0.8px;
    padding: 6px 12px;
    background: #eef3fb;
    border-left: 4px solid #08316e;
    border-radius: 0 4px 4px 0;
    margin-bottom: 12px;
  }

  /* Tableau de données */
  table { width: 100%; border-collapse: collapse; }
  tr { border-bottom: 1px solid #f0f4fb; }
  tr:last-child { border-bottom: none; }
  td { padding: 7px 10px; vertical-align: top; }
  .key {
    width: 200px; color: #5a6a85; font-size: 11px; font-weight: 600;
    padding-right: 16px;
  }
  .val { font-weight: 600; color: #1a2a45; font-size: 12px; }

  /* Niveau de sécurité */
  .sev-badge {
    display: inline-block; padding: 3px 10px; border-radius: 4px;
    font-size: 10px; font-weight: 800; letter-spacing: 0.3px;
  }

  /* Bannière d'alerte */
  .alert-box {
    display: flex; align-items: flex-start; gap: 12px;
    background: #fde8ec; border: 1.5px solid rgba(224,48,80,0.35);
    border-radius: 8px; padding: 14px 16px; margin: 0 0 24px;
    color: #9a2030;
  }
  .alert-icon {
    width: 28px; height: 28px; border-radius: 50%;
    background: #e03050; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 900; flex-shrink: 0;
  }

  /* Description */
  .desc-box {
    background: #f8f9fc; border: 1px solid #dde3ef;
    border-radius: 6px; padding: 14px 16px;
    font-size: 12px; line-height: 1.75; white-space: pre-wrap; color: #1a2a45;
    min-height: 60px;
  }

  /* Badges options */
  .badge-yes {
    display: inline-block; background: #d1f5e4; color: #067a4b;
    font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 3px;
  }
  .badge-no {
    display: inline-block; background: #f0f4fb; color: #7a90b8;
    font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 3px;
  }

  /* Pied de page */
  .footer {
    margin-top: 40px; padding-top: 14px;
    border-top: 1px solid #dde3ef;
    display: flex; justify-content: space-between; align-items: flex-end;
    font-size: 10px; color: #9aaac0; gap: 20px;
  }
  .footer-left { max-width: 480px; line-height: 1.7; }
  .footer-right { text-align: right; flex-shrink: 0; }

  /* Watermark confidentiel */
  .watermark {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg);
    font-size: 72px; font-weight: 900; color: rgba(8,49,110,0.04);
    pointer-events: none; user-select: none; letter-spacing: 4px;
  }

  @media print {
    .page { padding: 20px 28px; }
    .watermark { position: fixed; }
  }
</style>
</head>
<body>
<div class="watermark">CONFIDENTIEL</div>
<div class="page">

  <!-- En-tête -->
  <div class="header">
    <div class="logo-block">
      <div class="logo">La&nbsp;<span>Cité</span>&nbsp;Covoiturage</div>
      <div class="logo-sub">Rapport officiel de signalement</div>
    </div>
    <div class="header-meta">
      <div class="report-title">Dossier de Signalement</div>
      <div class="meta-line">Trajet : <strong>#${trajetId}</strong></div>
      <div class="meta-line">Généré le : <strong>${now}</strong></div>
      <div class="ref-badge">REF #${refNum || 'EN COURS'}</div>
    </div>
  </div>

  ${urgentBanner}

  <!-- Section 1 : Informations du signalement -->
  <div class="section">
    <div class="section-title">Informations du signalement</div>
    <table>
      <tr>
        <td class="key">Cible du signalement</td>
        <td class="val">${data.cibleNom ? `${data.cibleNom} &mdash; ` : ''}${data.cible ?? '&mdash;'}</td>
      </tr>
      <tr>
        <td class="key">Motif retenu</td>
        <td class="val">${data.motifLabel || 'Non spécifié'}</td>
      </tr>
      <tr>
        <td class="key">Niveau de sécurité</td>
        <td class="val">
          ${sev
            ? `<span class="sev-badge" style="background:${sev.bg};color:${sev.color}">${sev.label}</span>`
            : '<span style="color:#9aaac0">Non spécifié</span>'
          }
        </td>
      </tr>
      <tr>
        <td class="key">Heure de l'incident</td>
        <td class="val">${data.heureIncident || 'Non précisée'}</td>
      </tr>
      <tr>
        <td class="key">Preuves jointes</td>
        <td class="val">${data.preuves.length} fichier(s) &bull; Journal GPS automatique joint</td>
      </tr>
    </table>
  </div>

  <!-- Section 2 : Description -->
  <div class="section">
    <div class="section-title">Description détaillée</div>
    <div class="desc-box">${data.description.trim() || 'Aucune description fournie.'}</div>
  </div>

  <!-- Section 3 : Options de traitement -->
  <div class="section">
    <div class="section-title">Options de traitement choisies</div>
    <table>
      ${optionRow('Signalement anonyme', data.options.anonyme)}
      ${optionRow('Contact administrateur accepté', data.options.accepterContact)}
      ${optionRow('Blocage de l\'utilisateur demandé', data.options.bloquerUtilisateur)}
      ${optionRow('Notification du résultat souhaitée', data.options.notifierResultat)}
    </table>
  </div>

  <!-- Section 4 : Processus de traitement -->
  <div class="section">
    <div class="section-title">Processus de traitement</div>
    <table>
      <tr>
        <td class="key">Délai de traitement</td>
        <td class="val">48 heures maximum</td>
      </tr>
      <tr>
        <td class="key">Données GPS</td>
        <td class="val">Journal de position complet joint automatiquement au dossier</td>
      </tr>
      <tr>
        <td class="key">Cadre légal</td>
        <td class="val">Traité selon les politiques La Cité Covoiturage et la LPRPDE / PIPEDA</td>
      </tr>
    </table>
  </div>

  <!-- Pied de page -->
  <div class="footer">
    <div class="footer-left">
      Document généré automatiquement par La Cité Covoiturage &mdash; confidentiel, usage interne uniquement.<br>
      En cas d'urgence immédiate, composez le <strong>911</strong>.
    </div>
    <div class="footer-right">
      REF #${refNum || 'EN COURS'}<br>
      ${now}
    </div>
  </div>

</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) setTimeout(() => win.print(), 600);
}
