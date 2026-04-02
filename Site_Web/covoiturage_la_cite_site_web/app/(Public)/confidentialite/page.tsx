import { FaLock, FaDatabase, FaChartPie, FaClock, FaUserShield, FaServer, FaFingerprint, FaEye, FaShieldHalved, FaCircleCheck, FaEnvelope, FaFileLines, FaTrashCan, FaPenToSquare } from 'react-icons/fa6';

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#08316e_0%,#0d3f7e_45%,#0a2a5c_100%)] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(94,159,233,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <FaLock className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Politique de <span className="text-[#5E9FE9]">confidentialité</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 leading-8">
            Nous prenons la protection de vos données personnelles très au sérieux. Cette page résume
            nos principes de traitement des données selon une approche claire, inspirée des exigences
            de la loi PIPEDA et des meilleures pratiques en matière de vie privée.
          </p>
        </div>
      </section>

      {/* Principes clés */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Données collectées */}
          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaDatabase className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">Données collectées</h2>
            <p className="mt-3 text-white/75 leading-7">
              Nous collectons uniquement les données nécessaires au fonctionnement du service de covoiturage.
              Aucune donnée superflue n&apos;est demandée ou stockée.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Informations de compte (nom, courriel, programme)</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Préférences de trajet et réservations</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Traces d&apos;activité techniques (logs de sécurité)</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Données de géolocalisation (pendant les trajets uniquement)</li>
            </ul>
          </article>

          {/* Usage des données */}
          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaChartPie className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">Usage des données</h2>
            <p className="mt-3 text-white/75 leading-7">
              Vos données sont utilisées exclusivement pour le bon fonctionnement de la plateforme.
              Nous ne vendons jamais vos données à des tiers et ne les partageons qu&apos;avec votre consentement.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Opération et amélioration du service</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Sécurité et prévention des fraudes</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Statistiques produit anonymisées</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> Support utilisateur personnalisé</li>
            </ul>
          </article>

          {/* Conservation */}
          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaClock className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">Conservation des données</h2>
            <p className="mt-3 text-white/75 leading-7">
              Les durées de rétention sont adaptées à la finalité de chaque type de donnée et respectent
              les obligations institutionnelles et réglementaires.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><FaClock className="text-[#5E9FE9] shrink-0" /> Données de compte : durée de l&apos;inscription + 1 an</li>
              <li className="flex items-center gap-2"><FaClock className="text-[#5E9FE9] shrink-0" /> Historique des trajets : 2 ans</li>
              <li className="flex items-center gap-2"><FaClock className="text-[#5E9FE9] shrink-0" /> Logs de sécurité : 6 mois</li>
              <li className="flex items-center gap-2"><FaClock className="text-[#5E9FE9] shrink-0" /> Données GPS : supprimées après le trajet</li>
            </ul>
          </article>

          {/* Vos droits */}
          <article className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-7 shadow-xl hover:bg-white/15 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/20">
              <FaUserShield className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">Vos droits</h2>
            <p className="mt-3 text-white/75 leading-7">
              Conformément à la loi PIPEDA et aux politiques du Collège La Cité, vous disposez de droits
              clairs sur vos données personnelles.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><FaEye className="text-[#5E9FE9] shrink-0" /> Droit d&apos;accès à vos données</li>
              <li className="flex items-center gap-2"><FaPenToSquare className="text-[#5E9FE9] shrink-0" /> Droit de rectification</li>
              <li className="flex items-center gap-2"><FaTrashCan className="text-[#5E9FE9] shrink-0" /> Droit de suppression</li>
              <li className="flex items-center gap-2"><FaFileLines className="text-[#5E9FE9] shrink-0" /> Droit de portabilité des données</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Mesures techniques */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-10 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <FaShieldHalved className="inline mr-2 text-[#5E9FE9]" />
            Mesures techniques de protection
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaFingerprint className="text-[#5E9FE9] text-2xl" />
              </div>
              <h3 className="font-semibold text-lg">Chiffrement</h3>
              <p className="mt-2 text-sm text-white/65 leading-6">
                Toutes les communications sont chiffrées via HTTPS/TLS. Les mots de passe sont hashés
                avec des algorithmes robustes (bcrypt). Les tokens d&apos;authentification sont signés et rotatifs.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaServer className="text-[#5E9FE9] text-2xl" />
              </div>
              <h3 className="font-semibold text-lg">Infrastructure sécurisée</h3>
              <p className="mt-2 text-sm text-white/65 leading-6">
                Nos serveurs sont hébergés dans des centres de données certifiés avec surveillance 24/7,
                sauvegardes automatiques et plans de reprise après sinistre.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/20">
                <FaEye className="text-[#5E9FE9] text-2xl" />
              </div>
              <h3 className="font-semibold text-lg">Surveillance continue</h3>
              <p className="mt-2 text-sm text-white/65 leading-6">
                Détection d&apos;anomalies en temps réel, alertes de sécurité automatisées et audits
                réguliers pour identifier et corriger les vulnérabilités potentielles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8 shadow-xl text-center">
          <FaEnvelope className="mx-auto text-3xl text-[#5E9FE9] mb-4" />
          <h2 className="text-xl font-bold mb-3">Exercer vos droits</h2>
          <p className="text-white/60 text-sm leading-6 max-w-xl mx-auto">
            Pour toute demande relative à vos données personnelles (accès, rectification, suppression),
            envoyez un courriel à{' '}
            <a href="mailto:support@lacitec.on.ca" className="text-[#5E9FE9] hover:underline">
              support@lacitec.on.ca
            </a>
            . Nous nous engageons à traiter votre demande dans un délai de 30 jours.
          </p>
        </div>
      </section>
    </main>
  );
}
