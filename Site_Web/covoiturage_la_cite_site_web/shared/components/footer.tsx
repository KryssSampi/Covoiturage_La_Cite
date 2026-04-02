"use client";

import { Language, useAppState } from "@/core/state/app_state";
import { MainLogo } from "@/shared/ui/logo/main_logo";
import { FaFacebookSquare, FaFacebookMessenger, FaInstagram, FaWhatsapp, FaArrowUp } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useIsMobileOrTablet } from "../hooks/useismobileortable";

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 2000) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const appState = useAppState();
  const isbellowlg = useIsMobileOrTablet();

  return (
    <div className="w-full h-100 flex flex-col items-center justify-center bg-[#08316E] text-white text-lg font-semibold">
      <div className="flex w-full h-170">
        <div className="lg:scale-200 scale-150 h-30 items-center lg:mt-40 mt-35 lg:ml-40 ml-10">
          <MainLogo />
        </div>

        {!isbellowlg && <div className="bg-gray-600 flex w-px h-75 lg:ml-40 mt-5" />}

        <div className="lg:ml-30 ml-15 lg:mt-20 text-center lg:text-left object-center lg:scale-100 scale-75">
          <h2 className="text-violet-600 text-3xl">{appState.lang === Language.FR ? "Lien Rapide" : "Short-cut Link"}</h2>
          <ul>
            <li>
              <Link href="/about" className="text-lg hover:underline active:text-gray-400">
                {appState.lang === Language.FR ? "A propos" : "About"}
              </Link>
            </li>
            <li>
              <Link href="/conditions" className="text-lg hover:underline active:text-gray-400">
                {appState.lang === Language.FR ? "Conditions D'utilisation" : "Usings Conditions"}
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="text-lg hover:underline active:text-gray-400">
                {appState.lang === Language.FR ? "Politique de Confidentialite" : "Privacy Policy"}
              </Link>
            </li>
            <li>
              <Link href="/accessibilite" className="text-lg hover:underline active:text-gray-400">
                {appState.lang === Language.FR ? "Accessibilite" : "Accessibility"}
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:ml-70 -ml-60 mr-10 lg:-mt-10 mt-35 lg:scale-100 scale-80 flex flex-col gap-y-20">
          <div className="lg:mt-20 mt-10 object-center">
            <h2 className="text-violet-600 text-3xl">{appState.lang === Language.FR ? "Support" : "Support"}</h2>
            <ul>
              <li>
                <Link href="/faq" className="text-lg hover:underline active:text-gray-400">
                  {appState.lang === Language.FR ? "FAQ" : "FAQ"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-lg hover:underline active:text-gray-400">
                  {appState.lang === Language.FR ? "Infos de contact" : "Contact info panel"}
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex gap-x-2 lg:ml-20 lg:mt-0 -mt-15 scale-180 lg:scale-250">
            <Link href=" " className=" ">
              <FaFacebookSquare />
            </Link>
            <Link href=" " className=" ">
              <FaFacebookMessenger />
            </Link>
            <Link href=" " className=" ">
              <FaInstagram />
            </Link>
            <Link href=" " className=" ">
              <FaWhatsapp />
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {isVisible && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              onClick={scrollToTop}
              className="fixed bottom-10 right-10 z-50 p-4 rounded-full bg-[#08316E]/80 backdrop-blur-md text-white shadow-xl border border-white/20 transition-colors hover:bg-[#08316E]"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaArrowUp className="text-xl" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="lg:w-full h-px bg-gray-600" />
      <p className="text-gray-500 m-5 text-xs lg:text-lg"> &copy; Covoiturage la cite 2026 All Right Reserved </p>
    </div>
  );
}
