"use client";

import {  useAppState } from "@/core/state/app_state";
import { Language } from "@/core/state/app_state";

export function ToggleLangButton() {
const AppState = useAppState();
  return (
    <button 
      className="bg-transparent text-white px-2 md:px-4 py-2 rounded-lg text-sm lg:text-lg font-semibold hover:bg-white/10 w-full"
      onClick={() => AppState.toggleLanguage()}
    >
      { AppState.lang === Language.FR ? 'EN' : 'FR' }
    </button>
  );
}