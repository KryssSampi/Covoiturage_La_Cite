import { useAppState } from '../app/app_state';
import { Language } from '../app/app_state';

export function WarmSentence(textColor = "[#08316E]") {
  const appState = useAppState();
  return (
    <div className={`w-full h-20 flex items-center justify-center bg-transparent text-${textColor} text-2xl font-semibold`}>
      {appState.lang === Language.FR
        ? "Ce Site Web est réservé exclusivement aux Membres du Personnel , Enseignants et Étudiants du Collège la Cité"
        : "This Website is exclusively reserved for the Staff, Teachers and Students of La Cité College"}
    </div>
  );
}