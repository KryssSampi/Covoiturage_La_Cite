// Barre d'actions en bas de page — évaluation du trajet + signalement/litige/SOS
import type { Dispatch, SetStateAction } from 'react';
import {
  FaStar, FaRegStar, FaPaperPlane, FaCheck,
  FaFlag, FaShieldAlt, FaPhone,
} from 'react-icons/fa';
import type { EvaluationState, ConducteurInfo, PointTrajet, PassagerInfo } from '../types/trajet-en-cours.types';
import { C, card } from './trajet-page-styles';
import { FaUserFriends } from 'react-icons/fa';

interface ActionBarProps {
  role?: 'driver' | 'passenger';
  conducteur: Pick<ConducteurInfo, 'prenom' | 'nom'>;
  depart: Pick<PointTrajet, 'nom'>;
  arrivee: Pick<PointTrajet, 'nom'>;
  passagers?: PassagerInfo[];
  alreadyReviewedIds?: string[];
  eval_: EvaluationState;
  setEval_: Dispatch<SetStateAction<EvaluationState>>;
  onSubmitEval: () => void;
  ratingLabels: Record<number, string>;
  isFR: boolean;
  onShowSignalement: () => void;
  onShowLitige: () => void;
}

// Section bas-de-page : carte d'évaluation + carte signalement/litige/SOS
export function ActionBar({
  role, conducteur, depart, arrivee,
  passagers = [], alreadyReviewedIds = [],
  eval_, setEval_, onSubmitEval, ratingLabels,
  isFR,
  onShowSignalement, onShowLitige,
}: ActionBarProps) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>

      {/* Carte évaluation */}
      <div className='justify-items-center' style={{ ...card, flex: 1, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Sélecteur passager — conducteur uniquement */}
        {role === 'driver' && passagers.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
              <FaUserFriends size={13} color={C.p} />
              {isFR ? 'Évaluer :' : 'Rate:'}
            </span>
            <select
              value={eval_.passagerSelectionne ?? ''}
              onChange={(e) => setEval_((p) => ({ ...p, passagerSelectionne: e.target.value, note: 0, commentaire: '' }))}
              disabled={eval_.estSoumis}
              style={{ flex: 1, padding: '5px 8px', borderRadius: 7, border: `1.5px solid ${C.b2}`, background: C.bg, fontSize: 12, color: C.text, fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
            >
              <option value="">{isFR ? '— Passager —' : '— Passenger —'}</option>
              {passagers.map((p) => (
                <option key={p.id} value={p.id} disabled={alreadyReviewedIds.includes(p.id)}>
                  {p.prenom} {p.nom}{alreadyReviewedIds.includes(p.id) ? ' ✓' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Ligne du haut : titre + étoiles */}
        <div className='my-5' style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: C.p, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaStar size={14} color={C.gold} /> {isFR ? 'Évaluer votre trajet' : 'Rate your trip'}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              {conducteur.prenom} {conducteur.nom} · {depart.nom} → {arrivee.nom}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => !eval_.estSoumis && setEval_((p) => ({ ...p, note: n }))}
                  style={{
                    background: 'none', border: 'none', cursor: eval_.estSoumis ? 'default' : 'pointer',
                    transition: '.15s', lineHeight: 1, padding: 0,
                  }}
                >
                  {n <= eval_.note
                    ? <FaStar size={22} color={C.gold} />
                    : <FaRegStar size={22} color="rgba(8,49,110,0.12)" />
                  }
                </button>
              ))}
            </div>
            {eval_.note > 0 && (
              <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>
                {ratingLabels[eval_.note]}
              </span>
            )}
          </div>
        </div>

        {/* Commentaire + soumettre */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            value={eval_.commentaire}
            onChange={(e) => !eval_.estSoumis && setEval_((p) => ({ ...p, commentaire: e.target.value }))}
            placeholder={isFR ? "Laisser un commentaire… (optionnel)" : "Leave a comment… (optional)"}
            disabled={eval_.estSoumis}
            style={{
              flex: 1, background: C.bg, border: `1.5px solid ${C.b2}`,
              borderRadius: 9, padding: '9px 12px', fontSize: 12,
              fontFamily: 'DM Sans, sans-serif', color: C.text, outline: 'none',
              resize: 'none', height: 54,
            }}
          />
          <button
            onClick={onSubmitEval}
            disabled={eval_.estSoumis}
            style={{
              padding: '9px 20px', borderRadius: 9,
              background: eval_.estSoumis ? C.green : C.p,
              color: '#fff',
              border: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
              cursor: eval_.estSoumis ? 'default' : 'pointer', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {eval_.estSoumis ? <><FaCheck size={11} /> {isFR ? 'Envoyé' : 'Sent'}</> : <><FaPaperPlane size={11} /> {isFR ? 'Soumettre' : 'Submit'}</>}
          </button>
        </div>
      </div>

      {/* Carte signalement + SOS + Litige */}
      <div style={{
        ...card,
        padding: '18px 22px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', gap: 10, minWidth: 180, textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: C.text }}>
          {isFR ? 'Signaler un trajet' : 'Report a trip'}
        </div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>
          {isFR ? <>Un problème<br />pendant ce trajet ?</> : <>A problem<br />during this trip?</>}
        </div>
        <button
          onClick={onShowSignalement}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', background: C.red,
            border: 'none',
            borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
          }}
        >
          <FaFlag size={12} /> {isFR ? 'Signaler un problème' : 'Report a problem'}
        </button>

        {/* Déclarer un litige */}
        <button
          onClick={onShowLitige}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', background: C.p,
            border: 'none',
            minWidth: 180,
            borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
          }}
        >
          <FaShieldAlt size={12} /> {isFR ? 'Déclarer un litige' : 'File a dispute'}
        </button>

        {/* SOS Urgence — mobile uniquement */}
        <a
          href="tel:911"
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', background: '#b91c1c',
            border: 'none',
            minWidth: 180,
            borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 12,
            textDecoration: 'none', cursor: 'pointer',
          }}
          className="md:hidden"
        >
          <FaPhone size={12} /> {isFR ? 'SOS Urgence' : 'SOS Emergency'}
        </a>
      </div>
    </div>
  );
}
