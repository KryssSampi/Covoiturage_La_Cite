// features/auth/components/LoginArea.tsx
'use client'

import { useAppState, Language } from '@/core/state/app_state'
import { useLoginForm } from '../hooks/useloginForm'
import { FaArrowLeft, FaHome } from 'react-icons/fa'
import { useLoader } from '@/core/context/loader.context'

export function LoginArea() {
  const appState = useAppState()
  const { setActiveLoader } = useLoader();
  const { email, setEmail, error, isLoading, handleLogin } = useLoginForm()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleLogin(appState.lang)
  }

  return (
       <div className=" relative flex flex-col gap-y-4 items-center justify-center  bg-[rgba(0,0,0,0.2)] px-10 rounded-2xl">
      <FaArrowLeft className="absolute top-3 left-3 text-blue-500 text-2xl cursor-pointer hover:text-blue-700 transition-colors" onClick={() => {setActiveLoader(true); window.history.back()}} />
      <FaHome className="absolute top-3 right-3 text-blue-500 text-2xl cursor-pointer hover:text-blue-700 transition-colors" onClick={() => {setActiveLoader(true); window.location.href = '/'}} />
       <form 
      onSubmit={handleSubmit}
      className="w-full h-75 flex flex-col gap-y-4 items-center justify-center"
    >
         <h2 className="text-3xl font-bold text-white">
        {appState.lang === Language.FR ? "Bienvenue de retour!" : "Welcome back!"}
      </h2>
   <label htmlFor="email" className="text-lg font-semibold text-white">
        {appState.lang === Language.FR ? 'Email:' : 'Email:'}
      </label>
      
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border text-black border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white"
        placeholder={
          appState.lang === Language.FR 
            ? 'Entrez votre email' 
            : 'Enter your email'
        }
        disabled={isLoading}
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      
      <button
        type="submit"
        disabled={isLoading}
        className="bg-[rgb(0,4,252)] text-white px-4 py-2 rounded-md z-10 hover:bg-blue-600 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
      >
        {isLoading 
          ? (appState.lang === Language.FR ? 'Connexion...' : 'Logging in...')
          : (appState.lang === Language.FR ? 'Se connecter' : 'Log in')
        }
      </button>
   
    </form>
           </div>

  )
}