import { FaShieldHalved, FaUserCheck, FaTriangleExclamation, FaLock, FaEye, FaFingerprint, FaBell, FaGavel, FaCircleExclamation, FaClipboardList, FaUserShield, FaServer, FaKey, FaMobileScreen } from 'react-icons/fa6';

export default function SecuritePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#08316e_0%,#0d3f7e_45%,#0a2a5c_100%)] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(94,159,233,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <FaShieldHalved className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Votre <span className="text-[#5E9FE9]">sécurité</span>, notre priorité
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 leading-8">
            La sécurité des membres est intégrée à chaque aspect de la plateforme. De la vérification
            d&apos;identité à la protection des données, découvrez les mécanismes que nous avons mis en place
            pour garantir des trajets sereins.
          </p>
        </div>
      </section>

      {/* Piliers de sécurité */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaUserCheck className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">Vérification d&apos;identité</h2>
            <p className="mt-3 text-white/75 leading-7">
              Chaque compte est validé via l&apos;identité institutionnelle du Collège La Cité. Les profils
              passent par des contrôles de cohérence rigoureux avant d&apos;être pleinement activés.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><FaFingerprint className="text-[#5E9FE9] shrink-0" /> Vérification du courriel @lacitec.on.ca</li>
              <li className="flex items-center gap-2"><FaEye className="text-[#5E9FE9] shrink-0" /> Contrôle des doublons de compte</li>
              <li className="flex items-center gap-2"><FaUserShield className="text-[#5E9FE9] shrink-0" /> Validation manuelle des cas suspects</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaTriangleExclamation className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">Signalement et modération</h2>
            <p className="mt-3 text-white/75 leading-7">
              Un système de signalement accessible à tout moment. Chaque rapport est examiné par notre
              équipe de modération qui intervient rapidement — de l&apos;avertissement à la suspension.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><FaBell className="text-[#5E9FE9] shrink-0" /> Alertes en temps réel</li>
              <li className="flex items-center gap-2"><FaGavel className="text-[#5E9FE9] shrink-0" /> Processus d&apos;escalade structuré</li>
              <li className="flex items-center gap-2"><FaClipboardList className="text-[#5E9FE9] shrink-0" /> Audit complet des événements</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaLock className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">Protection des sessions</h2>
            <p className="mt-3 text-white/75 leading-7">
              Sessions sécurisées avec tokens chiffrés, détection d&apos;anomalies de connexion et
              déconnexion automatique en cas d&apos;inactivité prolongée.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><FaKey className="text-[#5E9FE9] shrink-0" /> Tokens JWT chiffrés et rotatifs</li>
              <li className="flex items-center gap-2"><FaServer className="text-[#5E9FE9] shrink-0" /> Infrastructure sécurisée</li>
              <li className="flex items-center gap-2"><FaMobileScreen className="text-[#5E9FE9] shrink-0" /> Gestion multi-appareils</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Mesures complémentaires */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-10 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <FaEye className="inline mr-2 text-[#5E9FE9]" />
            Mesures complémentaires
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex gap-5 rounded-xl border border-white/15 bg-white/10 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaCircleExclamation className="text-[#5E9FE9] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Bouton d&apos;urgence en trajet</h3>
                <p className="mt-2 text-white/75 leading-7">
                  Pendant un trajet actif, chaque participant a accès à un bouton d&apos;urgence qui notifie
                  immédiatement l&apos;équipe de support et enregistre les coordonnées GPS du moment.
                </p>
              </div>
            </div>
            <div className="flex gap-5 rounded-xl border border-white/15 bg-white/10 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaUserShield className="text-[#5E9FE9] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Évaluations bidirectionnelles</h3>
                <p className="mt-2 text-white/75 leading-7">
                  Après chaque trajet, conducteurs et passagers s&apos;évaluent mutuellement. Les profils
                  avec des notes faibles sont signalés automatiquement pour examen.
                </p>
              </div>
            </div>
            <div className="flex gap-5 rounded-xl border border-white/15 bg-white/10 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaClipboardList className="text-[#5E9FE9] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Historique complet</h3>
                <p className="mt-2 text-white/75 leading-7">
                  Chaque trajet, réservation et interaction est enregistré. Cet historique est consultable
                  par l&apos;utilisateur et peut servir de preuve en cas de litige.
                </p>
              </div>
            </div>
            <div className="flex gap-5 rounded-xl border border-white/15 bg-white/10 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaGavel className="text-[#5E9FE9] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Politique de tolérance zéro</h3>
                <p className="mt-2 text-white/75 leading-7">
                  Le harcèlement, la discrimination et les comportements dangereux entraînent une suspension
                  immédiate du compte, sans préavis, conformément à nos conditions d&apos;utilisation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire de signalement */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <form
          id="signalement-form"
          className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-8 md:p-10 shadow-xl"
          action="mailto:support@lacitec.on.ca"
          method="post"
          encType="text/plain"
        >
          <div className="text-center mb-8">
            <FaTriangleExclamation className="mx-auto text-4xl text-[#5E9FE9] mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold">Formulaire de signalement</h2>
            <p className="mt-3 text-white/70 max-w-lg mx-auto">
              Si vous êtes témoin ou victime d&apos;un incident, remplissez ce formulaire. Toutes les informations
              sont traitées de manière confidentielle.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="incident-type" className="text-sm font-medium text-white/90">
                <FaCircleExclamation className="inline mr-1.5 text-[#5E9FE9]" />
                Type d&apos;incident
              </label>
              <select
                id="incident-type"
                name="incidentType"
                required
                className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5E9FE9]/50 focus:border-[#5E9FE9] transition-all [&>option]:bg-[#0d3f7e] [&>option]:text-white"
              >
                <option value="">Sélectionner un type</option>
                <option value="securite">Sécurité pendant un trajet</option>
                <option value="comportement">Comportement inapproprié</option>
                <option value="harcelement">Harcèlement ou discrimination</option>
                <option value="technique">Problème technique</option>
                <option value="fraude">Fraude ou usurpation d&apos;identité</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="incident-date" className="text-sm font-medium text-white/90">
                <FaClipboardList className="inline mr-1.5 text-[#5E9FE9]" />
                Date de l&apos;incident
              </label>
              <input
                id="incident-date"
                name="incidentDate"
                type="date"
                required
                className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5E9FE9]/50 focus:border-[#5E9FE9] transition-all scheme-dark"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-2">
            <label htmlFor="incident-details" className="text-sm font-medium text-white/90">
              <FaClipboardList className="inline mr-1.5 text-[#5E9FE9]" />
              Description détaillée
            </label>
            <textarea
              id="incident-details"
              name="incidentDetails"
              required
              rows={6}
              placeholder="Décrivez l'incident en détail : contexte, personnes impliquées, date et heure, lieu..."
              className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#5E9FE9]/50 focus:border-[#5E9FE9] transition-all resize-none"
            />
          </div>

          <div className="mt-8 text-center">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5E9FE9] px-8 py-3 text-base font-semibold text-white hover:bg-[#4a8fd4] transition-colors shadow-lg shadow-[#5E9FE9]/25"
            >
              <FaShieldHalved /> Envoyer le signalement
            </button>
            <p className="mt-4 text-xs text-white/50">
              Toutes les informations sont traitées de manière confidentielle et sécurisée.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
