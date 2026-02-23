import { Language } from "@/core/state/app_state";
import { useAppState } from "@/core/state/app_state";
import { useIsMobileOrTablet } from "@/shared/hooks/useismobileortable";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  const appState = useAppState();
  const isbellowlg = useIsMobileOrTablet();
  return (
    <div className="relative w-full h-150 flex  m-0 p-0 text-white text-center justify-center items-center overflow-hidden">
      <Image
        src="/img/acceuil-hero-img.png"
        alt="Covoiturage"
        width={600}
        height={400}
        className="absolute top-0 left-0 h-full lg:w-full lg:h-full py-0 object-cover"
      />
      <div className="absolute bottom-0 left-0 w-full h-90 bg-linear-to-t from-[#0000009a] to-transparent" />

      <div
        className="relative z-10 bottom-0 flex-col left-5 w-full py-0 flex mt-100 mb-30 text-color-white"
      >
        <div>
        <h1 className="lg:text-7xl text-[30px] font-bold mb-4 text-left">
          {appState.lang === Language.FR
            ? "Le Covoiturage Étudiant"
            : "Carpooling for Students"}
          <br /> {appState.lang === Language.FR ? "de votre " : "of your "}
          <span className="text-blue-300">
            {appState.lang === Language.FR ? "Collège" : "College"}
          </span>
        </h1>
        <p className="lg:text-5xl text-[18px] font-bold text-left">
          {appState.lang === Language.FR
            ? "Voyageons ensemble, économions tous sainement !"
            : "Let's travel together and save by an healthy way !"}
        </p>
        <div className="flex mb-8 gap-6">
          <Link
            href="/login"
            className={`mt-8 ${isbellowlg ? 'w-full' : 'lg:w-100'} inline-block  bg-[#08316E] text-white   px-6 py-3 rounded-lg text-3xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-300 active:scale-95 text-center`}
          >
            {appState.lang === Language.FR
              ? "Trouver un trajet"
              : "Find a ride"}
          </Link>
          <Link
            href="/login"
            className={`mt-8 ${isbellowlg ? 'w-full mr-10' : 'lg:w-100'} inline-block bg-white  text-[#08316E] px-6 py-3 rounded-lg text-3xl font-semibold hover:bg-[#e2e2e2] hover:opacity-90 hover:scale-105 transition-all duration-300 active:scale-95 text-center`}
          >
            {appState.lang === Language.FR
              ? "Proposer un trajet"
              : "Offer a ride"}
          </Link>
        </div>
      </div>
      <Link  className={`absolute ${isbellowlg ? '-top-20 right-35' : 'lg:top-10 lg:right-30'} lg:border-4  border px-3 py-3 text-[22px] rounded-full lg:py-6 lg:px-6 bg-[#08316ee1] text-white lg:text-4xl lg:font-bold lg:hover:underline lg:hover:scale-105 transition-transform duration-300 active:scale-95`} href={isbellowlg ? '#comment-ca-marche' : '/about'}>
        {appState.lang === Language.FR ? "En savoir plus" : "Learn more"}
      </Link>
    </div>
    </div>
  );
}
