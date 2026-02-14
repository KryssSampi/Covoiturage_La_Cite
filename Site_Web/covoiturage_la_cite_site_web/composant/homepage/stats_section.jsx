import { useAppState } from "@/app/app_state";
import { Language } from "@/app/app_state";

export function StatsSection() {
    const appState = useAppState();
  return (
    <div className="w-full h-75 flex  gap-x-30 items-center justify-center bg-[#ffffff]">
     <div className="flex flex-col items-center justify-center">
        <h3 className="text-7xl font-bold text-[#08316E]">
            {appState.lang === Language.FR ? "500+" : "500+"}
        </h3>
        <p className="text-3xl font-semibold text-[#08316E]">
            {appState.lang === Language.FR ? "Utilisateurs Inscrits" : "Registered Users"}  
        </p>
     </div>
     <div className="flex flex-col items-center justify-center">
        <h3 className="text-7xl font-bold text-[#08316E]">
            {appState.lang === Language.FR ? "1200+" : "1200+"}
        </h3>
        <p className="text-3xl font-semibold text-[#08316E]">
            {appState.lang === Language.FR ? "Trajets Partagés" : "Rides Shared"}
        </p>
     </div>
     <div className="flex flex-col items-center justify-center">
        <h3 className="text-7xl font-bold text-[#08316E]">
            {appState.lang === Language.FR ? "50%" : "50%"}
        </h3>
        <p className="text-3xl font-semibold text-[#08316E]">
            {appState.lang === Language.FR ? "Économies moyenne" : "Average Savings"}
        </p>
     </div>
     <div className="flex flex-col items-center justify-center">
        <h3 className="text-7xl font-bold text-[#08316E]">
            {appState.lang === Language.FR ? "2.5T" : "2.5T"}
        </h3>
        <p className="text-3xl  font-semibold text-[#08316E]">
            {appState.lang === Language.FR ? "CO\u2082 Évité" : "CO\u2082 Avoided"}
        </p>
     </div>
    </div>
  );
}