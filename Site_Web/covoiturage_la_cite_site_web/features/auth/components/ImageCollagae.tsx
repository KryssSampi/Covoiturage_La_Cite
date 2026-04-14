import Image from 'next/image';

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
{/* ── Section header avec collage photo ── */}
export default function ImageCollage() {
    return (
              <section className="relative w-full h-full overflow-hidden bg-gray-900">

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
              </section>
    )
}