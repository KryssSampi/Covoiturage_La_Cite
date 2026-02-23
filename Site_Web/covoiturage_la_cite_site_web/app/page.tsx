/*
  * Page D'accueil (Home Page)
  * Ce composant sert de page d'accueil principale pour l'application.
  * Il inclut l'en-tête, la section héro, diverses sections d'information et le pied de page.
  * La page est conçue pour être réactive et visuellement attrayante, utilisant Tailwind CSS pour le style.
  * Le contenu est dynamique en fonction de la langue sélectionnée (français ou anglais).
*/

'use client';

import Image from "next/image";                                                                      //Liens des images utilisées dans la page d'accueil
import {WhyUsSection, Header , HowItWorkSection , StatsSection , Hero }  from "@/features/homepage"    //Importation des composants de la page d'accueil
import { Footer } from "@/shared/components/footer";                                                          //Importation du composant Footer
import { WarmSentence } from "@/shared/ui/warm-sentence";                                                     //Importation du composant WarmSentence        
import { Language, useAppState } from "@/core/state/app_state";                                           //Importation du contexte global de l'application pour gérer la langue sélectionnée par l'utilisateur et d'autres états globaux de l'application.                        
import { useLoader } from "@/core/context/loader.context";                                                          //Importation du contexte de gestion du loader pour afficher un indicateur de chargement lors de la redirection ou du chargement de données.
import Link from "next/link";
import { useIsMobileOrTablet } from "@/shared/hooks/useismobileortable";

export default function Home() {
  const isBellowlg = useIsMobileOrTablet();
const { setActiveLoader } = useLoader();
  // Récupération de l'état global de l'application, notamment la langue sélectionnée par l'utilisateur, pour afficher le contenu de manière dynamique en fonction de la langue choisie (français ou anglais).
  const appState =  useAppState();

  if(appState.userConnected) {
    // Si l'utilisateur est connecté, redirigez-le vers son tableau de bord en fonction de son rôle (passager ou conducteur).`
    
    const userRole = appState.userConnected.role.toString().toLowerCase();
    const userId = appState.userConnected.id;
    setActiveLoader(true);
    window.location.href = `/${userRole}/${userId}`;
  }
  return (
    /* Nettoyage du Header et du Layout */
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Un seul header suffit, le composant Header contient déjà la logique sticky */}
      <Header />

      <main className="grow">
        {/* Hero Section : Utilise des classes Tailwind plutôt que des attributs HTML anciens */}
        <Hero />
        <div className={`${isBellowlg ? "mt-10" : ""}`}>  
        {WarmSentence()}
        </div>
        {/* Section Pourquoi Nous Choisir */}
        <WhyUsSection />

        {/* Section Comment ça marche */}
        <HowItWorkSection />

        <StatsSection />
        {/* La section CTA avec la courbe que nous avons corrigée ensemble
         * Nous avons utilisé une div avec une image de fond pour créer la courbe, 
         * et nous avons placé le contenu par-dessus en utilisant des classes Tailwind pour le positionnement et le style.
        */}
        <div className="relative flex-col text-center w-full overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image src="/img/Rectangle.png" alt="Carpooling Illustration"  className="object-cover " fill/>    
                    </div>
            <div className="w-full lg:h-50 h-30 z-20 flex flex-col items-center justify-center bg-[#08316E] relative py-20" style={{borderRadius : '0  0 100% 100% '}}>
              <h2 className="lg:text-6xl text-2xl  font-bold text-white mb-4">
      {appState.lang===Language.FR ?" Prêt à Commencer Votre Voyage ?": "Ready To Start Your Trip ?"}
              </h2>
              <p className="text-2xs lg:text-2xl text-white mb-8 px-4">{appState.lang === Language.FR ? " Rejoignez des centaines d’étudiants qui voyagent déjà intelligemment avec Nous" :
                "Join a hundreds of Students Who Already Start to Travel Wisely"}</p></div>
              <div className="w-full h-50 z-20 flex flex-col items-center justify-center relative py-20 ">
                <Link className="bg-white/60 text-[#08316E] lg:w-fit w-80   px-8 py-3 rounded-full text-[20px] lg:mb-2  lg:text-2xl font-semibold hover:bg-white inline-block transition-all duration-300 hover:scale-105 active:scale-95" href="/login">
                {appState.lang === Language.FR ? "Créer Mon Compte Gratuitement" : "Create My Free Account"}</Link>
                {isBellowlg ? ( <p className="text-xl text-white mb-8 px-4">{appState.lang === Language.FR ? "Ce site est Réservé aux Membres du Collège de La Cité" :
                "This site is reserved for members of the College of La Cité"}</p>) :
                WarmSentence('white') }
              </div>
              </div>
      </main>
 { /* Le Footer est placé en dehors du main pour s'assurer qu'il reste en bas de la page, même si le contenu principal est court. */}
      <Footer />
    </div>
  );
}
