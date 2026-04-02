import { FaUserPlus, FaMagnifyingGlass, FaHandshake, FaRoute, FaStar, FaRocket, FaArrowRight, FaCircle, FaMobileScreen, FaBell, FaMapLocationDot, FaCreditCard, FaComments } from 'react-icons/fa6';

export default function CommentCaMarchePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#08316e_0%,#0d3f7e_45%,#0a2a5c_100%)] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(94,159,233,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <FaRocket className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Comment <span className="text-[#5E9FE9]">ça marche</span> ?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 leading-8">
            Un parcours simple et intuitif en 5 étapes pour covoiturer en toute sérénité.
            De l&apos;inscription à l&apos;évaluation, chaque étape est pensée pour être rapide et transparente.
          </p>
        </div>
      </section>

      {/* Étapes */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="relative">
          {/* Ligne verticale de connexion */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-[#5E9FE9]/50 via-[#5E9FE9]/20 to-transparent hidden md:block" />

          {/* Étape 1 */}
          <div className="relative flex flex-col md:flex-row gap-6 mb-10">
            <div className="shrink-0 z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">
                1
              </div>
            </div>
            <article className="flex-1 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <FaUserPlus className="text-[#5E9FE9] text-2xl" />
                <h2 className="text-xl font-semibold">Créez votre compte</h2>
              </div>
              <p className="text-white/75 leading-7">
                Inscrivez-vous avec votre identité institutionnelle du Collège La Cité. Complétez votre profil
                en ajoutant votre photo, votre programme d&apos;études et vos préférences de trajet. La vérification
                de votre courriel institutionnel garantit un environnement de confiance dès le premier jour.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <FaCircle className="text-[3px] text-[#5E9FE9]" /> Inscription en 2 minutes
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <FaCircle className="text-[3px] text-[#5E9FE9]" /> Courriel @lacitec.on.ca
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <FaCircle className="text-[3px] text-[#5E9FE9]" /> Profil personnalisable
                </span>
              </div>
            </article>
          </div>

          {/* Étape 2 */}
          <div className="relative flex flex-col md:flex-row gap-6 mb-10">
            <div className="shrink-0 z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">
                2
              </div>
            </div>
            <article className="flex-1 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <FaMagnifyingGlass className="text-[#5E9FE9] text-2xl" />
                <h2 className="text-xl font-semibold">Recherchez ou proposez un trajet</h2>
              </div>
              <p className="text-white/75 leading-7">
                Utilisez notre carte interactive pour trouver un trajet qui correspond à votre itinéraire.
                Vous êtes conducteur ? Publiez votre trajet en quelques clics en précisant le départ,
                la destination, l&apos;horaire et le nombre de places disponibles. Les passagers verront votre
                offre instantanément.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <FaMapLocationDot className="text-[#5E9FE9] text-xs" /> Carte interactive
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <FaBell className="text-[#5E9FE9] text-xs" /> Alertes de disponibilité
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <FaMobileScreen className="text-[#5E9FE9] text-xs" /> Compatible mobile
                </span>
              </div>
            </article>
          </div>

          {/* Étape 3 */}
          <div className="relative flex flex-col md:flex-row gap-6 mb-10">
            <div className="shrink-0 z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">
                3
              </div>
            </div>
            <article className="flex-1 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <FaHandshake className="text-[#5E9FE9] text-2xl" />
                <h2 className="text-xl font-semibold">Confirmez la réservation</h2>
              </div>
              <p className="text-white/75 leading-7">
                Le conducteur reçoit votre demande et peut l&apos;accepter ou la refuser. Une fois confirmé,
                vous recevez tous les deux une notification avec les détails du trajet : point de rencontre,
                heure exacte, informations du véhicule et contribution suggérée. Tout est clair avant de partir.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <FaCreditCard className="text-[#5E9FE9] text-xs" /> Tarif transparent
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <FaBell className="text-[#5E9FE9] text-xs" /> Notification instantanée
                </span>
              </div>
            </article>
          </div>

          {/* Étape 4 */}
          <div className="relative flex flex-col md:flex-row gap-6 mb-10">
            <div className="shrink-0 z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">
                4
              </div>
            </div>
            <article className="flex-1 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <FaRoute className="text-[#5E9FE9] text-2xl" />
                <h2 className="text-xl font-semibold">Voyagez et suivez le trajet</h2>
              </div>
              <p className="text-white/75 leading-7">
                Pendant le trajet, suivez votre progression sur la carte en temps réel. Le système de suivi GPS
                permet au passager de voir l&apos;arrivée estimée et au conducteur de signaler les étapes clés.
                En cas de problème, un bouton d&apos;urgence est accessible à tout moment.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <FaMapLocationDot className="text-[#5E9FE9] text-xs" /> Suivi GPS en direct
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <FaComments className="text-[#5E9FE9] text-xs" /> Chat intégré
                </span>
              </div>
            </article>
          </div>

          {/* Étape 5 */}
          <div className="relative flex flex-col md:flex-row gap-6">
            <div className="shrink-0 z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">
                5
              </div>
            </div>
            <article className="flex-1 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <FaStar className="text-[#5E9FE9] text-2xl" />
                <h2 className="text-xl font-semibold">Évaluez l&apos;expérience</h2>
              </div>
              <p className="text-white/75 leading-7">
                À la fin du trajet, notez votre expérience et laissez un commentaire. Ce système d&apos;évaluation
                bidirectionnel renforce la confiance au sein de la communauté : les bons conducteurs et passagers
                sont mis en valeur, tandis que les comportements problématiques sont rapidement identifiés.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <FaStar className="text-[#5E9FE9] text-xs" /> Note sur 5 étoiles
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <FaComments className="text-[#5E9FE9] text-xs" /> Commentaires détaillés
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-10 shadow-xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            Rejoignez la communauté Covoiturage La Cité et commencez à partager vos trajets dès aujourd&apos;hui.
            L&apos;inscription est gratuite et ne prend que 2 minutes.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5E9FE9] px-8 py-3 text-base font-semibold text-white hover:bg-[#4a8fd4] transition-colors shadow-lg shadow-[#5E9FE9]/25"
          >
            Créer mon compte <FaArrowRight />
          </a>
        </div>
      </section>
    </main>
  );
}
