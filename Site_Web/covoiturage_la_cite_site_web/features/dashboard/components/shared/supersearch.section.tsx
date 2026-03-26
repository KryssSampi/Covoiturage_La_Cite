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
import { format } from "date-fns";
import { FaLocationDot, FaMagnifyingGlass, FaX } from "react-icons/fa6";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaPlus,
  FaChevronUp,
} from "react-icons/fa";

import { Language, useAppState } from "@/core/state/app_state";
import { FIXTURE_LIEUX_FAVORIS } from "@/shared/fixtures/favoris.fixtures";
import { getLieuFavoriIcon } from "@/shared/utils/lieu-favori-icon";

import { useSuperSearch } from "../../hooks";
import { LocationSuggestion, SuperSearchSectionProps } from "../../types/search.types";

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

  // Icône du bouton arrivée — domicile par défaut, mise à jour au choix d'un favori
  const domicileIcon = favDestinations?.find((f) => f.label === "Domicile")?.icon
    ?? <FaHome className="text-2xl text-[#08216e]" />;
  const [activeFavIcon, setActiveFavIcon] = useState<JSX.Element>(domicileIcon);

  // Resynchronise l'icône domicile quand les vraies données arrivent (après fetch)
  useLayoutEffect(() => {
    setActiveFavIcon(
      favDestinations?.find((f) => f.label === "Domicile")?.icon
        ?? <FaHome className="text-2xl text-[#08216e]" />
    );
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
                  const home = favDestinations?.find((f) => f.label === "Domicile");
                  if (home) {
                    setArrivalLocation(home.value);
                    if (home.coordonnees) setArrivalCoords([home.coordonnees.lng, home.coordonnees.lat]);
                    setActiveFavIcon(home.icon ?? <FaHome className="text-2xl text-[#08216e]" />);
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

        {/* ─── Sélecteur Date / Heure — masqué pour le conducteur (sa recherche de circuits n'utilise pas les heures) */}
        {!isDriver && <label
          htmlFor="options"
          className="text-2xl font-semibold mt-8 bg-white p-2 rounded-md border-2
                     border-gray-300 w-full text-center text-gray-500 transition-all duration-300"
        >
          {departIsNotNow ? (
            <div className="flex flex-col items-center gap-y-1 relative">

              {/* Toggle Départ ↔ Arrivée */}
              <label className="text-left flex w-full ml-10 scale-110 items-center justify-center">
                <FaChevronLeft
                  className={`text-lg text-black cursor-pointer hover:text-blue-600 transition-colors
                    ${!isStartPickerOpen ? "opacity-100" : "opacity-30"}`}
                  onClick={switchToStartPicker}
                />
                <span className="text-left mx-2 scale-110">
                  {isStartPickerOpen
                    ? isFR ? "Départ : " : "Departure : "
                    : isFR ? "Arrivée : " : "Arrival : "}
                </span>
                <FaChevronRight
                  className={`text-lg text-black cursor-pointer hover:text-blue-600 transition-colors
                    ${isStartPickerOpen ? "opacity-100" : "opacity-30"}`}
                  onClick={switchToArrivalPicker}
                />
              </label>

              {/* Date Picker + Time Picker */}
              <div className="flex items-center gap-1">

                {/* Date Picker avec chevrons gauche/droite */}
                <div className="relative flex items-center justify-between bg-white px-3 py-2
                                rounded-lg shadow-sm border w-fit min-w-50 transition-all duration-300">
                  <button
                    type="button"
                    onClick={movePrevDay}
                    disabled={activeDate ? activeDate.toDateString() === today.toDateString() : false}
                    className="absolute z-20 p-1 mr-4 -ml-3 disabled:opacity-30 disabled:cursor-not-allowed
                               hover:bg-gray-100 rounded transition-all duration-200 active:scale-90 shrink-0"
                  >
                    &lt;
                  </button>

                  {/* Label cliquable qui ouvre le date picker natif invisible */}
                  <div className="relative flex-1 scale-155 items-center justify-center text-center
                                  cursor-pointer py-3 px-10 font-medium text-blue-700
                                  hover:text-blue-900 transition-colors whitespace-nowrap">
                    <span className="text-sm text-center justify-center items-center flex">
                      {dateLabel}
                    </span>
                    {/* Input date natif invisible — ouvert via ref.showPicker() */}
                    <input
                      ref={dateInputRef}
                      type="date"
                      className="absolute inset-0 opacity-0 pointer-events-none"
                      min={format(today, "yyyy-MM-dd")}
                      value={activeDate ? format(activeDate, "yyyy-MM-dd") : format(today, "yyyy-MM-dd")}
                      onChange={handleDateChange}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={moveNextDay}
                    className="absolute right-2 z-20 p-1 ml-4 -mr-3 hover:bg-gray-100
                               rounded transition-all duration-200 active:scale-90 shrink-0"
                  >
                    &gt;
                  </button>
                </div>

                {/* Icône calendrier — ouvre le date picker natif */}
                <FaCalendarAlt
                  className="text-5xl p-1 mt-1 mx-5 text-[#08216e] cursor-pointer
                             hover:text-blue-700 hover:scale-110 transition-all duration-300 active:scale-95"
                  onClick={() => dateInputRef.current?.showPicker()}
                />

                {/* Time Picker avec chevrons haut/bas */}
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => timeInputRef.current?.showPicker()}
                    className="flex items-center text-center gap-4 bg-white p-2 rounded-lg shadow-sm
                               border w-fit cursor-pointer hover:border-blue-400 transition-all
                               duration-300 outline-none text-xl font-medium text-blue-700"
                  >
                    {activeTime}
                    {/* Input time natif invisible — ouvert via ref.showPicker() */}
                    <input
                      type="time"
                      ref={timeInputRef}
                      className="absolute opacity-0 pointer-events-none"
                      value={activeTime || ""}
                      onChange={(e) => setActiveTime(e.target.value)}
                    />
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={moveTimeUp}
                        className="p-1 hover:bg-gray-100 rounded transition-all duration-200 active:scale-90"
                      >
                        <FaChevronUp className="text-sm text-[#08216e]" />
                      </button>
                      <button
                        type="button"
                        onClick={moveTimeDown}
                        className="p-1 hover:bg-gray-100 rounded transition-all duration-200 active:scale-90"
                      >
                        <FaChevronDown className="text-sm text-[#08216e]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton fermer le planificateur → retour au mode "Maintenant" */}
              <FaX
                className="text-lg mt-3 text-gray-500 absolute bottom-20 right-0
                           cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => setDepartIsNotNow(false)}
              />
            </div>
          ) : (
            /* Mode "Maintenant" — bouton simple pour passer en mode planifié */
            <>
              {isFR ? "Départ : " : "Start : "}
              <button
                type="button"
                onClick={() => setDepartIsNotNow(true)}
                className="border-2 border-gray-400/45 bg-linear-to-t from-gray-400/30 px-7
                           to-gray-50/45 text-center min-w-13 p-1 items-center
                           shadow-[2px_6px_8px_rgba(0,0,0,0.1)] rounded-md
                           hover:shadow-md hover:scale-110 transition-all duration-300 active:scale-95"
              >
                {isFR ? "Maintenant" : "Now"}
              </button>
            </>
          )}
        </label>}

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
