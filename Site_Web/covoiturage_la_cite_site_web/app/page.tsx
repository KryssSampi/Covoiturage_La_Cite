/*
  * Page D'accueil (Home Page)
  * Ce composant sert de page d'accueil principale pour l'application.
  * Il inclut l'en-tête, la section héro, diverses sections d'information et le pied de page.
  * La page est conçue pour être réactive et visuellement attrayante, utilisant Tailwind CSS pour le style.
  * Le contenu est dynamique en fonction de la langue sélectionnée (français ou anglais).
*/

'use client';

import Image from "next/image";
import {WhyUsSection, Header , HowItWorkSection , StatsSection , Hero }  from "@/features/homepage"
import { Footer } from "@/shared/components/footer";
import { WarmSentence } from "@/shared/ui/warm-sentence";
import { Language, useAppState } from "@/core/state/app_state";
import { useLoader } from "@/core/context/loader.context";
import { HOME_TRANSLATIONS, t } from "@/core/i18n/public-pages.translations";
import Link from "next/link";
import { useIsMobileOrTablet } from "@/shared/hooks/useismobileortable";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const isBellowlg = useIsMobileOrTablet();
  const { setActiveLoader } = useLoader();
  const appState = useAppState();
  const router = useRouter();

  // Redirection vers le tableau de bord si l'utilisateur est déjà connecté
  useEffect(() => {
    if (appState.userConnected) {
      const userRole = appState.userConnected.role.toString().toLowerCase();
      const userId   = appState.userConnected.id;
      setActiveLoader(true);
      router.replace(`/${userRole}/${userId}`);
    }
  }, [appState.userConnected, router, setActiveLoader]);

  // Ne pas afficher la page d'accueil pendant la redirection
  if (appState.userConnected) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="grow">
        <Hero />
        <div className={`${isBellowlg ? "mt-10" : ""}`}>  
        {WarmSentence()}
        </div>
        <WhyUsSection />

        <HowItWorkSection />

        <StatsSection />
        <div className="relative flex-col text-center w-full overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image src="/img/Rectangle.png" alt="Carpooling Illustration" className="object-cover" fill/>    
          </div>
          <div className="w-full lg:h-50 h-30 z-20 flex flex-col items-center justify-center bg-[#08316E] relative py-20" style={{borderRadius : '0 0 100% 100% '}}>
            <h2 className="lg:text-6xl text-2xl font-bold text-white mb-4">
              {t(HOME_TRANSLATIONS.ctaTitleFr, HOME_TRANSLATIONS.ctaTitleEn, appState.lang)}
            </h2>
            <p className="text-2xs lg:text-2xl text-white mb-8 px-4">
              {t(HOME_TRANSLATIONS.ctaSubtitleFr, HOME_TRANSLATIONS.ctaSubtitleEn, appState.lang)}
            </p>
          </div>
          <div className="w-full h-50 z-20 flex flex-col items-center justify-center relative py-20">
            <Link className="bg-white/60 text-[#08316E] lg:w-fit w-80 px-8 py-3 rounded-full text-[20px] lg:mb-2 lg:text-2xl font-semibold hover:bg-white inline-block transition-all duration-300 hover:scale-105 active:scale-95" href="/login">
              {t(HOME_TRANSLATIONS.ctaButtonFr, HOME_TRANSLATIONS.ctaButtonEn, appState.lang)}
            </Link>
            {isBellowlg ? (
              <p className="text-xl text-white mb-8 px-4">
                {t(HOME_TRANSLATIONS.ctaFooterTextFr, HOME_TRANSLATIONS.ctaFooterTextEn, appState.lang)}
              </p>
            ) : WarmSentence('white')}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}