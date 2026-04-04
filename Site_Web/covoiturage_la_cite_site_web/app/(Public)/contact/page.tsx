import Image from 'next/image';
import Link from "next/link";
import { FaEnvelope, FaClock, FaTriangleExclamation, FaHeadset, FaLocationDot, FaPhone, FaArrowRight, FaGraduationCap, FaComments, FaCircleInfo, FaShieldHalved, FaCircleQuestion } from 'react-icons/fa6';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image src="/img/passenger-hero.png" fill className="object-cover" alt="" priority />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.80)_60%,rgba(255,255,255,0.97)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(8,49,110,0.04),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-36 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#5E9FE9]/10 border border-[#5E9FE9]/20 shadow-md">
            <FaHeadset className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-[#5E9FE9]">Contactez</span>-nous
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-8">
            Besoin d&apos;aide, une question, ou un incident à signaler ? Notre équipe est là pour vous
            accompagner. Retrouvez ci-dessous tous les moyens de nous joindre.
          </p>
        </div>
      </section>

      {/* Canaux de contact */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaEnvelope className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">Support par courriel</h2>
            <p className="mt-3 text-gray-600 leading-7">
              Pour les questions générales, les demandes d&apos;information ou l&apos;assistance technique,
              envoyez-nous un courriel. Nous répondons dans un délai de 24 à 48 heures ouvrables.
            </p>
            <a href="mailto:support@lacitec.on.ca" className="mt-4 inline-flex items-center gap-2 text-[#5E9FE9] hover:text-[#7db8f0] transition-colors text-sm font-medium">
              support@lacitec.on.ca <FaArrowRight className="text-xs" />
            </a>
          </article>

          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaClock className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">Horaires de réponse</h2>
            <p className="mt-3 text-gray-600 leading-7">
              Notre équipe de support est disponible du lundi au vendredi, de 8h00 à 17h00 (heure d&apos;Ottawa, EST).
              Les messages reçus en dehors de ces heures seront traités le jour ouvrable suivant.
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <p className="flex items-center gap-2"><FaCircleInfo className="text-[#5E9FE9]" /> Lun — Ven : 8h00 – 17h00</p>
              <p className="flex items-center gap-2"><FaCircleInfo className="text-[#5E9FE9]" /> Sam — Dim : Fermé</p>
            </div>
          </article>

          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <FaTriangleExclamation className="text-red-600 text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">Urgence sécurité</h2>
            <p className="mt-3 text-gray-600 leading-7">
              En cas de risque immédiat pour votre sécurité, contactez d&apos;abord les services d&apos;urgence (911).
              Ensuite, soumettez un signalement sur la plateforme pour que notre équipe puisse agir.
            </p>
            <Link href="/securite#signalement-form" className="mt-4 inline-flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors text-sm font-medium">
              Formulaire de signalement <FaArrowRight className="text-xs" />
            </Link>
          </article>
        </div>
      </section>

      {/* Informations complémentaires */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <FaComments className="inline mr-2 text-[#5E9FE9]" />
            Autres points de contact
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-5 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaLocationDot className="text-[#5E9FE9] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Adresse du campus</h3>
                <p className="mt-2 text-gray-600 leading-7">
                  Collège La Cité<br />
                  801, promenade de l&apos;Aviation<br />
                  Ottawa, ON K1K 4R3
                </p>
              </div>
            </div>
            <div className="flex gap-5 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaPhone className="text-[#5E9FE9] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ligne téléphonique</h3>
                <p className="mt-2 text-gray-600 leading-7">
                  Pour les questions liées au Collège La Cité :<br />
                  <span className="text-[#5E9FE9]">613-742-2483</span><br />
                  <span className="text-sm text-gray-500">Renvoi vers le service de covoiturage disponible</span>
                </p>
              </div>
            </div>
            <div className="flex gap-5 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaGraduationCap className="text-[#5E9FE9] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Services étudiants</h3>
                <p className="mt-2 text-gray-600 leading-7">
                  Les services aux étudiants du Collège La Cité peuvent également vous orienter pour toute
                  question relative au covoiturage et au transport sur le campus.
                </p>
              </div>
            </div>
            <div className="flex gap-5 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaCircleQuestion className="text-[#5E9FE9] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">FAQ et aide</h3>
                <p className="mt-2 text-gray-600 leading-7">
                  Avant de nous écrire, consultez notre section d&apos;aide intégrée à l&apos;application.
                  La plupart des questions courantes y trouvent une réponse rapide et détaillée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Signalement */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 shadow-xl text-center">
          <FaShieldHalved className="mx-auto text-4xl text-[#5E9FE9] mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Signaler un problème</h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Le formulaire de signalement est centralisé sur la page sécurité pour assurer un traitement
            uniforme et rapide de tous les incidents.
          </p>
          <Link
            href="/securite#signalement-form"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5E9FE9] px-8 py-3 text-base font-semibold text-white hover:bg-[#4a8fd4] transition-colors shadow-lg shadow-[#5E9FE9]/25"
          >
            Ouvrir le formulaire <FaArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}
