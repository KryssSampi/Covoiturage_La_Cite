"use client";

/**
 * @file CalendarToast.tsx
 * @description Overlay de toast affiché sur le calendrier lorsque l'utilisateur
 * clique sur le bouton "+" d'un DayCell.
 *
 * Ce toast invite l'utilisateur à sélectionner la période de départ de son trajet
 * en cliquant sur un TimeCell dans la vue semaine.
 * Le bouton "Ok" ferme le toast et bascule en vue semaine.
 */

import { FaCalendarDays } from "react-icons/fa6";
import { useHeroSearchBar } from "@/features/planner/context/SearchBarContext";

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface CalendarToastProps {
  /** Callback déclenché au clic sur "Ok, compris" (bascule en vue semaine) */
  onOk?: () => void;
}

// ─── COMPOSANT ────────────────────────────────────────────────────────────────

export function CalendarToast({ onOk }: CalendarToastProps) {
  const { showCalendarToast, setShowCalendarToast } = useHeroSearchBar();

  // Ne rien rendre si le toast n'est pas actif
  if (!showCalendarToast) return null;

  /** Ferme le toast et bascule en vue semaine */
  const handleOk = () => {
    setShowCalendarToast(false);
    onOk?.();
  };

  return (
    // Overlay qui couvre uniquement le calendrier (position absolute sur le container parent)
    <div
      style={{
        position:       "absolute",
        inset:          0,
        zIndex:         50,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        background:     "rgba(8, 49, 110, 0.45)",
        backdropFilter: "blur(3px)",
        borderRadius:   "inherit",
      }}
      // Clic sur le fond de l'overlay ferme aussi le toast
      onClick={handleOk}
    >
      {/* Carte du message — stopPropagation pour éviter la fermeture au clic intérieur */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:   "#fff",
          borderRadius: 14,
          padding:      "24px 28px",
          maxWidth:     340,
          width:        "90%",
          boxShadow:    "0 8px 32px rgba(8,49,110,0.22), 0 2px 8px rgba(0,0,0,0.10)",
          textAlign:    "center",
        }}
      >
        {/* Icône calendrier */}
        <div style={{
          width:          48,
          height:         48,
          borderRadius:   "50%",
          background:     "rgba(8,49,110,0.09)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          margin:         "0 auto 14px",
        }}>
          <FaCalendarDays size={22} color="#08316e" />
        </div>

        {/* Titre */}
        <p style={{
          margin:     "0 0 8px",
          fontSize:   16,
          fontWeight: 700,
          color:      "#08316e",
          lineHeight: 1.3,
        }}>
          Sélectionnez votre période de départ
        </p>

        {/* Sous-titre */}
        <p style={{
          margin:     "0 0 20px",
          fontSize:   13,
          color:      "#5a6a85",
          lineHeight: 1.5,
        }}>
          Cliquez sur un créneau horaire dans la vue semaine pour définir la date
          et l&apos;heure de départ de votre trajet.
        </p>

        {/* Bouton Ok — ferme le toast et bascule en vue semaine */}
        <button
          onClick={handleOk}
          style={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          8,
            padding:      "9px 24px",
            background:   "#08316e",
            color:        "#fff",
            border:       "none",
            borderRadius: 8,
            fontSize:     14,
            fontWeight:   700,
            cursor:       "pointer",
            transition:   "background 0.18s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#0a4a9e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#08316e")}
        >
          Ok, compris
        </button>
      </div>
    </div>
  );
}
