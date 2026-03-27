// Panneau d'information du trajet — points de route, préférences, statut, véhicule, tarification
import type { ReactNode } from 'react';
import {
  FaSuitcase, FaPaw, FaSmokingBan, FaMusic,
  FaCommentDots, FaShieldAlt, FaCheck,
} from 'react-icons/fa';
import { FaCircleXmark } from 'react-icons/fa6';
import type {
  PointTrajet, PreferencesTrajet, StatutTrajet,
  ConducteurInfo, TarifTrajet,
} from '../types/trajet-en-cours.types';
import { C, card } from './trajet-page-styles';

interface TripInfoPanelProps {
  depart: PointTrajet;
  arrivee: PointTrajet;
  preferences: PreferencesTrajet;
  statut: StatutTrajet;
  conducteur: ConducteurInfo;
  tarif: TarifTrajet;
  isFR: boolean;
  /** Slot pour injecter du contenu sous la colonne statut (ex: PassengerList) */
  children?: ReactNode;
}

// Rend les deux colonnes d'information : route/préférences + statut/véhicule/tarif
export function TripInfoPanel({
  depart, arrivee, preferences, statut, conducteur, tarif, isFR, children,
}: TripInfoPanelProps) {
  return (
    <>
      {/* ═ Colonne 1 : Points du trajet + Préférences ═ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...card, flex: 1 }}>
          {/* Points du trajet */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.b}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.p, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.p, display: 'inline-block' }} />
              Points du trajet
            </div>
            {/* Départ */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.green, marginTop: 3 }} />
                <div style={{ width: 1.5, height: 18, background: 'rgba(8,49,110,0.12)', margin: '2px 0' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{isFR ? 'Départ' : 'Departure'} — {depart.nom}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 1, lineHeight: 1.4 }}>{depart.adresse}</div>
                {depart.instructions && (
                  <div style={{ fontSize: 12, color: C.cyan, marginTop: 3, fontStyle: 'italic' }}>{depart.instructions}</div>
                )}
              </div>
            </div>
            {/* Arrivée */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.red, marginTop: 3, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{isFR ? 'Arrivée' : 'Arrival'} — {arrivee.nom}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 1, lineHeight: 1.4 }}>{arrivee.adresse}</div>
                {arrivee.instructions && (
                  <div style={{ fontSize: 12, color: C.cyan, marginTop: 3, fontStyle: 'italic' }}>{arrivee.instructions}</div>
                )}
              </div>
            </div>
          </div>

          {/* Préférences */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.p, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.cyan, display: 'inline-block' }} />
              {isFR ? 'Préférences & services' : 'Preferences & services'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { ok: preferences.bagagesAutorises, label: isFR ? 'Bagages autorisés' : 'Luggage allowed', Icon: FaSuitcase },
                { ok: preferences.animauxAcceptes, label: isFR ? 'Animaux acceptés' : 'Pets accepted', Icon: FaPaw },
                { ok: !preferences.fumeur, label: isFR ? 'Non-fumeur' : 'Non-smoking', Icon: FaSmokingBan },
                { ok: preferences.musique, label: isFR ? 'Musique acceptée' : 'Music accepted', Icon: FaMusic },
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <p.Icon size={15} color={p.ok ? C.green : C.muted} />
                  <span style={{ color: p.ok ? C.green : C.red, fontWeight: 600 }}>
                    {p.ok ? <FaCheck size={10} /> : <FaCircleXmark size={10} />}
                  </span>
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
            {preferences.messagePassagers && (
              <div style={{ marginTop: 10, padding: '8px 10px', background: C.bg, borderRadius: 8, fontSize: 13, color: C.p, borderLeft: `3px solid ${C.p}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaCommentDots size={13} color={C.p} />
                <em>{preferences.messagePassagers}</em>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═ Colonne 2 : Statut du trajet + Véhicule + Tarification ═ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...card, flex: 1 }}>
          {/* Statut */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.b}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.p, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
              {isFR ? 'Statut du trajet' : 'Trip status'}
            </div>
            {[
              { k: isFR ? 'État' : 'Status', v: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: C.gnb, color: C.green, fontSize: 12, fontWeight: 700, border: '1px solid rgba(10,173,106,.25)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block', animation: 'pulse 1.5s infinite' }} />{isFR ? 'En cours…' : 'In progress…'}</span> },
              { k: isFR ? 'Type de départ' : 'Departure type', v: statut.typeDepart === 'unique' ? (isFR ? 'Unique' : 'One-time') : (isFR ? 'Récurrent' : 'Recurring') },
              { k: isFR ? 'Récurrent' : 'Recurring', v: statut.estRecurrent ? (isFR ? 'Oui' : 'Yes') : (isFR ? 'Non' : 'No') },
              { k: isFR ? 'Détour max.' : 'Max detour', v: `${statut.detourMaxMin} min` },
              { k: isFR ? 'Paiement' : 'Payment', v: statut.modePaiement === 'comptant' ? (isFR ? 'Argent comptant' : 'Cash') : (isFR ? 'Virtuel' : 'Virtual') },
              { k: isFR ? 'Places' : 'Seats', v: `${statut.nbPlacesDisponibles} / ${statut.nbPlacesTotales} ${isFR ? 'disponibles' : 'available'}` },
              { k: isFR ? 'Dernière MÀJ' : 'Last update', v: <span style={{ color: C.muted }}>{statut.derniereMaj.toLocaleDateString(isFR ? 'fr-CA' : 'en-CA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span> },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < 6 ? '1px solid rgba(8,49,110,.05)' : 'none' }}>
                <span style={{ fontSize: 13, color: C.muted }}>{row.k}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{row.v}</span>
              </div>
            ))}
          </div>

          {/* Véhicule */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.b}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.p, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold, display: 'inline-block' }} />
              {isFR ? 'Véhicule' : 'Vehicle'}
            </div>
            {[
              { k: isFR ? 'Modèle' : 'Model', v: `${conducteur.vehicule.marque} ${conducteur.vehicule.modele} ${conducteur.vehicule.annee}` },
              { k: isFR ? 'Couleur' : 'Color', v: conducteur.vehicule.couleur },
              { k: isFR ? 'Plaque' : 'Plate', v: <span style={{ fontFamily: 'monospace' }}>{conducteur.vehicule.immatriculation}</span> },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < 2 ? '1px solid rgba(8,49,110,.05)' : 'none' }}>
                <span style={{ fontSize: 13, color: C.muted }}>{row.k}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{row.v}</span>
              </div>
            ))}
          </div>

          {/* Tarification */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.p, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.p, display: 'inline-block' }} />
              {isFR ? 'Tarification' : 'Pricing'}
            </div>
            {[
              { k: isFR ? 'Prix par passager' : 'Price per passenger', v: <span style={{ color: C.green, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16 }}>+{tarif.prixParPassager} $</span> },
              { k: isFR ? 'Économie vs taxi' : 'Savings vs taxi', v: <span style={{ color: C.green }}>~{tarif.economieVsTaxi} $</span> },
              { k: isFR ? 'CO₂ économisé' : 'CO₂ saved', v: <span style={{ color: C.green, display: 'inline-flex', alignItems: 'center', gap: 3 }}>~{tarif.co2EconomiseKg} kg <FaShieldAlt size={11} color={C.green} /></span> },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < 2 ? '1px solid rgba(8,49,110,.05)' : 'none' }}>
                <span style={{ fontSize: 13, color: C.muted }}>{row.k}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slot pour contenu additionnel (PassengerList) */}
        {children}
      </div>
    </>
  );
}
