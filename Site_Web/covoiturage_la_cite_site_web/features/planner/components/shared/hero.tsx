"use client";

import { useState, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import Image from "next/image";
import { useIsMobileOrTablet } from "@/shared/hooks/useismobileortable";
import { Language, useAppState } from "@/core/state/app_state";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import { FaX, FaPlus, FaMagnifyingGlass, FaCalendarXmark, FaCircleInfo, FaLocationDot } from "react-icons/fa6";
import { useHeroSearchBar } from "@/features/planner/context/SearchBarContext";
import { useIndisponibility } from "@/features/planner/context/IndisponibilityContext";
import { LocationSuggestion } from "@/features/search/hooks/useRouteMap";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

/** Options du <select> de jours par langue */
const WEEKDAY_OPTIONS = [
  { value: "monday",    fr: "Lundi",     en: "Monday"    },
  { value: "tuesday",   fr: "Mardi",     en: "Tuesday"   },
  { value: "wednesday", fr: "Mercredi",  en: "Wednesday" },
  { value: "thursday",  fr: "Jeudi",     en: "Thursday"  },
  { value: "friday",    fr: "Vendredi",  en: "Friday"    },
  { value: "saturday",  fr: "Samedi",    en: "Saturday"  },
  { value: "sunday",    fr: "Dimanche",  en: "Sunday"    },
];

/** Correspondance valeur anglicisée → libellé traduit */
const WEEKDAY_LABEL: Record<string, { fr: string; en: string }> = {
  monday:    { fr: "Lundi",    en: "Monday"    },
  tuesday:   { fr: "Mardi",    en: "Tuesday"   },
  wednesday: { fr: "Mercredi", en: "Wednesday" },
  thursday:  { fr: "Jeudi",    en: "Thursday"  },
  friday:    { fr: "Vendredi", en: "Friday"    },
  saturday:  { fr: "Samedi",   en: "Saturday"  },
  sunday:    { fr: "Dimanche", en: "Sunday"    },
};

// ─── Portal de suggestions ──────────────────────────────────────────────────────

/** Dépasse overflow:hidden + max-height du slide container */
function PlannerSuggestionPortal({
  inputRef,
  suggestions,
  onSelect,
}: {
  inputRef:    { readonly current: HTMLInputElement | null };
  suggestions: LocationSuggestion[];
  onSelect:    (s: LocationSuggestion) => void;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    if (!suggestions.length || !inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 220) });
  }, [suggestions, inputRef]);

  if (!suggestions.length || !coords || typeof document === "undefined") return null;

  return createPortal(
    <div style={{
      position:    "fixed",
      top:         coords.top,
      left:        coords.left,
      width:       coords.width,
      zIndex:      99999,
      background:  "#fff",
      borderRadius: 8,
      border:      "1px solid #e5e7eb",
      boxShadow:   "0 10px 25px rgba(8,49,110,0.18)",
      overflow:    "hidden",
    }}>
      {suggestions.map((s: LocationSuggestion, i: number) => (
        <button key={i} onMouseDown={() => onSelect(s)}
          className="w-full text-left px-3 py-2 text-xs text-gray-800 hover:bg-blue-50 border-b border-gray-100 last:border-0 block"
        >
          <FaLocationDot size={11} color="#08316e" /> {s.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

/**
 * Hero de la page planificateur.
 * Contient la barre de recherche de trajet (avec autocomplétion Photon + heures)
 * et le panneau de gestion des indisponibilités récurrentes hebdomadaires.
 *
 * Quand "Rechercher" est cliqué, `triggerPlannerSearch()` consolide les valeurs
 * et active le mode "planner search" (SuperCalendar → RouteMapSearch compact).
 */
export function Hero() {
  // ── Contextes ────────────────────────────────────────────────────────────
  const {
    searchbarIsActive,
    setSearchbarIsActive,
    // Départ
    departureValue,
    departureSuggestions,
    onDepartureChange,
    onDepartureSelect,
    departureinputRef,
    // Arrivée
    arrivalValue,
    arrivalSuggestions,
    onArrivalChange,
    onArrivalSelect,
    arrivalinputRef,
    // Date
    dateValue,
    setDateValue,
    dateinputRef,
    // Mode planner search
    triggerPlannerSearch,
  } = useHeroSearchBar();

  const {
    disponibilitySetterIsActive,
    setDisponibilitySetterIsActive,
    indisponibilities,
    removeIndisponibility,
    formWeekday, setFormWeekday,
    formStart,   setFormStart,
    formEnd,     setFormEnd,
    submitForm,
    resetForm,
  } = useIndisponibility();

  const appState = useAppState();
  const isFR     = appState.lang === Language.FR;
  const isMobile = useIsMobileOrTablet();

  const displayedIndisponibilities = useMemo(() => {
    const grouped = new Map<string, (typeof indisponibilities)[number]>();

    for (const item of indisponibilities) {
      const key = item.weekday && item.start && item.end
        ? `${item.weekday}|${item.start}|${item.end}`
        : `${item.startAt}|${item.endAt}`;

      if (!grouped.has(key)) {
        grouped.set(key, item);
      }
    }

    return Array.from(grouped.values());
  }, [indisponibilities]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  /** Ouvre RouteMapSearch immédiatement avec un formulaire vide */
  const handleSearchClick = () => {
    setDisponibilitySetterIsActive(false);
    triggerPlannerSearch(); // formulaire vide, sans date/heure pré-remplie
  };

  /** Bascule le panneau d'indisponibilité et ferme la barre de recherche */
  const handleToggleDisponibility = () => {
    setSearchbarIsActive(false);
    setDisponibilitySetterIsActive(!disponibilitySetterIsActive);
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <section className="w-full relative rounded-xs flex flex-col bg-[#2a2aa3] overflow-hidden shadow-2xl">

      {/* ─── Zone hero (image + titre + boutons) ─────────────────────────── */}
      <div className="relative w-full h-60 flex items-center justify-center">
        {/* Image de fond */}
        <Image
          src="/img/planifier-background.png"
          alt="Hero Image"
          fill
          className="absolute object-cover"
        />
        {/* Dégradé bas */}
        <div className="absolute bg-linear-to-t from-[#08316e] to-transparent inset-0 top-12 h-4/5 bottom-0 shadow-lg" />

        {/* Texte du héro */}
        <div className="relative text-white text-2xl lg:text-5xl font-bold text-left w-full bg-black/20 h-full flex flex-col justify-center py-15 px-4">
          {isFR
            ? "Planifiez votre prochain trajet en toute simplicité"
            : "Plan your next trip with ease"}
          {!isMobile && (
            <p className="mt-4 text-lg lg:text-2xl font-medium text-gray-200">
              {isFR
                ? "Trouvez les meilleures options de covoiturage pour vos déplacements quotidiens ou occasionnels."
                : "Find the best carpooling options for your daily or occasional trips."}
            </p>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="absolute bottom-4 right-4 flex items-center gap-4 flex-wrap justify-end">
          {/* Bouton disponibilité — amber si panneau ouvert, bleu sinon */}
          <button
            onClick={handleToggleDisponibility}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-200 hover:scale-105 shadow ${
              disponibilitySetterIsActive
                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600"
                : "bg-blue-800 hover:bg-blue-700  text-white border-blue-900"
            }`}
          >
            <FaCalendarXmark />
            {isFR ? "Modifier ma disponibilité" : "Modify My Availability"}
          </button>

          {/* Bouton planifier trajet */}
          <button
            onClick={handleSearchClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white hover:bg-gray-100 text-[#08316e] rounded-lg border border-black/20 shadow hover:scale-105 transition-all duration-200"
          >
            <FaMagnifyingGlass />
            {isFR ? "Planifier un trajet" : "Plan a Trip"}
          </button>
        </div>
      </div>

      {/* ─── Barre de recherche (slide depuis le haut) ───────────────────── */}
      <div
        className={`w-full relative overflow-hidden transition-all duration-500 ${
          searchbarIsActive ? "max-h-56 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`flex ${
            isMobile ? "flex-col gap-3" : "flex-row gap-2 flex-wrap"
          } items-start px-6 py-4 bg-[#08316e]`}
        >
          {/* ── Départ avec autocomplétion ─────────────────────────────── */}
          <div className="flex flex-col text-white">
            <span className="text-xs font-semibold mb-1 flex items-center gap-1">
              <FaLocationDot size={10} className="text-blue-300" />
              {isFR ? "Lieu de départ" : "Departure"}
            </span>
            <div className="relative">
              <input
                type="text"
                ref={departureinputRef}
                value={departureValue}
                onChange={(e) => onDepartureChange(e.target.value)}
                placeholder={isFR ? "Ex : Campus La Cité" : "Ex: La Cité Campus"}
                className="h-9 rounded-md px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-44"
              />
              {/* Suggestions départ — portal pour dépasser overflow:hidden du slide container */}
              <PlannerSuggestionPortal inputRef={departureinputRef} suggestions={departureSuggestions} onSelect={onDepartureSelect} />
            </div>
          </div>

          <FaArrowRight className={`text-white text-sm shrink-0 mt-7 ${isMobile ? "rotate-90" : ""}`} />

          {/* ── Arrivée avec autocomplétion ───────────────────────────── */}
          <div className="flex flex-col text-white">
            <span className="text-xs font-semibold mb-1 flex items-center gap-1">
              <FaLocationDot size={10} className="text-red-300" />
              {isFR ? "Lieu d'arrivée" : "Arrival"}
            </span>
            <div className="relative">
              <input
                type="text"
                ref={arrivalinputRef}
                value={arrivalValue}
                onChange={(e) => onArrivalChange(e.target.value)}
                placeholder={isFR ? "Ex : Domicile" : "Ex: Home"}
                className="h-9 rounded-md px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-44"
              />
              {/* Suggestions arrivée — portal pour dépasser overflow:hidden du slide container */}
              <PlannerSuggestionPortal inputRef={arrivalinputRef} suggestions={arrivalSuggestions} onSelect={onArrivalSelect} />
            </div>
          </div>

          {/* ── Date ──────────────────────────────────────────────────── */}
          <div className="flex flex-col text-white">
            <span className="text-xs font-semibold mb-1">
              {isFR ? "Date" : "Date"}
            </span>
            <input
              type="date"
              ref={dateinputRef}
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="h-9 rounded-md px-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Heures départ/arrivée masquées — le conducteur cherche des circuits, pas des créneaux horaires */}

          {/* ── Bouton Rechercher → déclenche le mode planner search ─── */}
          <button
            onClick={() => triggerPlannerSearch()}
            className="self-end inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white hover:bg-gray-100 text-[#08316e] rounded-lg border border-black/20 shadow hover:scale-105 transition-all duration-200"
          >
            <FaMagnifyingGlass />
            {isFR ? "Rechercher" : "Search"}
          </button>

          {/* ── Fermer la searchbar ────────────────────────────────────── */}
          <button
            onClick={() => setSearchbarIsActive(false)}
            className="self-center absolute top-7 right-10 text-white hover:text-red-300 transition-colors"
            aria-label={isFR ? "Fermer la recherche" : "Close search"}
          >
            <FaX size={26} />
          </button>
        </div>
      </div>

      {/* ─── Panneau d'indisponibilité ────────────────────────────────────── */}
      <div
        className={`w-full  overflow-hidden transition-all duration-500 ${
          disponibilitySetterIsActive
            ? "max-h-112 opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#08316e] text-white px-6 py-4 flex flex-col gap-4">

          {/* En-tête du panneau */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FaCalendarXmark />
              {isFR
                ? "Gérer mes indisponibilités récurrentes"
                : "Manage My Recurring Unavailabilities"}
            </h2>
            <button
              onClick={() => setDisponibilitySetterIsActive(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg border border-red-700 shadow hover:scale-105 transition-all duration-200"
            >
              <FaX size={10} />
              {isFR ? "Fermer" : "Close"}
            </button>
          </div>

          {/* Corps : formulaire + liste */}
          <div
            className={`flex gap-6 ${
              isMobile ? "flex-col" : "flex-row items-start"
            }`}
          >
            {/* ── Colonne gauche : formulaire d'ajout ── */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-200">
                {isFR ? "Ajouter une indisponibilité :" : "Add an unavailability:"}
              </p>

              {/* Ligne de saisie */}
              <div className="flex items-end gap-2 flex-wrap">
                {/* Jour de la semaine */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs text-blue-200">
                    {isFR ? "Tous les :" : "Every:"}
                  </label>
                  <select
                    value={formWeekday}
                    onChange={(e) => setFormWeekday(e.target.value)}
                    className="h-9 rounded-md px-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-32"
                  >
                    {WEEKDAY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {isFR ? opt.fr : opt.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Heure de début */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs text-blue-200">
                    {isFR ? "De :" : "From:"}
                  </label>
                  <input
                    type="time"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="h-9 rounded-md px-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-28"
                  />
                </div>

                {/* Heure de fin */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs text-blue-200">
                    {isFR ? "À :" : "To:"}
                  </label>
                  <input
                    type="time"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="h-9 rounded-md px-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-28"
                  />
                </div>

                {/* Bouton Ajouter — vert */}
                <button
                  onClick={submitForm}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg border border-green-700 shadow hover:scale-105 transition-all duration-200"
                >
                  <FaPlus size={11} />
                  {isFR ? "Ajouter" : "Add"}
                </button>

                {/* Bouton Réinitialiser — rouge */}
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg border border-red-700 shadow hover:scale-105 transition-all duration-200"
                >
                  <FaX size={11} />
                  {isFR ? "Réinitialiser" : "Reset"}
                </button>
              </div>

              {/* Phrase informative sur le calendrier */}
              <p className="text-xs text-amber-300 flex items-start gap-1.5 mt-1 leading-snug">
                <FaCircleInfo className="shrink-0 mt-0.5" size={12} />
                {isFR
                  ? "Vous pouvez également cocher les cases correspondant à votre indisponibilité dans le calendrier ci-dessous."
                  : "You can also check the boxes corresponding to your unavailabilities directly in the calendar below."}
              </p>
            </div>

            {/* ── Colonne droite : aperçu des indisponibilités ── */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-200">
                {isFR
                  ? `Indisponibilités enregistrées (${displayedIndisponibilities.length}) :`
                  : `Saved unavailabilities (${displayedIndisponibilities.length}):`}
              </p>

              {displayedIndisponibilities.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  {isFR
                    ? "Aucune indisponibilité enregistrée."
                    : "No unavailabilities recorded yet."}
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1"
                >
                  {displayedIndisponibilities.map((item, idx) => {
                    const dayLabel = item.weekday
                      ? WEEKDAY_LABEL[item.weekday.toLowerCase()]?.[isFR ? "fr" : "en"] ?? item.weekday
                      : format(new Date(item.startAt), isFR ? "dd/MM/yyyy" : "yyyy-MM-dd");
                    const timeLabel = item.start && item.end
                      ? `${item.start} → ${item.end}`
                      : `${format(new Date(item.startAt), "HH:mm")} → ${format(new Date(item.endAt), "HH:mm")}`;
                    return (
                      <li
                        key={idx}
                        className="flex items-center justify-between gap-2 bg-white/10 rounded-lg px-3 py-1.5 text-sm"
                      >
                        <span>
                          {`${dayLabel} · ${timeLabel}`}
                        </span>
                        <button
                          onClick={() => removeIndisponibility(item)}
                          className="shrink-0 p-1 rounded-full text-red-300 hover:text-red-100 hover:bg-red-500/30 transition"
                          aria-label={isFR ? "Supprimer" : "Remove"}
                        >
                          <FaX size={10} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* ── Pied du panneau : bouton Valider ── */}
          <div className="flex justify-end pt-2 border-t border-white/10">
            <button
              onClick={() => setDisponibilitySetterIsActive(false)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg border border-green-700 shadow hover:scale-105 transition-all duration-200"
            >
              <FaCheck size={12} />
              {isFR ? "Valider et fermer" : "Validate & Close"}
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}
