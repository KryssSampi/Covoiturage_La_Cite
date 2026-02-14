import Image from "next/image";
import { useAppState } from "@/app/app_state";
import { Language } from "@/app/app_state";

export function WhyUsSection() {
    const appState = useAppState();

    const advantagesList = [
    new advantages(
        "Économie",
        "Savings",
        "/img/avantages/économie.png",
        "Partagez les frais de transport et économisez de l'argent sur vos trajets quotidiens.",
        "Share transport costs and save money on your daily trips."
    ),
    new advantages(
        "Communauté",
        "Community",
        "/img/avantages/communauté.png",   
        "Faites de nouvelles rencontres et élargissez votre cercle social en partageant vos trajets avec d'autres étudiants.",
        "Make new friends and expand your social circle by sharing your trips with other students."
    ),
    new advantages(
        "Écologie",
        "Ecology",
        "/img/avantages/écologie.png",
        "Réduisez votre empreinte carbone en partageant vos trajets et en contribuant à un environnement plus propre.",
        "Reduce your carbon footprint by sharing your trips and contributing to a cleaner environment."
    ),
    new advantages(
        "Sécurité",
        "Security",
        "/img/avantages/sécurité.png",
        "Notre plateforme met en place des mesures de sécurité pour assurer la tranquillité d'esprit de nos utilisateurs lors de leurs trajets partagés.",
        "Our platform implements security measures to ensure the peace of mind of our users during shared trips."
    ),
    new advantages(
        "Simplicité",
        "Ease of Use",
        "/img/avantages/simplicité.png",
        "Notre plateforme conviviale rend la planification et la gestion de vos trajets de covoiturage simple et efficace.",
        "Our user-friendly platform makes planning and managing your carpooling trips simple and efficient."
    ),
    new advantages(
        "Flexibilité",
        "Flexibility",
        "/img/avantages/flexibilité.png",
        "Notre plateforme vous offre une grande flexibilité pour organiser vos trajets de manière adaptée à vos besoins.",
        "Our platform offers great flexibility to organize your trips in a way that suits your needs."
    ),

];

  return (
    <div className="w-full h-250 flex flex-col items-center justify-center bg-[#f7f7f7]">
      <h2 className="text-6xl font-bold text-[#08316E] " id="pourquoi-nous-choisir">
        {appState.lang === Language.FR
          ? "Pourquoi Nous Choisir ?"
          : "Why Choose Us ?"}
      </h2>
      <div className="w-full h-200 flex items-center justify-center gap-15 mt-10 grid-cols-3" >
        {advantagesList.slice(0, 3).map((advantage, index) => (
          <div key={index} className="w-100 h-110 bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-110 transition-transform" >
            <Image src={advantage.source} alt={advantage.titleen} width={160} height={160} className="mb-4" />
   <h3 className="text-5xl -mt-5 font-semibold text-[#5E9FE9]">{appState.lang === Language.FR ? advantage.titlefr : advantage.titleen}</h3>
     <div className="w-80 h-px bg-[#000000] mb-4" />
            <p className="text-gray-600 text-2xl mt-2">{appState.lang === Language.FR ? advantage.descriptionfr : advantage.descriptionen}</p>
          </div>
        ))}
      </div>
            <div className="w-full h-200 flex items-center justify-center gap-15 mt-10 grid-cols-3" >
        {advantagesList.slice(3, 6).map((advantage, index) => (
          <div key={index} className="w-100 h-110 bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-110 transition-transform " >
            <Image src={advantage.source} alt={appState.lang === Language.FR ? advantage.titlefr : advantage.titleen} width={160} height={160} className="mb-4" />
            <h3 className="text-5xl -mt-5  font-semibold text-[#5E9FE9]">{appState.lang === Language.FR ? advantage.titlefr : advantage.titleen}</h3>
              <div className="w-80 h-px bg-[#000000] mt-2 mb-4"/>
            <p className="text-gray-600 text-2xl mt-2">{appState.lang === Language.FR ? advantage.descriptionfr : advantage.descriptionen}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
class advantages {
    constructor(titlefr, titleen, source, descriptionfr = "", descriptionen = "") {
        this.titlefr = titlefr;
        this.titleen = titleen;
        this.source = source;
        this.descriptionfr = descriptionfr;
        this.descriptionen = descriptionen;  
    }
}

