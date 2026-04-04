import Image from 'next/image';
import { FaWrench, FaGears, FaRotate, FaBolt, FaServer, FaShieldHalved, FaArrowsRotate } from 'react-icons/fa6';
import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen relative overflow-hidden text-white flex items-center justify-center px-6 py-14" lang="fr">
      <Image src="/img/nouveautes-section-background.png" fill className="object-cover" alt="" priority />
      <div className="absolute inset-0 bg-[#08316E]/85" />
      <div className="relative z-10 w-full max-w-2xl">
        {/* Icône animée */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#5E9FE9]/10 border border-[#5E9FE9]/20 shadow-md">
            <FaWrench className="text-[#5E9FE9] text-4xl animate-pulse" />
          </div>
        </div>

        {/* Carte principale */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-md p-8 md:p-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Nous effectuons des <span className="text-[#5E9FE9]">améliorations</span>
          </h1>
          <p className="mt-4 text-gray-600 leading-7 max-w-lg mx-auto">
            La plateforme Covoiturage La Cité est temporairement en maintenance pour intégrer de nouvelles
            fonctionnalités et renforcer la performance du service. Nous serons de retour très bientôt.
          </p>

          {/* Indicateurs */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <FaGears className="mx-auto text-2xl text-[#5E9FE9] mb-2" />
              <p className="text-xs text-gray-500">Mise à jour</p>
              <p className="text-sm font-semibold text-gray-800">En cours</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <FaServer className="mx-auto text-2xl text-[#5E9FE9] mb-2" />
              <p className="text-xs text-gray-500">Serveurs</p>
              <p className="text-sm font-semibold text-gray-800">Optimisation</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <FaShieldHalved className="mx-auto text-2xl text-[#5E9FE9] mb-2" />
              <p className="text-xs text-gray-500">Sécurité</p>
              <p className="text-sm font-semibold text-gray-800">Renforcée</p>
            </div>
          </div>

          {/* Détails */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6 text-left">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FaBolt className="text-[#5E9FE9]" />
              Ce que nous améliorons
            </h2>
            <ul className="space-y-3 text-sm text-gray-500">
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
              className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Contacter le support
            </a>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Merci pour votre patience. La communauté Covoiturage La Cité revient encore plus forte.
          </p>
        </section>
      </div>
    </main>
  );
}
