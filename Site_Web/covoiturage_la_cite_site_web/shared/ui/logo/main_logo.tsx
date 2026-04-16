import Image from "next/image";

export function MainLogo() {
  return (
    <div className="flex flex-col w-full md:flex-row items-center">
        <Image src="/img/school-carpoling-black-logoavif.png" alt="La Cité Covoiturage Logo" className="w-8 h-8 md:w-10 lg:w-20 md:h-10 lg:h-20" width={40} height={40}/>
        <div className="flex flex-col w-full">
        <span className="text-lg md:text-xl lg:text-3xl font-bold text-white">La Cité</span><br/>
        <span className="text-lg md:text-xl lg:text-3xl font-bold text-blue-400">Covoiturage</span>
        </div>
    </div>
  );
}

