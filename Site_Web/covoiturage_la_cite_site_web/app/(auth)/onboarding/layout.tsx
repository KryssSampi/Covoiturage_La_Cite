
import ImageCollage from "@/features/auth/components/ImageCollagae";
import type { Metadata } from "next";
import Image from "next/image";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Covoiturage La Cité - Page d'Onboarding",
  description:
    "Covoiturage La Cité - Connectez-vous à votre compte pour accéder à notre plateforme de covoiturage dédiée à la communauté de La Cité. Trouvez facilement des trajets partagés, réduisez votre empreinte carbone et connectez-vous avec d'autres membres pour des voyages plus économiques et conviviaux.",
};

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    return (
        <>
{/* ── Layout spécifique à l'onboarding — simple wrapper avec un titre de page ── */}
<div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
 <div className="w-full h-full absolute inset-0" >
    <ImageCollage />
    </div>
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            <div className="flex flex-0 flex-col items-center gap-4 md:flex-row md:gap-8">
                    <div className="flex h-28 w-28 md:h-30 md:w-30 items-center justify-center rounded-full bg-[#08316e] shadow-lg">
                      <Image
                        src="/img/school-carpoling-black-logoavif.png"
                        alt="Logo Covoiturage La Cité"
                        width={130}
                        height={130}
                        className="object-contain"
                      />
                    </div>
                    <h1 className="text-6xl md:text-6xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                      Covoiturage <span className="text-blue-500">La Cité</span>
                    </h1>
                  </div>
                  <main className="flex-1 w-full h-full flex items-start justify-center px-4 pt-8">
{children}
</main>
<footer className="mt-4 text-center text-xl text-gray-400">
         &copy; {new Date().getFullYear()} Collège La Cité — Covoiturage
        </footer>
</div>
</div>
 
</> )
}
