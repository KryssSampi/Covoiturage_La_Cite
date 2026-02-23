"use client";

import { useAppState, Language } from "@/core/state/app_state";
import Link from "next/link";
import Image from "next/image";
import { ToggleLangButton } from "@/shared/ui/buttons/togglelang";
import { MainLogo } from "../ui/logo/main_logo";
import { FaRegBell } from "react-icons/fa";
import { useState } from "react";
import CustomToggle from "@/shared/ui/toggles/simple_toggle";
import { useIsMobileOrTablet } from "../hooks/useismobileortable";
import { useLoader } from "@/core/context/loader.context";
import { useRouter } from "next/navigation";

export function Header() {
    const appState = useAppState();
    const isbellowlg = useIsMobileOrTablet();
    const { setActiveLoader } = useLoader();
    const router = useRouter();
    const [ishover1, setIshover1] = useState(false);
    const [ishover2, setIshover2] = useState(false);
    const [ishover3, setIshover3] = useState(false);
    const [ishover4, setIshover4] = useState(false);
    const [ishover5, setIshover5] = useState(false);
    const [isActive1, setIsActive1] = useState(true);
    const [isActive2, setIsActive2] = useState(false);
    const [isActive3, setIsActive3] = useState(false);
    const [isActive4] = useState(false);
    const [isActive5, setIsActive5] = useState(false);
    const [istoggleActif, setIsToggleActif] = useState(false);
    const [isPassengerActif] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
    const [, setIsMenuOver] = useState(false);
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

   const handleLogout = () => {
    // Active le loader et redirige l'utilisateur vers la page de connexion
    setActiveLoader(true);
    router.push('/login');
    appState.logout();
}

    return (
        <header className="flex flex-col top-0 z-999 sticky w-full">
            <div className="bg-blue-800 flex shadow-md  sticky top-0 z-50 justify-between items-center lg:px-6 ">
                <div className="flex items-center lg:scale-100 scale-75 -ml-5">
                    <MainLogo />
                </div>
                <div className="flex items-center space-x-6  object-right">
                    <nav className="container mx-auto lg:px-4  -ml-20  pr-0 py-0 flex gap-x-5 justify-between items-center">
                        <button className="text-white lg:text-xl   font-bold relative" onMouseEnter={() => setIshover1(true)} onMouseLeave={() => setIshover1(false)} onClick={() => setIsActive1(true)}>
                            <Link href={`/${appState.userConnected?.role.toString()}/${appState.userConnected?.id}`} className={`text-white lg:text-xl font-bold ${ishover1 ? 'text-xl text-blue-300 ' : ' '}`}>
                                {appState.lang === Language.FR ? 'Acceuil' : 'Home'}
                            </Link>
                            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-blue-300 rounded-full transition-all duration-300 ${isActive1 ? 'scale-x-100' : ''}  ${ishover1 && !isActive1 ? 'scale-x-100' : 'scale-x-0'}`} />
                        </button>
                        {!isbellowlg && (<>
                            <button className="text-white text-xl font-bold relative" onMouseEnter={() => setIshover2(true)} onMouseLeave={() => setIshover2(false)} onClick={() => setIsActive2(true)}>
                                <Link href="/planifier" className={`text-white text-xl font-bold ${ishover2 ? 'text-xl text-blue-300 ' : ' '}`}>
                                    {appState.lang === Language.FR ? 'Planifier' : 'Plan'}
                                </Link>
                                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-blue-300 rounded-full transition-all duration-300 ${isActive2 ? 'scale-x-100' : ''}  ${ishover2 && !isActive2 ? 'scale-x-100' : 'scale-x-0'}`} />
                            </button>
                            <button className="text-white text-xl font-bold relative" onMouseEnter={() => setIshover3(true)} onMouseLeave={() => setIshover3(false)} onClick={() => setIsActive3(true)}>
                                <Link href="/historique" className={`text-white text-xl font-bold ${ishover3 ? 'text-xl text-blue-300 ' : ' '}`}>
                                    {appState.lang === Language.FR ? 'Historique' : 'History'}
                                </Link>
                                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-blue-300 rounded-full transition-all duration-300 ${isActive3 ? 'scale-x-100' : ''}  ${ishover3 && !isActive3 ? 'scale-x-100' : 'scale-x-0'}`} />
                            </button></>
                        )}
                        <button className="text-white lg:text-xl text-2xs font-bold relative" onMouseEnter={() => { setIshover4(true); setIsMenuOpen(true); }} onMouseLeave={() => { setIshover4(false); setIsMenuOpen(false); }} onClick={toggleMenu}>
                            {appState.lang === Language.FR ? 'Menu' : 'Menu'}
                            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-blue-300 rounded-full transition-all duration-300 ${isActive4 ? 'scale-x-100' : ''}  ${ishover4 && !isActive4 ? 'scale-x-100' : 'scale-x-0'}`} />
                        </button>
                        <button className="text-white lg:text-xl text-2xs font-bold relative" onMouseEnter={() => setIshover5(true)} onMouseLeave={() => setIshover5(false)} onClick={() => setIsActive5(true)}>
                            <Link href="/FAQ" className={`text-white lg:text-xl text-2xs font-bold ${ishover5 ? 'lg:text-xl text-blue-300 ' : ' '}`}>
                                {appState.lang === Language.FR ? 'FAQ' : 'FAQ'}
                            </Link>
                            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-blue-300 rounded-full transition-all duration-300 ${isActive5 ? 'scale-x-100' : ''}  ${ishover5 && !isActive5 ? 'scale-x-100' : 'scale-x-0'}`} />
                        </button>
                    </nav>

                    <div className="w-px h-6 lg:ml-0 ml-1 lg:mr-0 -mr-2 bg-gray-400" />
                    <div className={`flex items-center space-x-6 ${isbellowlg ? ' -mr-5' : 'mr-6'}`}>
                        <ToggleLangButton />
                    </div>
                    <div className="inline-flex bg-transparent relative lg:-ml-3 ml-3  " >
                        <div className="bg-red-600 lg:text-2xs right-0 -top-1  text-xs lg:w-5 lg:h-5 w-4 h-4 text-center justify-center items-center text-white rounded-full absolute">
                            <span className="p-1 relative">3</span>
                        </div>
                        <FaRegBell className="text-white lg:text-4xl  text-3xl" />
                    </div>
                    <button className="text-white text-xl  bg-white lg:w-20 lg:h-15 w-10 h-10 lg:ml-0 -ml-5 font-bold relative" style={{ borderRadius: '50%' }} onMouseEnter={() => setIsAvatarMenuOpen(true)} onMouseLeave={() => setIsAvatarMenuOpen(false)}>
                        <div className="bg-red-600  right-0 top-0 w-3 h-3 text-center text-white rounded-full absolute" />
                        {appState.userConnected?.role.toString().toLowerCase() === "passenger" ?
                            (isPassengerActif === true ? (
                                <div className="bg-green-600  right-0 bottom-0 lg:w-4 lg:h-4 w-3 h-3 text-center text-white rounded-full absolute" />
                            ) : (<div className="absolute right-0 bottom-0 lg:w-4 lg:h-4 w-3 h-3 bg-gray-600 border-2 border-gray-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors">
                                <span className="text-gray-400 lg:text-[8px] text-[6px] font-bold leading-none mt-0.5">✕</span>
                            </div>)) : (istoggleActif === true ? (
                                <div className="bg-green-600  right-0 bottom-0 lg:w-4 lg:h-4 w-3 h-3 text-center text-white rounded-full absolute" />
                            ) : (<div className="absolute right-0 bottom-0 lg:w-4 lg:h-4 w-3 h-3 bg-gray-600 lg:border-2 border border-gray-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors">
                                <span className="text-gray-400 lg:text-[8px] text-[6px] font-bold leading-none mt-0.5">✕</span>
                            </div>
                            ))}
                        <Image src="https://static.vecteezy.com/system/resources/thumbnails/048/216/761/small/modern-male-avatar-with-black-hair-and-hoodie-illustration-free-png.png" alt="Profile" width={35} height={40} className="lg:w-full lg:h-full rounded-full object-cover" />
                    </button>
                    {appState.userConnected?.role.toString() === "driver" && (
                        <div className=" flex flex-col text-center lg:ml-0 -ml-5 lg:text-2xl">
                            {appState.lang === Language.FR ? "Actif" : "Active"}

                            <div className="lg:scale-100 scale-80">
                                <CustomToggle bindValue={istoggleActif} onToggle={(value) => setIsToggleActif(value)} activeColor="bg-green-400" />
                            </div>

                        </div>
                    )}
                </div>
                <div className={`absolute lg:top-16 top-12 text-center right-0 w-30 bg-white shadow-lg rounded-md py-2 ${isAvatarMenuOpen ? 'block' : 'hidden'}`} onMouseEnter={() => { setIsAvatarMenuOpen(true) }} onMouseLeave={() => { setIsAvatarMenuOpen(false) }}>
                    <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">{appState.lang === Language.FR ? 'Profil' : 'Profile'}</Link>
                    <Link href="/settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">{appState.lang === Language.FR ? 'Paramètres' : 'Settings'}</Link>
                    <button onClick={ () => handleLogout() } className="w-full text-center px-4 py-2 text-gray-800 hover:bg-gray-100">{appState.lang === Language.FR ? 'Se Déconnecter' : 'Log Out'}</button>
                </div>
                <div className={`absolute top-12 lg:right-45 w-80 text-center bg-white shadow-lg rounded-md py-2 ${isMenuOpen ? 'block' : 'hidden'}`} onMouseEnter={() => { setIsMenuOpen(true) }} onMouseLeave={() => { setIsMenuOver(false); setIsMenuOpen(false) }}>
                    {isbellowlg && (<>
                        <Link href={`/${appState.userConnected?.role.toString()}/${appState.userConnected?.id}/Planifier`} className="block px-4 py-2 text-gray-800 hover:bg-gray-100">{appState.lang === Language.FR ? 'Planifier' : 'Plan'}</Link>
                        <Link href={`/${appState.userConnected?.role.toString()}/${appState.userConnected?.id}/Historique`} className="block px-4 py-2 text-gray-800 hover:bg-gray-100">{appState.lang === Language.FR ? 'Historique' : 'History'}</Link>
                    </>)}
                    <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">{appState.lang === Language.FR ? 'Mes Favoris' : 'My Favorites'}</Link>
                    <Link href="/settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">{appState.lang === Language.FR ? 'Avis Sur Moi' : 'Reviews About Me'}</Link>
                    <Link href="/settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">{appState.lang === Language.FR ? 'Nouveautés' : 'New Features'}</Link>
                    <Link href="/settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">{appState.lang === Language.FR ? 'Go Board' : 'Go Board'}</Link>

                </div>

            </div>
        </header>
    );
}
