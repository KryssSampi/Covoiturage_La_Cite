"use client";
// Sélecteur date/heure — toggle Départ ↔ Arrivée + navigation jour/heure
import { format } from "date-fns";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
} from "react-icons/fa";
import { FaX } from "react-icons/fa6";

interface DateTimePickerProps {
  departIsNotNow: boolean;
  setDepartIsNotNow: (v: boolean) => void;
  isStartPickerOpen: boolean;
  switchToStartPicker: () => void;
  switchToArrivalPicker: () => void;
  activeDate: Date;
  activeTime: string;
  dateLabel: string;
  today: Date;
  moveNextDay: () => void;
  movePrevDay: () => void;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  moveTimeUp: () => void;
  moveTimeDown: () => void;
  setActiveTime: (time: string) => void;
  dateInputRef: React.RefObject<HTMLInputElement | null>;
  timeInputRef: React.RefObject<HTMLInputElement | null>;
  isFR: boolean;
}

// Sélecteur complet : mode "Maintenant" vs "Planifié" avec navigation date+heure
export function DateTimePicker({
  departIsNotNow, setDepartIsNotNow,
  isStartPickerOpen, switchToStartPicker, switchToArrivalPicker,
  activeDate, activeTime, dateLabel, today,
  moveNextDay, movePrevDay, handleDateChange,
  moveTimeUp, moveTimeDown, setActiveTime,
  dateInputRef, timeInputRef,
  isFR,
}: DateTimePickerProps) {
  return (
    <label
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
    </label>
  );
}
