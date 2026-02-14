'use client';

import Image from "next/image";
import { Header } from "@/composant/homepage/header";
import { WhyUsSection } from "@/composant/homepage/whyus_section"
import { HowItWorkSection } from "@/composant/homepage/howitwork_section"
import { Footer } from "@/composant/footer"
import { StatsSection } from "@/composant/homepage/stats_section"
import { WarmSentence } from "@/ui/warm_sentence"
import { Hero } from "@/composant/homepage/hero";

export default function Home() {
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
        {/* La section CTA avec la courbe que nous avons corrigée ensemble */}
        <div className="relative flex-col text-center w-full overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image src="/img/Rectangle.png" alt="Carpooling Illustration"  className="object-cover " fill/>    
                    </div>
            <div className="w-full h-50 z-20 flex flex-col items-center justify-center bg-[#08316E] relative py-20" style={{borderRadius : '0  0 100% 100% '}}>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Prêt à Commencer Votre Voyage ?</h2>
              <p className="text-xl md:text-2xl text-white mb-8 px-4">Rejoignez des centaines d’étudiants qui voyagent déjà intelligemment avec Nous</p></div>
              <div className="w-full h-50 z-20 flex flex-col items-center justify-center relative py-20 ">
                <a className="bg-white/60 text-[#08316E] px-8 py-3 rounded-full text-2xl font-semibold hover:bg-white inline-block transition-all duration-300 hover:scale-105 active:scale-95" href="/signup">Créer Mon Compte Gratuitement</a>
                <div className="mt-8"><div className="w-full h-20 flex items-center justify-center bg-transparent text-[#ffffff] text-2xl font-semibold">Ce Site Web est réservé exclusivement aux Membres du Personnel , Enseignants et Étudiants du Collège la Cité</div>
                </div>
              </div>
              </div>
      </main>

      <Footer />
    </div>
  );
}
