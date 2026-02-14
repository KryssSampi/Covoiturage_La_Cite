"use client";
import { useAppState, Language } from "@/app/app_state";
import { ToggleLangButton } from "@/ui/boutons/togglelang";
import { MainLogo } from "@/ui/logo/main_logo";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export function Header() {
  const AppState = useAppState();
  
  // On suit l'onglet actif. Par défaut, c'est l'accueil.
  const [activePath, setActivePath] = useState("/");

  const mainLinks = [
    { href: "/", fr: "Accueil", en: "Home" },
    { href: "/#pourquoi-nous-choisir", fr: "Pourquoi Nous Choisir ?", en: "Why chouse us ?" },
    { href: "/#comment-ca-marche", fr: "Comment Ça Marche ?", en: "How it Work ?" },
  ];

  return (
    <header className="bg-blue-800 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-0 flex justify-between items-center">
        <MainLogo />

        <div className="flex items-center">
          {/* Groupe Navigation Principale */}
          <div className="flex mr-6 relative">
            {mainLinks.map((link) => {
              const isActive = activePath === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setActivePath(link.href)}
                  className={`relative px-2 py-2 text-lg font-semibold transition-colors duration-300 
                    ${isActive ? "text-blue-200" : "text-white hover:text-blue-200"}`}
                >
                  {AppState.lang === Language.FR ? link.fr : link.en}
                  
                  {/* LA BARRE MAGNÉTIQUE : Elle ne s'affiche que sur l'élément actif, 
                      mais Framer Motion l'animera d'un point A à un point B grâce au layoutId */}
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-blue-300 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Séparateur pour la FAQ (Style à part avec translation progressive) */}
            <div className="relative group flex items-center ml-2">
              <Link 
                href="/FAQ" 
                className="px-3 py-2 text-lg text-white font-semibold hover:text-blue-200 transition-colors"
              >
                FAQ
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-300 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            </div>
          </div>

          <div className="bg-white/20 w-px h-8 mx-4" />

          <div className="flex items-center space-x-6">
            <ToggleLangButton />
            <button className="bg-white text-blue-800 px-6 py-2 rounded-full text-lg font-semibold 
                               transition-all duration-300 hover:bg-blue-50 hover:shadow-lg hover:scale-105
                               active:scale-95">
              {AppState.lang === Language.FR ? 'Se connecter' : 'Sign in'}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}