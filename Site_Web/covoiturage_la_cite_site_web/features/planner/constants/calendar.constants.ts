import { PublishedTripStatus, ReservationStatus, StatusColorsMap } from "@/features/planner/types/calendar.types";

// ─── ANIMATION ────────────────────────────────────────────────────────────────

/** Durée de la transition d'animation du carrousel (ms) */
export const TRANSITION_MS = 320;

// ─── GRILLE HORAIRE ───────────────────────────────────────────────────────────

/** Nombre de pixels par minute dans la vue hebdomadaire (1 min = PX_PER_MIN px) */
export const PX_PER_MIN = 1.6;

/** Heure de début de journée pour le scroll initial (ex : 5 = 05h00) */
export const DAY_START_HOUR = 5;

// ─── LIMITES ANNÉE ────────────────────────────────────────────────────────────

const today = new Date();

/** Année minimale affichable dans le sélecteur d'année */
export const MIN_YEAR = today.getFullYear() - 20;

/** Année maximale affichable dans le sélecteur d'année */
export const MAX_YEAR = today.getFullYear() + 20;

/** Date du jour (référence stable partagée) */
export const TODAY = new Date();

// ─── LIBELLÉS ─────────────────────────────────────────────────────────────────

/** Noms des mois en français */
export const MONTHS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

/** Noms des mois en anglais */
export const MONTHS_EN = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

/** Noms des jours en français (index 0 = Dimanche) */
export const DAYS_FR = [
  "Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi",
];

/** Noms des jours en anglais (index 0 = Sunday) */
export const DAYS_EN = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
];

// ─── COULEURS DE STATUT — CONDUCTEUR ─────────────────────────────────────────

/** Palette de couleurs associées aux statuts de trajet pour le rôle conducteur */
export const DRIVER_STATUS_COLORS: StatusColorsMap = {
  [PublishedTripStatus.Published]:  { bg: "#9ca3af", text: "#fff", light: "rgba(156,163,175,0.18)" },
  [PublishedTripStatus.Full]:       { bg: "#facc15", text: "#fff", light: "rgba(250,204,21,0.18)"  },
  [PublishedTripStatus.Confirmed]:  { bg: "#4ade80", text: "#fff", light: "rgba(74,222,128,0.18)"  },
  [PublishedTripStatus.InProgress]: { bg: "#f87171", text: "#fff", light: "rgba(248,113,113,0.18)" },
  [PublishedTripStatus.Completed]:  { bg: "#08316e", text: "#fff", light: "rgba(8,49,110,0.18)"    },
  [PublishedTripStatus.Cancelled]:  { bg: "#fb923c", text: "#fff", light: "rgba(251,146,60,0.18)"  },
  [PublishedTripStatus.NoShow]:     { bg: "#9ca3af", text: "#fff", light: "rgba(156,163,175,0.18)" },
};

// ─── COULEURS DE STATUT — PASSAGER ────────────────────────────────────────────

/** Palette de couleurs associées aux statuts de réservation pour le rôle passager */
export const PASSENGER_STATUS_COLORS: StatusColorsMap = {
  [ReservationStatus.Confirmed]:  { bg: "#4ade80", text: "#fff", light: "rgba(74,222,128,0.18)"  },
  [ReservationStatus.Pending]:    { bg: "#4b5563", text: "#fff", light: "rgba(75,85,99,0.18)"    },
  [ReservationStatus.Cancelled]:  { bg: "#fb923c", text: "#fff", light: "rgba(251,146,60,0.18)"  },
  [ReservationStatus.Completed]:  { bg: "#08316e", text: "#fff", light: "rgba(8,49,110,0.18)"    },
  [ReservationStatus.InProgress]: { bg: "#f87171", text: "#fff", light: "rgba(248,113,113,0.18)" },
};

// ─── STYLES PARTAGÉS ──────────────────────────────────────────────────────────

/** Style du bouton de navigation (précédent / suivant) */
export const navBtnStyle: React.CSSProperties = {
  background:      "transparent",
  width:           34,
  height:          34,
  display:         "flex",
  alignItems:      "center",
  justifyContent:  "center",
  color:           "#08316e",
  cursor:          "pointer",
  transition:      "all 0.2s",
};

/** Style du sélecteur déroulant (mois / année) */
export const selectStyle: React.CSSProperties = {
  appearance:    "none",
  textAlign:     "center",
  letterSpacing: 0.3,
  color:         "#08316e",
  background:    "transparent",
  border:        "1px solid rgba(0,0,0,0.12)",
  borderRadius:  8,
  fontSize:      18,
  fontWeight:    600,
  padding:       "4px 8px",
  cursor:        "pointer",
  outline:       "none",
};
