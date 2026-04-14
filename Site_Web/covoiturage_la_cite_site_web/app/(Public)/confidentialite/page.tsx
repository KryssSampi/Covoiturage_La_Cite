'use client';

import Image from 'next/image';
import { FaLock, FaDatabase, FaChartPie, FaClock, FaUserShield, FaServer, FaFingerprint, FaEye, FaShieldHalved, FaCircleCheck, FaEnvelope, FaFileLines, FaTrashCan, FaPenToSquare } from 'react-icons/fa6';
import { PRIVACY_TRANSLATIONS } from '@/core/i18n/public-pages.translations';
import { Language, useAppState } from '@/core/state/app_state';

export default function ConfidentialitePage() {
  const { lang } = useAppState();
  const isFr = lang === Language.FR;
  const tr = PRIVACY_TRANSLATIONS;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image src="/img/planifier-background.png" fill className="object-cover" alt="" priority />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.80)_60%,rgba(255,255,255,0.97)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(8,49,110,0.04),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-36 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#5E9FE9]/10 border border-[#5E9FE9]/20 shadow-md">
            <FaLock className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {isFr ? tr.privHeroTitleFr : tr.privHeroTitleEn}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-8">
            {isFr ? tr.privHeroSubtitleFr : tr.privHeroSubtitleEn}
          </p>
        </div>
      </section>

      {/* Principes cl&eacute;s */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Donn&eacute;es collect&eacute;es */}
          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaDatabase className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">{isFr ? tr.dataCollectedTitleFr : tr.dataCollectedTitleEn}</h2>
            <p className="mt-3 text-gray-600 leading-7">{isFr ? tr.dataCollectedDescFr : tr.dataCollectedDescEn}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.dataCollectedBullet1Fr : tr.dataCollectedBullet1En}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.dataCollectedBullet2Fr : tr.dataCollectedBullet2En}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.dataCollectedBullet3Fr : tr.dataCollectedBullet3En}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.dataCollectedBullet4Fr : tr.dataCollectedBullet4En}</li>
            </ul>
          </article>

          {/* Usage des donn&eacute;es */}
          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaChartPie className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">{isFr ? tr.dataUsageTitleFr : tr.dataUsageTitleEn}</h2>
            <p className="mt-3 text-gray-600 leading-7">{isFr ? tr.dataUsageDescFr : tr.dataUsageDescEn}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.dataUsageBullet1Fr : tr.dataUsageBullet1En}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.dataUsageBullet2Fr : tr.dataUsageBullet2En}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.dataUsageBullet3Fr : tr.dataUsageBullet3En}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.dataUsageBullet4Fr : tr.dataUsageBullet4En}</li>
            </ul>
          </article>

          {/* Conservation */}
          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaClock className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">{isFr ? tr.retentionTitleFr : tr.retentionTitleEn}</h2>
            <p className="mt-3 text-gray-600 leading-7">{isFr ? tr.retentionDescFr : tr.retentionDescEn}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2"><FaClock className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.retentionBullet1Fr : tr.retentionBullet1En}</li>
              <li className="flex items-center gap-2"><FaClock className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.retentionBullet2Fr : tr.retentionBullet2En}</li>
              <li className="flex items-center gap-2"><FaClock className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.retentionBullet3Fr : tr.retentionBullet3En}</li>
              <li className="flex items-center gap-2"><FaClock className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.retentionBullet4Fr : tr.retentionBullet4En}</li>
            </ul>
          </article>

          {/* Vos droits */}
          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaUserShield className="text-[#5E9FE9] text-2xl" />
            </div>
            <h2 className="text-xl font-semibold">{isFr ? tr.rightsTitleFr : tr.rightsTitleEn}</h2>
            <p className="mt-3 text-gray-600 leading-7">{isFr ? tr.rightsDescFr : tr.rightsDescEn}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2"><FaEye className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.rightsBullet1Fr : tr.rightsBullet1En}</li>
              <li className="flex items-center gap-2"><FaPenToSquare className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.rightsBullet2Fr : tr.rightsBullet2En}</li>
              <li className="flex items-center gap-2"><FaTrashCan className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.rightsBullet3Fr : tr.rightsBullet3En}</li>
              <li className="flex items-center gap-2"><FaFileLines className="text-[#5E9FE9] shrink-0" /> {isFr ? tr.rightsBullet4Fr : tr.rightsBullet4En}</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Mesures techniques */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <FaShieldHalved className="inline mr-2 text-[#5E9FE9]" />
            {isFr ? tr.techMeasuresTitleFr : tr.techMeasuresTitleEn}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaFingerprint className="text-[#5E9FE9] text-2xl" />
              </div>
              <h3 className="font-semibold text-lg">{isFr ? tr.techEncryptionTitleFr : tr.techEncryptionTitleEn}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-6">{isFr ? tr.techEncryptionDescFr : tr.techEncryptionDescEn}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaServer className="text-[#5E9FE9] text-2xl" />
              </div>
              <h3 className="font-semibold text-lg">{isFr ? tr.techInfraTitleFr : tr.techInfraTitleEn}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-6">{isFr ? tr.techInfraDescFr : tr.techInfraDescEn}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaEye className="text-[#5E9FE9] text-2xl" />
              </div>
              <h3 className="font-semibold text-lg">{isFr ? tr.techMonitoringTitleFr : tr.techMonitoringTitleEn}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-6">{isFr ? tr.techMonitoringDescFr : tr.techMonitoringDescEn}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-xl text-center">
          <FaEnvelope className="mx-auto text-3xl text-[#5E9FE9] mb-4" />
          <h2 className="text-xl font-bold mb-3">{isFr ? tr.rightsContactTitleFr : tr.rightsContactTitleEn}</h2>
          <p className="text-gray-500 text-sm leading-6 max-w-xl mx-auto">
            {isFr ? tr.rightsContactDescFr : tr.rightsContactDescEn}
          </p>
        </div>
      </section>
    </main>
  );
}