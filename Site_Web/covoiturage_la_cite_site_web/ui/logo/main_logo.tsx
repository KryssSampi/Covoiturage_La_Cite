import Image from "next/image";

export function MainLogo() {
  return (
    <div className="flex items-center">
        <Image src="/img/school-carpoling-black-logoavif.png" alt="La Cité Covoiturage Logo" className="w-20 h-20" width={100} height={100}/>
        <div className="flex-col">
        <span className="text-3xl   font-bold text-white">La Cité</span><br/>
        <span className="text-3xl font-bold text-blue-400">Covoiturage</span>
        </div>
    </div>
  );
}