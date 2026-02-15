import Link from 'next/link';
import { useAppState } from '@/core/state/app_state';
import { Language } from '@/core/state/app_state';

export function HowItWorkSection() {
    const appState = useAppState();
  return (
    <div className="w-full h-250 mt-10 flex flex-col items-center justify-center bg-[#08316E]">
      <h2 className="text-6xl font-bold text-white" id="comment-ca-marche">
        {appState.lang === Language.FR
          ? "Comment ça marche ?"
          : "How it works ?"}
      </h2>
      <div className='-mt-70 ml-20 relative w-full  bg-transparent' >
      <div className="w-full h-200 flex flex-col items-center justify-center gap-15 mt-10 " >
       <div className=' ml-50 w-full h-90 flex '>
        <div className='flex flex-col items-center justify-center ml-25'>
        <div className='w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#08316E] text-5xl font-bold mr-4'>1</div>    
          <h3 className='text-3xl font-semibold text-white m-5 underline text-center'>{appState.lang === Language.FR ? "Inscrivez vous" : "Sign-Up"}</h3>
            <p className='text-white w-120 text-3xl text-center'><Link href="/inscription" className='text-blue-400 hover:underline hover:text-4xl transition-all active:text-blue-800' > {appState.lang === Language.FR ? "Créer un compte" : "Sign Up"} </Link>{appState.lang === Language.FR ? "avec votre adresse email du Collège la Cité et vérifiez votre identité étudiante" : "Create your account with your college email and verify your student identity."}</p>
        </div>
        <div className='bg-gray-600 w-1 mt-10 ml-20 h-130'/>    
        <div className='flex flex-col items-center justify-center ml-25'>
        <div className='w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#08316E] text-5xl font-bold mr-4'>2</div>    
          <h3 className='text-3xl text-white font-bold m-5 underline text-center'>{appState.lang === Language.FR ? "Réservez / Proposez" : "Book / Offer"}</h3>
            <p className='text-white w-120 text-3xl text-center'>{appState.lang === Language.FR ? "Rechercher un covoiturage disponible pour votre destination ou Proposer en un si vous êtes conducteur" : "Search for an available carpooling ride for your destination or offer one if you are a driver."}</p>
        </div>
        </div>
       </div>
<div className="w-250 h-1 ml-70 -mt-50 bg-gray-600 " />
              <div className='w-full ml-25 h-90 flex '>
        <div className='flex flex-col items-center justify-center ml-25'>
        <div className='w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#08316E] text-5xl font-bold mr-4'>3</div>    
          <h3 className='text-3xl font-semibold text-white m-5 underline text-center'>{appState.lang === Language.FR ? "Voyagez" : "Travel"}</h3>
            <p className='text-white w-120 text-3xl text-center'>{appState.lang === Language.FR ? "Partagez le trajet , les frais et créez des liens avec vos camarades et collègues du Collège La Cité" : "Share the ride, costs and create links with your classmates and colleagues at La Cité College."}</p>
        </div>
        <div className='bg-gray-600 w-1 mt-20 ml-20 h-60'/>
                 <div className='flex flex-col items-center justify-center ml-25'>

        <div className='w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#08316E] text-5xl font-bold mr-4 text-center'>4</div>    
          <h3 className='text-3xl font-semibold text-white m-5 underline text-center'>{appState.lang === Language.FR ? "Évaluez l'expérience" : "Evaluate the experience"}</h3>
            <p className='text-white w-120 text-3xl text-center'>{appState.lang === Language.FR ? "Faites des rétrocactions sur votre espérience, notez les autres utilisateurs afin d’améliorer votre sécurité et votre confort" : "Give feedback on your experience, rate other users to improve your safety and comfort."}</p>
        </div>
       </div>

      </div>
      </div>
  );
}
    