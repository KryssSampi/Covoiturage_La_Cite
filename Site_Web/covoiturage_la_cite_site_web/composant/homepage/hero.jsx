import { Language } from "@/app/app_state";
import { useAppState } from "@/app/app_state";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  const appState = useAppState();
  return (
    <div className="relative w-full h-150 flex  m-0 p-0  text-center justify-center items-center overflow-hidden">
      <Image
        src="/img/acceuil-hero-img.png"
        alt="Covoiturage"
        width={600}
        height={400}
        className="absolute top-0 left-0 w-full h-full py-0 object-cover"
      />
      <div className="absolute bottom-0 left-0 w-full h-90 bg-linear-to-t from-[#0000009a] to-transparent" />

      <div
        className="relative z-10 bottom-0 flex-col left-5 w-full py-0 flex mt-100 mb-30 text-color-white"
        align="bottom"
      >
        <div>
        <h1 className="text-7xl font-bold mb-4 " align="left">
          {" "}
          {appState.lang === Language.FR
            ? "Le Covoiturage Étudiant"
            : "Carpooling for Students"}
          <br /> {appState.lang === Language.FR ? "de votre " : "of your "}
          <span className="text-blue-300">
            {appState.lang === Language.FR ? "Collège" : "College"}
          </span>
        </h1>
        <p className="text-5xl font-bold" align="left">
          {appState.lang === Language.FR
            ? "Voyageons ensemble, économions tous sainement !"
            : "Let's travel together and save by an healthy way !"}
        </p>
        <div className="flex mb-8 gap-6" align="left">
          <Link
            href="/inscription"
            className="mt-8 w-100 inline-block  bg-[#08316E] text-white   px-6 py-3 rounded-lg text-3xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-300 active:scale-95 "
            align="center"
          >
            {appState.lang === Language.FR
              ? "Trouver un trajet"
              : "Find a ride"}
          </Link>
          <Link
            href="/inscription"
            className="mt-8 w-100 inline-block bg-white  text-[#08316E] px-6 py-3 rounded-lg text-3xl font-semibold hover:bg-[#e2e2e2] hover:opacity-90 hover:scale-105 transition-all duration-300 active:scale-95 "
            align="center"
          >
            {appState.lang === Language.FR
              ? "Proposer un trajet"
              : "Offer a ride"}
          </Link>
        </div>
      </div>
      <Link className="absolute top-10 right-30 border-4 rounded-full py-6 px-6 bg-[#08316ee1] text-white text-4xl font-bold hover:underline hover:scale-105 transition-transform duration-300 active:scale-95" href="/about">
        {appState.lang === Language.FR ? "En savoir plus" : "Learn more"}
      </Link>
    </div>
    </div>
  );
}
