'use client';

import Image from 'next/image';
import { FaUserPlus, FaMagnifyingGlass, FaHandshake, FaRoute, FaStar, FaRocket, FaArrowRight, FaCircle, FaMobileScreen, FaBell, FaMapLocationDot, FaCreditCard, FaComments } from 'react-icons/fa6';
import { HOW_IT_WORKS_TRANSLATIONS, t } from '@/core/i18n/public-pages.translations';
import { Language, useAppState } from '@/core/state/app_state';
import Link from 'next/link';

export default function CommentCaMarchePage() {
  const { lang } = useAppState();
  const isFr = lang === Language.FR;
  const tr = HOW_IT_WORKS_TRANSLATIONS;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image src="/img/driver-hero.png" fill className="object-cover" alt="" priority />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.80)_60%,rgba(255,255,255,0.97)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,49,110,0.04),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-36 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#5E9FE9]/10 border border-[#5E9FE9]/20 shadow-md">
            <FaRocket className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {t(tr.hiwHeroTitleFr, tr.hiwHeroTitleEn, lang)}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-8">
            {t(tr.hiwHeroSubtitleFr, tr.hiwHeroSubtitleEn, lang)}
          </p>
        </div>
      </section>

      {/* Étapes */}
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-16">
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-[#5E9FE9]/50 via-[#5E9FE9]/20 to-transparent hidden md:block" />

          {/* Étape 1 */}
          <div className="relative flex flex-col md:flex-row gap-6 mb-10">
            <div className="shrink-0 z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">1</div>
            </div>
            <article className="flex-1 rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <FaUserPlus className="text-[#5E9FE9] text-2xl" />
                <h2 className="text-xl font-semibold">{t(tr.step1TitleFr, tr.step1TitleEn, lang)}</h2>
              </div>
              <p className="text-gray-600 leading-7">{t(tr.step1DescFr, tr.step1DescEn, lang)}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaCircle className="text-[3px] text-[#5E9FE9]" /> {t(tr.step1Badge1Fr, tr.step1Badge1En, lang)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaCircle className="text-[3px] text-[#5E9FE9]" /> {t(tr.step1Badge2Fr, tr.step1Badge2En, lang)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaCircle className="text-[3px] text-[#5E9FE9]" /> {t(tr.step1Badge3Fr, tr.step1Badge3En, lang)}</span>
              </div>
            </article>
          </div>

          {/* Étape 2 */}
          <div className="relative flex flex-col md:flex-row gap-6 mb-10">
            <div className="shrink-0 z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">2</div>
            </div>
            <article className="flex-1 rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <FaMagnifyingGlass className="text-[#5E9FE9] text-2xl" />
                <h2 className="text-xl font-semibold">{t(tr.step2TitleFr, tr.step2TitleEn, lang)}</h2>
              </div>
              <p className="text-gray-600 leading-7">{t(tr.step2DescFr, tr.step2DescEn, lang)}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaMapLocationDot className="text-[#5E9FE9] text-xs" /> {t(tr.step2Badge1Fr, tr.step2Badge1En, lang)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaBell className="text-[#5E9FE9] text-xs" /> {t(tr.step2Badge2Fr, tr.step2Badge2En, lang)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaMobileScreen className="text-[#5E9FE9] text-xs" /> {t(tr.step2Badge3Fr, tr.step2Badge3En, lang)}</span>
              </div>
            </article>
          </div>

          {/* Étape 3 */}
          <div className="relative flex flex-col md:flex-row gap-6 mb-10">
            <div className="shrink-0 z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">3</div>
            </div>
            <article className="flex-1 rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <FaHandshake className="text-[#5E9FE9] text-2xl" />
                <h2 className="text-xl font-semibold">{t(tr.step3TitleFr, tr.step3TitleEn, lang)}</h2>
              </div>
              <p className="text-gray-600 leading-7">{t(tr.step3DescFr, tr.step3DescEn, lang)}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaCreditCard className="text-[#5E9FE9] text-xs" /> {t(tr.step3Badge1Fr, tr.step3Badge1En, lang)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaBell className="text-[#5E9FE9] text-xs" /> {t(tr.step3Badge2Fr, tr.step3Badge2En, lang)}</span>
              </div>
            </article>
          </div>

          {/* Étape 4 */}
          <div className="relative flex flex-col md:flex-row gap-6 mb-10">
            <div className="shrink-0 z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">4</div>
            </div>
            <article className="flex-1 rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <FaRoute className="text-[#5E9FE9] text-2xl" />
                <h2 className="text-xl font-semibold">{t(tr.step4TitleFr, tr.step4TitleEn, lang)}</h2>
              </div>
              <p className="text-gray-600 leading-7">{t(tr.step4DescFr, tr.step4DescEn, lang)}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaMapLocationDot className="text-[#5E9FE9] text-xs" /> {t(tr.step4Badge1Fr, tr.step4Badge1En, lang)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaComments className="text-[#5E9FE9] text-xs" /> {t(tr.step4Badge2Fr, tr.step4Badge2En, lang)}</span>
              </div>
            </article>
          </div>

          {/* Étape 5 */}
          <div className="relative flex flex-col md:flex-row gap-6">
            <div className="shrink-0 z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">5</div>
            </div>
            <article className="flex-1 rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <FaStar className="text-[#5E9FE9] text-2xl" />
                <h2 className="text-xl font-semibold">{t(tr.step5TitleFr, tr.step5TitleEn, lang)}</h2>
              </div>
              <p className="text-gray-600 leading-7">{t(tr.step5DescFr, tr.step5DescEn, lang)}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaStar className="text-[#5E9FE9] text-xs" /> {t(tr.step5Badge1Fr, tr.step5Badge1En, lang)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaComments className="text-[#5E9FE9] text-xs" /> {t(tr.step5Badge2Fr, tr.step5Badge2En, lang)}</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 shadow-xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t(tr.ctaTitleFr, tr.ctaTitleEn, lang)}</h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">{t(tr.ctaDescFr, tr.ctaDescEn, lang)}</p>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-[#5E9FE9] px-8 py-3 text-base font-semibold text-white hover:bg-[#4a8fd4] transition-colors shadow-lg shadow-[#5E9FE9]/25">
            {t(tr.ctaButtonFr, tr.ctaButtonEn, lang)} <FaArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}