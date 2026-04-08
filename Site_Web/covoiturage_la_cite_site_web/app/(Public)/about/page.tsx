'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaGraduationCap, FaHandshake, FaLeaf, FaShieldHalved, FaUserCheck, FaTriangleExclamation, FaLock, FaRoad, FaCar, FaUsers, FaChartLine, FaHeart, FaStar, FaGlobe, FaLightbulb, FaCircleCheck } from 'react-icons/fa6';
import { ABOUT_TRANSLATIONS } from '@/core/i18n/public-pages.translations';
import { Language, useAppState } from '@/core/state/app_state';

interface PlatformStats {
  totalUsers: number;
  totalTrips: number;
  totalCo2SavedKg: number;
}

export default function AboutPage() {
  const { lang } = useAppState();
  const isFr = lang === Language.FR;
  const tr = ABOUT_TRANSLATIONS;
  const [stats, setStats] = useState<PlatformStats>({ totalUsers: 0, totalTrips: 0, totalCo2SavedKg: 0 });

  useEffect(() => {
    fetch('/api/platform-stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const formatUsers = (n: number) => n > 0 ? `${n}+` : '500+';
  const formatTrips = (n: number) => n > 0 ? `${n.toLocaleString('fr-FR')}+` : '1 200+';
  const formatCo2 = (kg: number) => {
    if (kg > 0) {
      return kg >= 1000 ? `${(kg / 1000).toFixed(1).replace('.', ',')} t` : `${kg} kg`;
    }
    return '8 500 kg';
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image src="/img/nouveautes-section-background.png" fill className="object-cover" alt="" priority />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.80)_60%,rgba(255,255,255,0.97)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(8,49,110,0.04),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-36 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#5E9FE9]/10 border border-[#5E9FE9]/20 shadow-md">
            <FaGraduationCap className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {isFr ? tr.aboutHeroTitleFr : tr.aboutHeroTitleEn} <span className="text-[#5E9FE9]">Covoiturage La Cité</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-8">
            {isFr ? tr.aboutHeroSubtitleFr : tr.aboutHeroSubtitleEn}
          </p>
        </div>
      </section>

      {/* Notre mission */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          <FaLightbulb className="inline mr-2 text-[#5E9FE9]" />
          {isFr ? tr.pillarsTitleFr : tr.pillarsTitleEn}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaRoad className="text-[#5E9FE9] text-2xl" />
            </div>
            <h3 className="text-xl font-semibold">{isFr ? tr.missionTitleFr : tr.missionTitleEn}</h3>
            <p className="mt-3 text-gray-600 leading-7">{isFr ? tr.missionDescFr : tr.missionDescEn}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> {isFr ? tr.missionBullet1Fr : tr.missionBullet1En}</li>
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> {isFr ? tr.missionBullet2Fr : tr.missionBullet2En}</li>
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> {isFr ? tr.missionBullet3Fr : tr.missionBullet3En}</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaUsers className="text-[#5E9FE9] text-2xl" />
            </div>
            <h3 className="text-xl font-semibold">{isFr ? tr.communityTitleFr : tr.communityTitleEn}</h3>
            <p className="mt-3 text-gray-600 leading-7">{isFr ? tr.communityDescFr : tr.communityDescEn}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> {isFr ? tr.communityBullet1Fr : tr.communityBullet1En}</li>
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> {isFr ? tr.communityBullet2Fr : tr.communityBullet2En}</li>
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> {isFr ? tr.communityBullet3Fr : tr.communityBullet3En}</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaLeaf className="text-[#5E9FE9] text-2xl" />
            </div>
            <h3 className="text-xl font-semibold">{isFr ? tr.impactTitleFr : tr.impactTitleEn}</h3>
            <p className="mt-3 text-gray-600 leading-7">{isFr ? tr.impactDescFr : tr.impactDescEn}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> {isFr ? tr.impactBullet1Fr : tr.impactBullet1En}</li>
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> {isFr ? tr.impactBullet2Fr : tr.impactBullet2En}</li>
              <li className="flex items-start gap-2"><FaCircleCheck className="text-[#5E9FE9] mt-0.5 shrink-0" /> {isFr ? tr.impactBullet3Fr : tr.impactBullet3En}</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <FaChartLine className="inline mr-2 text-[#5E9FE9]" />
            {isFr ? tr.statsTitleFr : tr.statsTitleEn}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-[#5E9FE9]">{formatUsers(stats.totalUsers)}</div>
              <p className="mt-2 text-sm text-gray-500">{isFr ? tr.statsMembersFr : tr.statsMembersEn}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#5E9FE9]">{formatTrips(stats.totalTrips)}</div>
              <p className="mt-2 text-sm text-gray-500">{isFr ? tr.statsTripsFr : tr.statsTripsEn}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#5E9FE9]">{formatCo2(stats.totalCo2SavedKg)}</div>
              <p className="mt-2 text-sm text-gray-500">{isFr ? tr.statsCo2Fr : tr.statsCo2En}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#5E9FE9]">4.8 / 5</div>
              <p className="mt-2 text-sm text-gray-500">{isFr ? tr.statsRatingFr : tr.statsRatingEn}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          <FaHeart className="inline mr-2 text-[#5E9FE9]" />
          {isFr ? tr.valuesTitleFr : tr.valuesTitleEn}
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaHandshake className="text-[#5E9FE9] text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{isFr ? tr.valueTrustTitleFr : tr.valueTrustTitleEn}</h3>
              <p className="mt-2 text-gray-600 leading-7">{isFr ? tr.valueTrustDescFr : tr.valueTrustDescEn}</p>
            </div>
          </div>
          <div className="flex gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaStar className="text-[#5E9FE9] text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{isFr ? tr.valueExcellenceTitleFr : tr.valueExcellenceTitleEn}</h3>
              <p className="mt-2 text-gray-600 leading-7">{isFr ? tr.valueExcellenceDescFr : tr.valueExcellenceDescEn}</p>
            </div>
          </div>
          <div className="flex gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaGlobe className="text-[#5E9FE9] text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{isFr ? tr.valueResponsibilityTitleFr : tr.valueResponsibilityTitleEn}</h3>
              <p className="mt-2 text-gray-600 leading-7">{isFr ? tr.valueResponsibilityDescFr : tr.valueResponsibilityDescEn}</p>
            </div>
          </div>
          <div className="flex gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaCar className="text-[#5E9FE9] text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{isFr ? tr.valueAccessibilityTitleFr : tr.valueAccessibilityTitleEn}</h3>
              <p className="mt-2 text-gray-600 leading-7">{isFr ? tr.valueAccessibilityDescFr : tr.valueAccessibilityDescEn}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sécurité et confiance */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            <FaShieldHalved className="inline mr-2 text-[#5E9FE9]" />
            {isFr ? tr.securityTitleFr : tr.securityTitleEn}
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
            {isFr ? tr.securitySubtitleFr : tr.securitySubtitleEn}
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <article className="rounded-xl border border-gray-200 bg-white p-6 hover:bg-gray-50 transition-all duration-300">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaUserCheck className="text-[#5E9FE9] text-xl" />
              </div>
              <h3 className="font-semibold text-lg">{isFr ? tr.securityVerifyTitleFr : tr.securityVerifyTitleEn}</h3>
              <p className="mt-3 text-sm text-gray-500 leading-6">{isFr ? tr.securityVerifyDescFr : tr.securityVerifyDescEn}</p>
            </article>
            <article className="rounded-xl border border-gray-200 bg-white p-6 hover:bg-gray-50 transition-all duration-300">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaTriangleExclamation className="text-[#5E9FE9] text-xl" />
              </div>
              <h3 className="font-semibold text-lg">{isFr ? tr.securityReportTitleFr : tr.securityReportTitleEn}</h3>
              <p className="mt-3 text-sm text-gray-500 leading-6">{isFr ? tr.securityReportDescFr : tr.securityReportDescEn}</p>
            </article>
            <article className="rounded-xl border border-gray-200 bg-white p-6 hover:bg-gray-50 transition-all duration-300">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaLock className="text-[#5E9FE9] text-xl" />
              </div>
              <h3 className="font-semibold text-lg">{isFr ? tr.securitySessionTitleFr : tr.securitySessionTitleEn}</h3>
              <p className="mt-3 text-sm text-gray-500 leading-6">{isFr ? tr.securitySessionDescFr : tr.securitySessionDescEn}</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}