import { FaScaleBalanced, FaUserCheck, FaHandshake, FaBan, FaTriangleExclamation, FaCircleXmark, FaFileContract, FaCircleCheck, FaShieldHalved, FaGavel, FaClock, FaArrowRight } from 'react-icons/fa6';
import Link from 'next/link';

export default function ConditionsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#08316e_0%,#0d3f7e_45%,#0a2a5c_100%)] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(94,159,233,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <FaScaleBalanced className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Conditions <span className="text-[#5E9FE9]">d&apos;utilisation</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 leading-8">
            En utilisant Covoiturage La Cité, vous acceptez les règles suivantes. Ces conditions visent
            à garantir une expérience sûre, respectueuse et équitable pour toute la communauté.
          </p>
        </div>
      </section>

      {/* Règles principales */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="space-y-6">
          {/* Règle 1 */}
          <article className="flex gap-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">
                1
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaUserCheck className="text-[#5E9FE9] text-xl" />
                <h2 className="text-xl font-semibold">Compte personnel et informations exactes</h2>
              </div>
              <p className="text-white/75 leading-7">
                Chaque utilisateur doit créer un compte personnel unique avec des informations véridiques
                et à jour. L&apos;utilisation d&apos;un faux profil, d&apos;une identité empruntée ou la création
                de comptes multiples est strictement interdite. Votre courriel institutionnel sert
                de vérification principale.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  <FaCircleCheck className="text-[#5E9FE9]" /> Un seul compte par personne
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  <FaCircleCheck className="text-[#5E9FE9]" /> Informations vérifiables
                </span>
              </div>
            </div>
          </article>

          {/* Règle 2 */}
          <article className="flex gap-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">
                2
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaHandshake className="text-[#5E9FE9] text-xl" />
                <h2 className="text-xl font-semibold">Respect des engagements et des autres membres</h2>
              </div>
              <p className="text-white/75 leading-7">
                Lorsque vous réservez ou proposez un trajet, vous vous engagez à respecter l&apos;horaire convenu,
                le point de rencontre et les conditions du voyage. Les annulations tardives répétées, le
                non-respect des passagers ou conducteurs, ou tout comportement irrespectueux peut entraîner
                des sanctions.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  <FaClock className="text-[#5E9FE9]" /> Ponctualité requise
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  <FaHandshake className="text-[#5E9FE9]" /> Courtoisie obligatoire
                </span>
              </div>
            </div>
          </article>

          {/* Règle 3 */}
          <article className="flex gap-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">
                3
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaBan className="text-[#5E9FE9] text-xl" />
                <h2 className="text-xl font-semibold">Contenu interdit</h2>
              </div>
              <p className="text-white/75 leading-7">
                Il est interdit de publier du contenu abusif, trompeur, offensant, discriminatoire ou dangereux
                sur la plateforme. Cela inclut les messages, les descriptions de trajet, les commentaires
                d&apos;évaluation et toute autre interaction. Tout contenu signalé est examiné et retiré
                si jugé non conforme.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-300">
                  <FaCircleXmark /> Pas de spam
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-300">
                  <FaCircleXmark /> Pas de discrimination
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-300">
                  <FaCircleXmark /> Pas de contenu trompeur
                </span>
              </div>
            </div>
          </article>

          {/* Règle 4 */}
          <article className="flex gap-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">
                4
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaTriangleExclamation className="text-[#5E9FE9] text-xl" />
                <h2 className="text-xl font-semibold">Obligation de signalement</h2>
              </div>
              <p className="text-white/75 leading-7">
                Tout incident de sécurité, comportement inapproprié ou situation dangereuse doit être signalé
                rapidement via le formulaire de signalement. Le silence face à un comportement problématique
                met en danger l&apos;ensemble de la communauté. En cas de danger immédiat, contactez le 911 en premier.
              </p>
              <div className="mt-3">
                <Link href="/securite#signalement-form" className="inline-flex items-center gap-2 text-[#5E9FE9] hover:text-[#7db8f0] transition-colors text-sm font-medium">
                  Accéder au formulaire de signalement <FaArrowRight className="text-xs" />
                </Link>
              </div>
            </div>
          </article>

          {/* Règle 5 */}
          <article className="flex gap-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">
                5
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaGavel className="text-[#5E9FE9] text-xl" />
                <h2 className="text-xl font-semibold">Sanctions et suspension</h2>
              </div>
              <p className="text-white/75 leading-7">
                Le non-respect de ces conditions peut entraîner des mesures allant de l&apos;avertissement
                à la suspension temporaire ou permanente du compte. Les décisions de modération sont
                prises en accord avec les politiques institutionnelles du Collège La Cité et sont
                communiquées par courriel.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  <FaShieldHalved className="text-[#5E9FE9]" /> Processus équitable
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  <FaFileContract className="text-[#5E9FE9]" /> Notification par courriel
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Note légale */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-xl text-center">
          <FaFileContract className="mx-auto text-3xl text-[#5E9FE9] mb-4" />
          <p className="text-white/60 text-sm leading-6 max-w-2xl mx-auto">
            Ce résumé présente les règles de base d&apos;utilisation de la plateforme Covoiturage La Cité.
            Il ne remplace pas le texte contractuel complet de l&apos;institution. Pour toute question
            relative aux conditions d&apos;utilisation, contactez-nous à{' '}
            <a href="mailto:support@lacitec.on.ca" className="text-[#5E9FE9] hover:underline">
              support@lacitec.on.ca
            </a>.
          </p>
        </div>
      </section>
    </main>
  );
}
