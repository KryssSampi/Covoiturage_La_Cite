/*
  * Page D'accueil (Home Page)
  * Ce composant sert de page d'accueil principale pour l'application.
  * Il inclut l'en-tête, la section héro, diverses sections d'information et le pied de page.
  * La page est conçue pour être réactive et visuellement attrayante, utilisant Tailwind CSS pour le style.
  * Le contenu est dynamique en fonction de la langue sélectionnée (français ou anglais).
*/

'use client';

import Image from "next/image";                                                   //Liens des images utilisées dans la page d'accueil
import { Header } from "@/composant/homepage/header";                             // Composant de l'en-tête de la page d'accueil, qui inclut la navigation et le logo
import { WhyUsSection } from "@/composant/homepage/whyus_section"                 // Composant de la section "Pourquoi Nous Choisir", qui présente les avantages de notre service de covoiturage pour les étudiants.
import { HowItWorkSection } from "@/composant/homepage/howitwork_section"         // Composant de la section "Comment ça marche", qui explique le processus de réservation et d'utilisation de notre plateforme de covoiturage pour les étudiants.
import { Footer } from "@/composant/footer"                                       // Composant du pied de page, qui contient des liens vers les pages de politique de confidentialité, les conditions d'utilisation et les réseaux sociaux, ainsi que des informations de contact.
import { Language, useAppState } from "./app_state";                              // Importation du contexte de l'application pour gérer l'état global, notamment la langue sélectionnée par l'utilisateur (français ou anglais).
import { StatsSection } from "@/composant/homepage/stats_section"                 // Composant de la section "Statistiques", qui présente des données et des chiffres clés sur l'utilisation de notre plateforme de covoiturage pour les étudiants, tels que le nombre de trajets réservés, les économies réalisées et les avis des utilisateurs.
import { WarmSentence } from "@/ui/warm_sentence"                                 // Composant de la section "Phrase d'Accroche", qui affiche une phrase motivante ou un slogan pour encourager les visiteurs à s'inscrire et à utiliser notre service de covoiturage pour les étudiants.
import { Hero } from "@/composant/homepage/hero";                                  // Composant de la section "Héro", qui est la première section visible sur la page d'accueil, présentant une image accrocheuse et un message de bienvenue pour attirer l'attention des visiteurs et les inciter à explorer notre plateforme de covoiturage pour les étudiants.
import Link from "next/link";

export default function Home() {

  // Récupération de l'état global de l'application, notamment la langue sélectionnée par l'utilisateur, pour afficher le contenu de manière dynamique en fonction de la langue choisie (français ou anglais).
  const appState =  useAppState();
  return (
    /* Nettoyage du Header et du Layout */
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Un seul header suffit, le composant Header contient déjà la logique sticky */}
      <Header />

      <main className="flex-grow">
        {/* Hero Section : Utilise des classes Tailwind plutôt que des attributs HTML anciens */}
        <Hero />

        {WarmSentence()}
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
            <div className="w-full h-50 z-20 flex flex-col items-center justify-center bg-[#08316E] relative py-20" style={{borderRadius : '0  0 100% 100% '}}>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
      {appState.lang===Language.FR ?" Prêt à Commencer Votre Voyage ?": "Ready To Start Your Trip ?"}
              </h2>
              <p className="text-xl md:text-2xl text-white mb-8 px-4">{appState.lang === Language.FR ? " Rejoignez des centaines d’étudiants qui voyagent déjà intelligemment avec Nous" :
                "Join a hundreds of Students Who Already Start to Travel Wisely"}</p></div>
              <div className="w-full h-50 z-20 flex flex-col items-center justify-center relative py-20 ">
                <Link className="bg-white/60 text-[#08316E] px-8 py-3 rounded-full text-2xl font-semibold hover:bg-white inline-block transition-all duration-300 hover:scale-105 active:scale-95" href="/signup">
                {appState.lang === Language.FR ? "Créer Mon Compte Gratuitement" : "Create My Free Account"}</Link>
                {WarmSentence('white')}
              </div>
              </div>
      </main>
 { /* Le Footer est placé en dehors du main pour s'assurer qu'il reste en bas de la page, même si le contenu principal est court. */}
      <Footer />
    </div>
  );
}
