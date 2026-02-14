

import {  useAppState } from "@/app/app_state";
import { Language } from "@/app/app_state";

export function ToggleLangButton() {
const AppState = useAppState();
  return (
<button 
  className="bg-transparent text-white px-4 py-2 rounded-lg text-lg font-semibold 
             hover:bg-white/10" 
  onClick={() => AppState.toggleLanguage()}
>
  { AppState.lang === Language.FR ? 'EN' : 'FR' }
</button>
  );
}