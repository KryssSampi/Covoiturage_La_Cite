import { FaGraduationCap, FaHandshake, FaLeaf, FaShieldHalved, FaUserCheck, FaTriangleExclamation, FaLock, FaRoad, FaCar, FaUsers, FaChartLine, FaHeart, FaStar, FaGlobe, FaLightbulb, FaCircleCheck } from 'react-icons/fa6';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#08316e_0%,#0d3f7e_45%,#0a2a5c_100%)] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(94,159,233,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <FaGraduationCap className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            À propos de <span className="text-[#5E9FE9]">Covoiturage La Cité</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 leading-8">
            Née au cœur du Collège La Cité à Ottawa, notre plateforme réunit étudiants, enseignants et personnel
            autour d&apos;une idée simple : partager la route pour économiser, se connecter et protéger
            l&apos;environnement. Chaque trajet partagé est un pas vers une communauté plus soudée.
          </p>
        </div>
      </section>

      {/* Notre mission */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          <FaLightbulb className="inline mr-2 text-[#5E9FE9]" />
          Nos piliers fondateurs
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaRoad className="text-[#5E9FE9] text-2xl" />
            </div>
            <h3 className="text-xl font-semibold">Mission</h3>
            <p className="mt-3 text-white/75 leading-7">
              Faciliter les déplacements quotidiens entre le campus, les résidences et les quartiers avoisinants.
              Nous proposons un service fiable, institutionnel et conçu sur mesure pour la réalité des étudiants
              — horaires variables, budgets serrés, besoins de flexibilité.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> Trajets adaptés aux horaires de cours</li>
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> Intégration avec l&apos;identité institutionnelle</li>
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> Application web et mobile disponibles</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaUsers className="text-[#5E9FE9] text-2xl" />
            </div>
            <h3 className="text-xl font-semibold">Communauté</h3>
            <p className="mt-3 text-white/75 leading-7">
              Plus qu&apos;un simple outil de transport, Covoiturage La Cité crée des liens. Conducteurs et passagers
              partagent le même campus, les mêmes objectifs, et développent un réseau de confiance qui dépasse
              le simple trajet.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> Profils vérifiés de la communauté La Cité</li>
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> Système d&apos;évaluations et de réputation</li>
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> Groupes de covoiturage récurrents</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaLeaf className="text-[#5E9FE9] text-2xl" />
            </div>
            <h3 className="text-xl font-semibold">Impact environnemental</h3>
            <p className="mt-3 text-white/75 leading-7">
              Chaque place partagée réduit les émissions de CO₂, diminue le trafic routier et libère
              des places de stationnement. Ensemble, nous contribuons à un campus plus vert et une ville
              plus respirable.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> Réduction de l&apos;empreinte carbone collective</li>
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> Moins de véhicules sur le campus</li>
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> Statistiques d&apos;impact visibles dans le tableau de bord</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-10 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <FaChartLine className="inline mr-2 text-[#5E9FE9]" />
            La plateforme en chiffres
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-[#5E9FE9]">500+</div>
              <p className="mt-2 text-sm text-white/70">Membres inscrits</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#5E9FE9]">1 200+</div>
              <p className="mt-2 text-sm text-white/70">Trajets complétés</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#5E9FE9]">8 500 kg</div>
              <p className="mt-2 text-sm text-white/70">CO₂ économisé</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#5E9FE9]">4.8 / 5</div>
              <p className="mt-2 text-sm text-white/70">Note moyenne</p>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          <FaHeart className="inline mr-2 text-[#5E9FE9]" />
          Nos valeurs
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex gap-5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaHandshake className="text-[#5E9FE9] text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Confiance et transparence</h3>
              <p className="mt-2 text-white/75 leading-7">
                Chaque interaction repose sur des profils vérifiés, des évaluations honnêtes et une communication
                claire. Pas de mauvaises surprises — vous savez toujours avec qui vous voyagez.
              </p>
            </div>
          </div>
          <div className="flex gap-5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaStar className="text-[#5E9FE9] text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Excellence du service</h3>
              <p className="mt-2 text-white/75 leading-7">
                Interface intuitive, notifications en temps réel, suivi de trajet et support réactif.
                Nous investissons continuellement pour offrir la meilleure expérience possible.
              </p>
            </div>
          </div>
          <div className="flex gap-5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaGlobe className="text-[#5E9FE9] text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Responsabilité sociale</h3>
              <p className="mt-2 text-white/75 leading-7">
                Contribuer à la mobilité durable n&apos;est pas qu&apos;un slogan. C&apos;est un engagement concret
                qui se traduit par moins de pollution, moins de congestion et plus de solidarité sur le campus.
              </p>
            </div>
          </div>
          <div className="flex gap-5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaCar className="text-[#5E9FE9] text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Accessibilité pour tous</h3>
              <p className="mt-2 text-white/75 leading-7">
                Que vous soyez conducteur ou passager, notre plateforme est pensée pour être simple, abordable
                et accessible. Des tarifs suggérés équitables et une interface adaptée à tous les appareils.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sécurité et confiance */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-10 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            <FaShieldHalved className="inline mr-2 text-[#5E9FE9]" />
            Sécurité et confiance
          </h2>
          <p className="text-center text-white/70 mb-10 max-w-2xl mx-auto">
            La sécurité de nos membres est au cœur de chaque décision de conception. Voici les mécanismes
            que nous avons mis en place pour garantir des trajets sereins.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <article className="rounded-xl border border-white/15 bg-white/10 p-6 hover:bg-white/15 transition-all duration-300">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaUserCheck className="text-[#5E9FE9] text-xl" />
              </div>
              <h3 className="font-semibold text-lg">Vérification d&apos;identité</h3>
              <p className="mt-3 text-sm text-white/70 leading-6">
                Chaque compte est validé via l&apos;identité institutionnelle du Collège La Cité. Les profils
                passent par des contrôles de cohérence avant d&apos;être activés, incluant la vérification
                du courriel institutionnel et des informations personnelles.
              </p>
            </article>
            <article className="rounded-xl border border-white/15 bg-white/10 p-6 hover:bg-white/15 transition-all duration-300">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaTriangleExclamation className="text-[#5E9FE9] text-xl" />
              </div>
              <h3 className="font-semibold text-lg">Signalement et modération</h3>
              <p className="mt-3 text-sm text-white/70 leading-6">
                Un système de signalement accessible à tout moment permet de rapporter les comportements
                inappropriés. Notre équipe de modération examine chaque cas et intervient rapidement —
                de l&apos;avertissement à la suspension du compte.
              </p>
            </article>
            <article className="rounded-xl border border-white/15 bg-white/10 p-6 hover:bg-white/15 transition-all duration-300">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaLock className="text-[#5E9FE9] text-xl" />
              </div>
              <h3 className="font-semibold text-lg">Protection des sessions</h3>
              <p className="mt-3 text-sm text-white/70 leading-6">
                Sessions sécurisées avec tokens chiffrés, détection d&apos;anomalies de connexion et
                déconnexion automatique en cas d&apos;inactivité prolongée. Vos données restent protégées
                à chaque instant.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
