
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Covoiturage La Cité - Page de Connexion",
  description:
    "Covoiturage La Cité - Connectez-vous à votre compte pour accéder à notre plateforme de covoiturage dédiée à la communauté de La Cité. Trouvez facilement des trajets partagés, réduisez votre empreinte carbone et connectez-vous avec d'autres membres pour des voyages plus économiques et conviviaux.",
};

/* ── Mosaïque oblique ──────────────────────────────────────────────────────────
 * 8 images découpées en diagonale douce (~20 % de dérive horizontale).
 *
 * Deux diagonales principales parallèles (pente ≈ 5) :
 *   - Bordure gauche  : (0%,0%) → (20%,100%)
 *   - Bordure droite   : (80%,0%) → (100%,100%)
 *
 * Bande du milieu (80 % de largeur) découpée en 2 rangées × 3 colonnes.
 * Chaque colonne ≈ 27 % de large, décalage de 10 % par demi-hauteur.
 */
const COLLAGE: { src: string; alt: string; clip: string }[] = [
  // Coin haut-droit
  {
    src: "/img/acceuil-hero-img.png",
    alt: "Accueil",
    clip: "polygon(75% 0%, 100% 0%, 100% 100%, 85% 100%)",
  },
  // Rangée 1 — gauche
  {
    src: "/img/driver-hero.png",
    alt: "Conducteur",
    clip: "polygon(15% 0%, 35% 0%, 40% 50%, 10% 50%)",
  },
  // Rangée 1 — centre
  {
    src: "/assets/destinations-pictures/la-cite.png",
    alt: "Planifier",
    clip: "polygon(35% 0%, 55% 0%, 60% 50%, 40% 50%)",
  },
  // Rangée 1 — droite
  {
    src: "/img/passenger-hero.png",
    alt: "Passager",
    clip: "polygon(55% 0%, 75% 0%, 80% 50%, 60% 50%)",
  },
  // Rangée 2 — gauche
  {
    src: "/img/nouveautes-section-background.png",
    alt: "Nouveautés",
    clip: "polygon(15% 50%, 40% 50%, 45% 100%, 25% 100%)",
  },
  // Rangée 2 — centre
  {
    src: "/img/planifier-background.png",
    alt: "Détails",
    clip: "polygon(40% 50%, 60% 50%, 65% 100%, 45% 100%)",
  },
  // Rangée 2 — droite
  {
    src: "/assets/reservertion_map_button/reservation-map.png",
    alt: "Carte",
    clip: "polygon(60% 50%, 80% 50%, 85% 100%, 65% 100%)",
  },
  // Coin bas-gauche
  {
    src: "/img/list-detail-background.png",
    alt: "La Cité",
    clip: "polygon(0% 0%, 15% 0%,25% 100%, 0% 100%)",
  },
];

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
  
      {/* ── Section header avec collage photo ── */}
      <section className="relative w-full h-[40vh] overflow-hidden bg-gray-900">
        {/* Images du collage — chacune couvre toute la section, clip-path révèle sa zone */}
        {COLLAGE.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{ clipPath: img.clip }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="100vw"
              className="object-cover brightness-[0.55]"
              priority={i < 2}
            />
          </div>
        ))}

       {/* Dégradé blanc du bas → 60 % de la hauteur */}
        <div className="absolute z-5 inset-x-0 bottom-0 h-[60%] bg-linear-to-t from-gray-500 to-transparent pointer-events-none" />
        {/* Voile bleu-marine → noir subtil sur toute la section */}
        <div className="absolute z-5 inset-0 bg-linear-to-b from-[#08316e]/35 to-black/10 pointer-events-none" />
      
       {/* Logo + Titre — centré par-dessus le collage */}
        <div className="relative z-10 h-full mt-20 flex items-center justify-center">
          
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
            <div className="flex h-28 w-28 md:h-30 md:w-30 items-center justify-center rounded-full bg-[#08316e] shadow-lg">
              <Image
                src="/img/school-carpoling-black-logoavif.png"
                alt="Logo Covoiturage La Cité"
                width={130}
                height={130}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl md:text-6xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              Covoiturage <span className="text-blue-500">La Cité</span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── Contenu (formulaire de connexion) ── */}
      <main className="flex-1 w-full flex items-start justify-center px-4 pt-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="w-full">
        <div className="bg-gray-100 text-center p-4">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Covoiturage La Cité. Tous droits
            réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
