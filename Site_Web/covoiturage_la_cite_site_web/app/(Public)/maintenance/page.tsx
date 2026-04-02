import { FaWrench, FaGears, FaRotate, FaBolt, FaServer, FaShieldHalved, FaArrowsRotate } from 'react-icons/fa6';
import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#08316e_0%,#0d3f7e_45%,#0a2a5c_100%)] text-white flex items-center justify-center px-6 py-14" lang="fr">
      <div className="w-full max-w-2xl">
        {/* Icône animée */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
            <FaWrench className="text-[#5E9FE9] text-4xl animate-pulse" />
          </div>
        </div>

        {/* Carte principale */}
        <section className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm shadow-xl p-8 md:p-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Nous effectuons des <span className="text-[#5E9FE9]">améliorations</span>
          </h1>
          <p className="mt-4 text-white/80 leading-7 max-w-lg mx-auto">
            La plateforme Covoiturage La Cité est temporairement en maintenance pour intégrer de nouvelles
            fonctionnalités et renforcer la performance du service. Nous serons de retour très bientôt.
          </p>

          {/* Indicateurs */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <FaGears className="mx-auto text-2xl text-[#5E9FE9] mb-2" />
              <p className="text-xs text-white/60">Mise à jour</p>
              <p className="text-sm font-semibold text-white/90">En cours</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <FaServer className="mx-auto text-2xl text-[#5E9FE9] mb-2" />
              <p className="text-xs text-white/60">Serveurs</p>
              <p className="text-sm font-semibold text-white/90">Optimisation</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <FaShieldHalved className="mx-auto text-2xl text-[#5E9FE9] mb-2" />
              <p className="text-xs text-white/60">Sécurité</p>
              <p className="text-sm font-semibold text-white/90">Renforcée</p>
            </div>
          </div>

          {/* Détails */}
          <div className="mt-8 rounded-xl border border-white/15 bg-white/5 p-6 text-left">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FaBolt className="text-[#5E9FE9]" />
              Ce que nous améliorons
            </h2>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <FaArrowsRotate className="text-[#5E9FE9] mt-0.5 shrink-0" />
                <span>Optimisation des performances du système de recherche de trajets</span>
              </li>
              <li className="flex items-start gap-3">
                <FaRotate className="text-[#5E9FE9] mt-0.5 shrink-0" />
                <span>Mise à jour des protocoles de sécurité et d&apos;authentification</span>
              </li>
              <li className="flex items-start gap-3">
                <FaGears className="text-[#5E9FE9] mt-0.5 shrink-0" />
                <span>Amélioration de la stabilité du suivi GPS en temps réel</span>
              </li>
              <li className="flex items-start gap-3">
                <FaServer className="text-[#5E9FE9] mt-0.5 shrink-0" />
                <span>Migration de l&apos;infrastructure pour une meilleure disponibilité</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-[#5E9FE9] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4a8fd4] transition-colors shadow-lg shadow-[#5E9FE9]/25"
            >
              Réessayer l&apos;accueil
            </Link>
            <a
              href="mailto:support@lacitec.on.ca"
              className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Contacter le support
            </a>
          </div>

          <p className="mt-6 text-xs text-white/40">
            Merci pour votre patience. La communauté Covoiturage La Cité revient encore plus forte.
          </p>
        </section>
      </div>
    </main>
  );
}
