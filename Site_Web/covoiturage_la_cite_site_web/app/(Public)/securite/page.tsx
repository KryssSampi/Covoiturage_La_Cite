'use client';

import Image from 'next/image';
import { FaShieldHalved, FaUserCheck, FaTriangleExclamation, FaLock, FaEye, FaFingerprint, FaBell, FaGavel, FaCircleExclamation, FaClipboardList, FaUserShield, FaServer, FaKey, FaMobileScreen } from 'react-icons/fa6';
import { SECURITY_TRANSLATIONS } from '@/core/i18n/public-pages.translations';
import { Language, useAppState } from '@/core/state/app_state';

export default function SecuritePage() {
  const { lang } = useAppState();
  const isFr = lang === Language.FR;
  const tr = SECURITY_TRANSLATIONS;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image src="/img/avantages/securite.png" fill className="object-cover" alt="" priority />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.80)_60%,rgba(255,255,255,0.97)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(8,49,110,0.04),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-36 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#5E9FE9]/10 border border-[#5E9FE9]/20 shadow-md">
            <FaShieldHalved className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {isFr ? tr.secHeroTitleFr : tr.secHeroTitleEn}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-8">
            {isFr ? tr.secHeroSubtitleFr : tr.secHeroSubtitleEn}
          </p>
        </div>
      </section>

      {/* Piliers de s&eacute;curit&eacute; */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaUserCheck className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">{isFr ? tr.secVerifyTitleFr : tr.secVerifyTitleEn}</h2>
            <p className="mt-3 text-gray-600 leading-7">{isFr ? tr.secVerifyDescFr : tr.secVerifyDescEn}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2"><FaFingerprint className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.secVerifyBullet1Fr : tr.secVerifyBullet1En}</li>
              <li className="flex items-center gap-2"><FaEye className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.secVerifyBullet2Fr : tr.secVerifyBullet2En}</li>
              <li className="flex items-center gap-2"><FaUserShield className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.secVerifyBullet3Fr : tr.secVerifyBullet3En}</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaTriangleExclamation className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">{isFr ? tr.secReportTitleFr : tr.secReportTitleEn}</h2>
            <p className="mt-3 text-gray-600 leading-7">{isFr ? tr.secReportDescFr : tr.secReportDescEn}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2"><FaBell className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.secReportBullet1Fr : tr.secReportBullet1En}</li>
              <li className="flex items-center gap-2"><FaGavel className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.secReportBullet2Fr : tr.secReportBullet2En}</li>
              <li className="flex items-center gap-2"><FaClipboardList className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.secReportBullet3Fr : tr.secReportBullet3En}</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaLock className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">{isFr ? tr.secSessionTitleFr : tr.secSessionTitleEn}</h2>
            <p className="mt-3 text-gray-600 leading-7">{isFr ? tr.secSessionDescFr : tr.secSessionDescEn}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2"><FaKey className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.secSessionBullet1Fr : tr.secSessionBullet1En}</li>
              <li className="flex items-center gap-2"><FaServer className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.secSessionBullet2Fr : tr.secSessionBullet2En}</li>
              <li className="flex items-center gap-2"><FaMobileScreen className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.secSessionBullet3Fr : tr.secSessionBullet3En}</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Mesures compl&eacute;mentaires */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <FaEye className="inline mr-2 text-[#5E9FE9]" />
            {isFr ? tr.addMeasuresTitleFr : tr.addMeasuresTitleEn}
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex gap-5 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaCircleExclamation className="text-[#5E9FE9] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{isFr ? tr.emergencyButtonTitleFr : tr.emergencyButtonTitleEn}</h3>
                <p className="mt-2 text-gray-600 leading-7">{isFr ? tr.emergencyButtonDescFr : tr.emergencyButtonDescEn}</p>
              </div>
            </div>
            <div className="flex gap-5 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaUserShield className="text-[#5E9FE9] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{isFr ? tr.ratingTitleFr : tr.ratingTitleEn}</h3>
                <p className="mt-2 text-gray-600 leading-7">{isFr ? tr.ratingDescFr : tr.ratingDescEn}</p>
              </div>
            </div>
            <div className="flex gap-5 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaClipboardList className="text-[#5E9FE9] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{isFr ? tr.historyTitleFr : tr.historyTitleEn}</h3>
                <p className="mt-2 text-gray-600 leading-7">{isFr ? tr.historyDescFr : tr.historyDescEn}</p>
              </div>
            </div>
            <div className="flex gap-5 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaGavel className="text-[#5E9FE9] text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{isFr ? tr.zeroToleranceTitleFr : tr.zeroToleranceTitleEn}</h3>
                <p className="mt-2 text-gray-600 leading-7">{isFr ? tr.zeroToleranceDescFr : tr.zeroToleranceDescEn}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire de signalement */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <form id="signalement-form" className="rounded-2xl border border-gray-200 bg-white p-8 md:p-10 shadow-md" action="mailto:support@lacitec.on.ca" method="post" encType="text/plain">
          <div className="text-center mb-8">
            <FaTriangleExclamation className="mx-auto text-4xl text-[#5E9FE9] mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold">{isFr ? tr.reportFormTitleFr : tr.reportFormTitleEn}</h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">{isFr ? tr.reportFormSubtitleFr : tr.reportFormSubtitleEn}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="incident-type" className="text-sm font-medium text-gray-700">
                <FaCircleExclamation className="inline mr-1.5 text-[#5E9FE9]" />
                {isFr ? tr.reportFormTypeFr : tr.reportFormTypeEn}
              </label>
              <select id="incident-type" name="incidentType" required className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5E9FE9]/50 focus:border-[#5E9FE9] transition-all [&>option]:bg-white [&>option]:text-gray-900">
                <option value="">{isFr ? tr.reportFormTypePlaceholderFr : tr.reportFormTypePlaceholderEn}</option>
                <option value="securite">{isFr ? tr.incidentSecurityFr : tr.incidentSecurityEn}</option>
                <option value="comportement">{isFr ? tr.incidentBehaviorFr : tr.incidentBehaviorEn}</option>
                <option value="harcelement">{isFr ? tr.incidentHarassmentFr : tr.incidentHarassmentEn}</option>
                <option value="technique">{isFr ? tr.incidentTechnicalFr : tr.incidentTechnicalEn}</option>
                <option value="fraude">{isFr ? tr.incidentFraudFr : tr.incidentFraudEn}</option>
                <option value="autre">{isFr ? tr.incidentOtherFr : tr.incidentOtherEn}</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="incident-date" className="text-sm font-medium text-gray-700">
                <FaClipboardList className="inline mr-1.5 text-[#5E9FE9]" />
                {isFr ? tr.reportFormDateFr : tr.reportFormDateEn}
              </label>
              <input id="incident-date" name="incidentDate" type="date" required className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5E9FE9]/50 focus:border-[#5E9FE9] transition-all" />
            </div>
          </div>

          <div className="mt-6 grid gap-2">
            <label htmlFor="incident-details" className="text-sm font-medium text-gray-700">
              <FaClipboardList className="inline mr-1.5 text-[#5E9FE9]" />
              {isFr ? tr.reportFormDetailsFr : tr.reportFormDetailsEn}
            </label>
            <textarea id="incident-details" name="incidentDetails" required rows={6} placeholder={isFr ? tr.reportFormPlaceholderFr : tr.reportFormPlaceholderEn} className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E9FE9]/50 focus:border-[#5E9FE9] transition-all resize-none" />
          </div>

          <div className="mt-8 text-center">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#5E9FE9] px-8 py-3 text-base font-semibold text-white hover:bg-[#4a8fd4] transition-colors shadow-lg shadow-[#5E9FE9]/25">
              <FaShieldHalved /> {isFr ? tr.reportFormSubmitFr : tr.reportFormSubmitEn}
            </button>
            <p className="mt-4 text-xs text-gray-400">{isFr ? tr.reportFormConfidentialFr : tr.reportFormConfidentialEn}</p>
          </div>
        </form>
      </section>
    </main>
  );
}