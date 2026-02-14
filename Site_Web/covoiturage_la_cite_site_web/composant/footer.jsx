import { Language, useAppState } from "@/app/app_state";
import { MainLogo } from "@/ui/logo/main_logo";
import { FaFacebookSquare,FaFacebookMessenger, FaInstagram, FaWhatsapp, FaArrowUp } from "react-icons/fa";
import { AnimatePresence , motion } from "framer-motion";
import { useEffect , useState } from "react";
import Link from "next/link";


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
    const appState = useAppState()
  return (
    <div className="w-full h-100  flex flex-col  items-center justify-center bg-[#08316E] text-white text-lg font-semibold">
<div className=" flex w-full h-170">
    <div className="scale-200 h-30 items-center mt-40 ml-40">
<MainLogo />
</div>
<div className="bg-gray-600 flex w-px h-75 ml-40 mt-5" />
<div className="ml-30 mt-20" align="center"  >
<h2 className="text-violet-600 text-3xl">{appState.lang === Language.FR ? "Lien Rapide" : "Short-cut Link"}</h2>
<ul>
<li>
    <Link href="" className=" text-lg   hover:underline active:text-gray-400" >
   {appState.lang === Language.FR ? "À propos" : "About"}
    </Link>
</li>
<li>
    <Link href="" className=" text-lg hover:underline active:text-gray-400">
   {appState.lang === Language.FR ? "Conditions D'utilisation" : "Usings Conditions"}
    </Link>
</li>
<li>
    <Link href="" className=" text-lg hover:underline  active:text-gray-400 ">
   {appState.lang === Language.FR ? "Politique de Confidentialité" : "Privacy Policy"}
    </Link>
</li>
<li>
    <Link href="" className=" text-lg hover:underline active:text-gray-400 ">
   {appState.lang === Language.FR ? "FAQ" : "FAQ"}
    </Link>
</li>
</ul>
</div>
<div className="ml-70 -mt-10 flex flex-col gap-y-20">
  <div className=" mt-20" align="center"  >
<h2 className="text-violet-600 text-3xl">{appState.lang === Language.FR ? "Support" : "Support"}</h2>
<ul>
<li>
    <Link href="" className=" text-lg   hover:underline active:text-gray-400" >
   {appState.lang === Language.FR ? "Centre d'aide" : "Help center"}
    </Link>
</li>
<li>
    <Link href="" className=" text-lg hover:underline active:text-gray-400">
   {appState.lang === Language.FR ? "Nous Contacter" : "Contact Us"}
    </Link>
</li>
<li>
    <Link href="" className=" text-lg hover:underline  active:text-gray-400 ">
   {appState.lang === Language.FR ? "Signaler Un Problème" : "Report a problem"}
    </Link>
</li>

</ul>
</div>
<div className="flex gap-x-10">
<Link href=" " className=" scale-250">
<FaFacebookSquare />
</Link>
<Link href=" " className=" scale-250">
{FaFacebookMessenger()}
</Link>
<Link href=" " className=" scale-250">
<FaInstagram />
</Link>
<Link href=" " className=" scale-250">
{FaWhatsapp()}
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
          // Positionnement fixe pour qu'il suive l'écran, pas le flux du site
          className="fixed bottom-10 right-10 z-50 p-4 rounded-full 
                     bg-[#08316E]/80 backdrop-blur-md text-white shadow-xl
                     border border-white/20 transition-colors hover:bg-[#08316E]"
          whileHover={{ y: -5, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowUp className="text-xl" />
          
        </motion.button>
      )}
    </AnimatePresence>


</div>
<div className="w-full h-px bg-gray-600"/>
<p className="text-gray-500 m-5 text-lg"> &copy; Covoiturage la cité 2026 All Right Resevered </p>
    </div>
  );
}