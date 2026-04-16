import Image from "next/image";

export function MainLogo() {
  return (
    <div className="flex items-center">
        <Image src="/img/school-carpoling-black-logoavif.png" alt="La Cité Covoiturage Logo" className="lg:w-20 lg:h-20" width={40} height={40}/>
        <div className="flex-col">
        <span className="lg:text-3xl  font-bold text-white">La Cité</span><br/>
        <span className="lg:text-3xl  font-bold text-blue-400">Covoiturage</span>
        </div>
    </div>
  );
}