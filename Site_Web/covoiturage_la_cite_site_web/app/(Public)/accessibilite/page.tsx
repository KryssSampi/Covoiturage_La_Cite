import { FaUniversalAccess, FaKeyboard, FaCircleHalfStroke, FaFont, FaComments, FaMobileScreen, FaCircleCheck, FaEye, FaHandPointer, FaHeadphones, FaCode, FaArrowsRotate, FaWheelchair, FaHeart } from 'react-icons/fa6';

export default function AccessibilitePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#08316e_0%,#0d3f7e_45%,#0a2a5c_100%)] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(94,159,233,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <FaUniversalAccess className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-[#5E9FE9]">Accessibilité</span> pour tous
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 leading-8">
            Nous croyons que chaque personne mérite une expérience numérique inclusive et confortable.
            Notre plateforme s&apos;aligne progressivement sur les recommandations WCAG 2.1 niveau AA
            pour garantir l&apos;accès à tous.
          </p>
        </div>
      </section>

      {/* Engagements principaux */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          <FaHeart className="inline mr-2 text-[#5E9FE9]" />
          Nos engagements
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaKeyboard className="text-[#5E9FE9] text-2xl" />
            </div>
            <h3 className="text-xl font-semibold">Navigation au clavier</h3>
            <p className="mt-3 text-white/75 leading-7">
              Tous les parcours essentiels de l&apos;application sont navigables entièrement au clavier.
              Les utilisateurs peuvent parcourir les menus, remplir les formulaires, réserver un trajet
              et gérer leur profil sans souris.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Focus visible sur tous les éléments interactifs</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Ordre de tabulation logique</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Raccourcis clavier pour actions courantes</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaCircleHalfStroke className="text-[#5E9FE9] text-2xl" />
            </div>
            <h3 className="text-xl font-semibold">Contrastes et lisibilité</h3>
            <p className="mt-3 text-white/75 leading-7">
              Les contrastes de couleur respectent les ratios minimaux recommandés par WCAG 2.1 AA.
              Les textes sont lisibles sur tous les appareils, des écrans mobiles aux moniteurs de bureau.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Ratio de contraste ≥ 4.5:1 pour le texte</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Ratio ≥ 3:1 pour les composants d&apos;interface</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Mode sombre natif avec bons contrastes</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaFont className="text-[#5E9FE9] text-2xl" />
            </div>
            <h3 className="text-xl font-semibold">Typographie adaptative</h3>
            <p className="mt-3 text-white/75 leading-7">
              Les tailles de texte sont ajustables et les polices choisies privilégient la lisibilité.
              Le contenu s&apos;adapte fluidement grâce à un design responsive couvrant toutes les
              résolutions d&apos;écran.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Zoom jusqu&apos;à 200% sans perte</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Tailles en rem/em (pas de px fixes)</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Interlignage généreux pour le confort</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaComments className="text-[#5E9FE9] text-2xl" />
            </div>
            <h3 className="text-xl font-semibold">Libellés et formulaires</h3>
            <p className="mt-3 text-white/75 leading-7">
              Chaque champ de formulaire dispose d&apos;un libellé explicite et d&apos;instructions claires.
              Les messages d&apos;erreur sont descriptifs et guident l&apos;utilisateur vers la correction.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Labels associés à chaque input</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Messages d&apos;erreur inline et descriptifs</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Attributs ARIA pour les lecteurs d&apos;écran</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Fonctionnalités d'aide */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-10 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <FaWheelchair className="inline mr-2 text-[#5E9FE9]" />
            Technologies d&apos;assistance
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaHeadphones className="text-[#5E9FE9] text-2xl" />
              </div>
              <h3 className="font-semibold text-lg">Lecteurs d&apos;écran</h3>
              <p className="mt-2 text-sm text-white/65 leading-6">
                Compatible avec VoiceOver, NVDA et JAWS. Les rôles ARIA, les régions live et les
                descriptions alternatives sont intégrés dans l&apos;interface.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaHandPointer className="text-[#5E9FE9] text-2xl" />
              </div>
              <h3 className="font-semibold text-lg">Zones tactiles</h3>
              <p className="mt-2 text-sm text-white/65 leading-6">
                Les boutons et liens respectent une taille minimale de 44×44px pour faciliter
                l&apos;interaction sur écrans tactiles et pour les utilisateurs avec des difficultés motrices.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaMobileScreen className="text-[#5E9FE9] text-2xl" />
              </div>
              <h3 className="font-semibold text-lg">Design responsive</h3>
              <p className="mt-2 text-sm text-white/65 leading-6">
                L&apos;interface s&apos;adapte parfaitement à tous les formats : téléphone, tablette, ordinateur
                portable et écran large, sans perte de fonctionnalité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Amélioration continue */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaArrowsRotate className="text-[#5E9FE9] text-2xl" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Amélioration continue</h2>
              <p className="text-white/70 leading-7">
                L&apos;accessibilité est un processus continu. Nous testons régulièrement notre plateforme avec des
                outils automatisés et des retours utilisateurs. Si vous rencontrez un obstacle d&apos;accessibilité,
                n&apos;hésitez pas à nous le signaler à{' '}
                <a href="mailto:support@lacitec.on.ca" className="text-[#5E9FE9] hover:underline">
                  support@lacitec.on.ca
                </a>
                . Chaque retour nous aide à rendre la plateforme meilleure pour tous.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 md:ml-22">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              <FaCode className="text-[#5E9FE9]" /> Audits WCAG réguliers
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              <FaEye className="text-[#5E9FE9]" /> Tests avec lecteurs d&apos;écran
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              <FaComments className="text-[#5E9FE9]" /> Retours utilisateurs intégrés
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
