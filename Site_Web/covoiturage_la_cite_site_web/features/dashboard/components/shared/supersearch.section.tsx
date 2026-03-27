"use client";

/**
 * @file supersearch.section.tsx
 * @description Formulaire de recherche/création de trajet — commun à tous les rôles.
 *
 * Rendu visuel uniquement : toute la logique est dans useSuperSearch.
 *
 * Fonctionnalités affichées :
 * - Inputs départ / arrivée avec autocomplétion (getProposals)
 * - Bouton de géolocalisation sur le champ départ
 * - Menu déroulant des favoris rapides sur le champ arrivée
 * - Sélecteur date + heure (toggle Maintenant / Planifié)
 * - Toggle Départ ↔ Arrivée dans le DateTimePicker
 * - Bouton Rechercher (passager) ou Planifier (conducteur)
 *
 * @uses useSuperSearch — toute la logique d'état, date, géolocalisation, soumission
 * @uses SearchParams, SuperSearchSectionProps — types depuis dashboard/types
 */

import { JSX, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { FaLocationDot, FaMagnifyingGlass } from "react-icons/fa6";
import {
  FaChevronDown,
  FaHome,
  FaPlus,
} from "react-icons/fa";

import { Language, useAppState } from "@/core/state/app_state";
import { FIXTURE_LIEUX_FAVORIS } from "@/shared/fixtures/favoris.fixtures";
import { getLieuFavoriIcon } from "@/shared/utils/lieu-favori-icon";

import { useSuperSearch } from "../../hooks";
import { LocationSuggestion, SuperSearchSectionProps } from "../../types/search.types";
import { DateTimePicker } from "./DateTimePicker";

// ─── Destinations favorites par défaut ───────────────────────────────────────
// Générées depuis la fixture unifiée des lieux favoris.

const DEFAULT_FAV_DESTINATIONS: SuperSearchSectionProps["favDestinations"] =
  FIXTURE_LIEUX_FAVORIS.map((fav) => ({
    label: fav.pseudonyme,
    value: fav.adresse,
    icon:  getLieuFavoriIcon(fav.iconTag, ""),
    coordonnees: fav.coordonnees,
  }));

// ─── Portal de suggestions ───────────────────────────────────────────────────

/** Contourne le stacking context créé par scale-110 sur le form */
function SuperSuggestionPortal({
  anchorRef,
  suggestions,
  onSelect,
}: {
  anchorRef:   { readonly current: HTMLElement | null };
  suggestions: LocationSuggestion[];
  onSelect:    (s: LocationSuggestion) => void;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    if (!suggestions.length || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 220) });
  }, [suggestions, anchorRef]);

  if (!suggestions.length || !coords || typeof document === "undefined") return null;

  return createPortal(
    <ul style={{
      position:    "fixed",
      top:         coords.top,
      left:        coords.left,
      width:       coords.width,
      zIndex:      99999,
      background:  "#fff",
      borderRadius: 6,
      border:      "1px solid #d1d5db",
      boxShadow:   "0 10px 25px rgba(8,49,110,0.18)",
      overflow:    "hidden",
      padding:     0,
      margin:      0,
      listStyle:   "none",
    }}>
      {suggestions.map((s, i) => (
        <li
          key={i}
          className="p-3 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0 text-gray-800"
          onMouseDown={() => onSelect(s)}
        >
          {s.label}
        </li>
      ))}
    </ul>,
    document.body,
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * SuperSearchSection
 *
 * @param onSearch Callback déclenché à la soumission.
 *   TODO: Brancher sur POST /api/trajets/search (passager)
 *     OU  router.push("/trajets/create") avec les params (conducteur)
 * @param defaultDeparture Valeur initiale du champ départ.
 *   Alimenté automatiquement via CustomEvent depuis FavoritesSection.
 * @param defaultArrival Valeur initiale du champ arrivée.
 * @param favDestinations Destinations rapides dans le menu déroulant arrivée.
 *   TODO: Fournir depuis le parent après GET /api/users/{userId}/favorites
 */
export function SuperSearchSection({
  onSearch,
  defaultDeparture = "",
  defaultArrival = "",
  favDestinations = DEFAULT_FAV_DESTINATIONS,
}: SuperSearchSectionProps) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const isDriver = appState.userConnected?.role === "driver";

  // Icône du bouton arrivée — priorité : Domicile → premier favori → FaHome par défaut
  const getDefaultFavIcon = (dests: typeof favDestinations) =>
    dests?.find((f) => f.label === "Domicile")?.icon
    ?? dests?.[0]?.icon
    ?? <FaHome className="text-2xl text-[#08216e]" />;
  const [activeFavIcon, setActiveFavIcon] = useState<JSX.Element>(() => getDefaultFavIcon(favDestinations));

  // Resynchronise l'icône quand les vraies données arrivent (après fetch)
  useLayoutEffect(() => {
    setActiveFavIcon(getDefaultFavIcon(favDestinations));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favDestinations]);

  const {
    departureLocation,   
    arrivalLocation, setArrivalLocation,
    departureSuggestions, arrivalSuggestions,
    handleDepartureInputChange, handleArrivalInputChange,
    selectDepartureSuggestion, selectArrivalSuggestion,
    isCurrentLocationLoading, handleGetCurrentLocation,
    departIsNotNow, setDepartIsNotNow,
    isStartPickerOpen, switchToStartPicker, switchToArrivalPicker,
    activeDate, activeTime, dateLabel, today,
    moveNextDay, movePrevDay, handleDateChange,
    moveTimeUp, moveTimeDown, setActiveTime,
    dateInputRef, timeInputRef, departureRef, arrivalRef,
    isFavMenuOpen, setIsFavMenuOpen,
    handleSubmit,
    setArrivalCoords,
    formError,
  } = useSuperSearch(defaultDeparture, defaultArrival, onSearch);

  return (
    <section className="w-110 h-90 py-3 relative">
      <form
        onSubmit={handleSubmit}
        className="inline-flex flex-col px-7 py-5 scale-110 bg-gray-100/60 rounded-lg shadow-md items-center justify-center"
      >
        {/* ─── Inputs de localisation ─────────────────────────────────── */}
        <div className="flex flex-col gap-y-7 w-full relative">

          {/* ─── Input Départ ─────────────────────────────────────────── */}
          <label
            htmlFor="departure"
            className="w-full flex font-semibold justify-between mb-2 border-2 p-2 bg-white border-gray-300 rounded-md relative"
          >
            {/* Icône départ — cercles concentriques (identité visuelle) */}
            <div className="bg-[#08216e] h-6 w-6 rounded-full items-center mt-1">
              <div className="border border-white h-5 w-5 rounded-full mt-0.5 ml-0.5">
                <div className="border border-white h-3 w-3 rounded-full mt-[2.5px] ml-[2.5px]">
                  <div className="bg-white h-1.5 w-1.5 rounded-full mt-[2.5px] ml-[2.5px]" />
                </div>
              </div>
            </div>

            <textarea
              id="departure"
              ref={departureRef}
              value={departureLocation}
              rows={1}
              onChange={(e) => handleDepartureInputChange(e.target.value)}
              onFocus={() => departureRef.current?.select()}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 160) + "px";
              }}
              style={{ height: "40px", minHeight: "40px", maxHeight: "160px", overflowY: "auto" }}
              className="max-w-70 resize-none items-center
                justify-center text-center text-[28px] border-0 text-black font-light
                placeholder-gray-500 active:border-0 focus:border-0
                focus-within:w-fit focus-within:max-w-70 focus-within:transition-all
                focus-within:duration-300 focus-within:text-left"
              placeholder={isFR ? "D'où Partez Vous ?" : "Where Do You Start?"}
            />

            {/* Suggestions départ — portal pour dépasser le stacking context de scale-110 */}
            <SuperSuggestionPortal
              anchorRef={departureRef as unknown as { readonly current: HTMLElement | null }}
              suggestions={departureSuggestions}
              onSelect={selectDepartureSuggestion}
            />

            {/* Bouton géolocalisation */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              aria-label={isFR ? "Ma position actuelle" : "My current location"}
              className="border-2 ml-3 border-gray-400/45 text-center min-w-13 p-1 scale-130
                         items-center shadow-[2px_6px_8px_rgba(0,0,0,0.1)] rounded-md
                         hover:shadow-md hover:scale-135 transition-all duration-300"
            >
              {isCurrentLocationLoading ? (
                <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <FaLocationDot className="text-2xl ml-2 text-[#08216e]" />
              )}
            </button>
          </label>

          {/* Ligne de connexion départ → arrivée */}
          <div className="bg-white w-5 h-15 z-10 left-3 top-10 absolute">
            <div className="bg-[#08216e] w-2.5 h-21 z-10 ml-1.25 -mt-1" />
          </div>

          {/* ─── Input Arrivée ────────────────────────────────────────── */}
          <label
            htmlFor="arrival"
            className="w-full flex justify-between font-semibold mb-2 border-2 p-2 bg-white border-gray-300 rounded-md relative"
          >
            <FaLocationDot className="text-[1.75rem] -ml-0.5 mt-2 text-[#08216e]" />

            <textarea
              id="arrival"
              ref={arrivalRef}
              value={arrivalLocation}
              rows={1}
              onChange={(e) => handleArrivalInputChange(e.target.value)}
              onFocus={() => arrivalRef.current?.select()}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 160) + "px";
              }}
              style={{ height: "40px", minHeight: "40px", maxHeight: "160px", overflowY: "auto" }}
              className="max-w-70 resize-none items-center
                justify-center text-center text-[28px] border-0 text-black font-light
                placeholder-gray-500 active:border-0 focus:border-0
                focus-within:w-fit focus-within:max-w-70 focus-within:transition-all
                focus-within:duration-300 focus-within:text-left"
              placeholder={isFR ? "Où Allez Vous ?" : "Where Are You Going?"}
            />

            {/* Suggestions arrivée — portal pour dépasser le stacking context de scale-110 */}
            <SuperSuggestionPortal
              anchorRef={arrivalRef as unknown as { readonly current: HTMLElement | null }}
              suggestions={arrivalSuggestions}
              onSelect={selectArrivalSuggestion}
            />

            {/* Bouton domicile + menu déroulant favoris */}
            <button
              type="button"
              className="border-2 ml-3 border-gray-400/45 scale-130 flex items-center p-1
                         shadow-[2px_6px_8px_rgba(0,0,0,0.1)] rounded-md
                         hover:shadow-md hover:scale-135 transition-all duration-300"
            >
              <span
                className="text-2xl text-[#08216e]"
                onClick={() => {
                  // Priorité : Domicile → premier favori disponible (ex: Campus La Cité)
                  const target = favDestinations?.find((f) => f.label === "Domicile")
                    ?? favDestinations?.[0];
                  if (target) {
                    setArrivalLocation(target.value);
                    if (target.coordonnees) setArrivalCoords([target.coordonnees.lng, target.coordonnees.lat]);
                    setActiveFavIcon(target.icon ?? <FaHome className="text-2xl text-[#08216e]" />);
                  }
                }}
              >
                {activeFavIcon}
              </span>
              <FaChevronDown
                className="ml-1 text-2xs text-[#08216e]"
                onClick={() => setIsFavMenuOpen(true)}
                onMouseEnter={() => setIsFavMenuOpen(true)}
                onMouseLeave={() => setIsFavMenuOpen(false)}
              />
            </button>

            {/* Dropdown des favoris rapides */}
            <div
              className={`absolute top-full z-50 -mt-5 right-0 bg-white border-2 border-gray-300
                          rounded-md shadow-md w-40 p-2 transition-all duration-300
                          ${isFavMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
              onMouseLeave={() => setIsFavMenuOpen(false)}
              onMouseEnter={() => setIsFavMenuOpen(true)}
            >
              <p className="text-gray-500 text-sm text-center mb-2">
                {isFR ? "Favoris" : "Favorites"}
              </p>
              <ul className="flex flex-col gap-y-2 text-left">
                {favDestinations?.map((fav, i) => (
                  <li
                    key={i}
                    className="text-gray-700 flex justify-between hover:bg-gray-100 rounded-md p-1 cursor-pointer transition-colors"
                    onClick={() => {
                      setArrivalLocation(fav.value);
                      if (fav.coordonnees) setArrivalCoords([fav.coordonnees.lng, fav.coordonnees.lat]);
                      setActiveFavIcon(fav.icon);
                      setIsFavMenuOpen(false);
                    }}
                  >
                    {fav.label}
                    <span className="ml-2 text-xl text-[#08216e]">{fav.icon}</span>
                  </li>
                ))}
              </ul>
            </div>
          </label>
        </div>

        {/* ─── Sélecteur Date / Heure — masqué pour le conducteur ─── */}
        {!isDriver && (
          <DateTimePicker
            departIsNotNow={departIsNotNow}
            setDepartIsNotNow={setDepartIsNotNow}
            isStartPickerOpen={isStartPickerOpen}
            switchToStartPicker={switchToStartPicker}
            switchToArrivalPicker={switchToArrivalPicker}
            activeDate={activeDate}
            activeTime={activeTime}
            dateLabel={dateLabel}
            today={today}
            moveNextDay={moveNextDay}
            movePrevDay={movePrevDay}
            handleDateChange={handleDateChange}
            moveTimeUp={moveTimeUp}
            moveTimeDown={moveTimeDown}
            setActiveTime={setActiveTime}
            dateInputRef={dateInputRef}
            timeInputRef={timeInputRef}
            isFR={isFR}
          />
        )}

        {/* ─── Erreur de validation inline ─────────────────────────────── */}
        {formError && (
          <p className="w-full mt-2 text-sm text-red-600 text-center font-medium">
            {formError}
          </p>
        )}

        {/* ─── Bouton de soumission ────────────────────────────────────── */}
        <button
          type="submit"
          className="w-full mt-4 px-4 py-2 text-3xl flex items-center justify-center
                     bg-[#08216e] text-white rounded-md hover:bg-blue-600
                     transition-colors duration-300"
        >
          {isDriver ? (
            <>
              <FaPlus className="mr-3 self-center" />
              {isFR ? "Planifier" : "Plan"}
            </>
          ) : (
            <>
              <FaMagnifyingGlass className="mr-2" />
              {isFR ? "Rechercher" : "Search"}
            </>
          )}
        </button>
      </form>
    </section>
  );
}
