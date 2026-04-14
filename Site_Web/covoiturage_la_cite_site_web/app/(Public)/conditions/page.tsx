'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaScaleBalanced, FaUserCheck, FaHandshake, FaBan, FaTriangleExclamation, FaCircleXmark, FaFileContract, FaCircleCheck, FaShieldHalved, FaGavel, FaClock, FaArrowRight } from 'react-icons/fa6';
import { CONDITIONS_TRANSLATIONS, t } from '@/core/i18n/public-pages.translations';
import { Language, useAppState } from '@/core/state/app_state';

export default function ConditionsPage() {
  const { lang } = useAppState();
  const isFr = lang === Language.FR;
  const tr = CONDITIONS_TRANSLATIONS;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image src="/img/acceuil-hero-img.png" fill className="object-cover" alt="" priority />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.80)_60%,rgba(255,255,255,0.97)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(8,49,110,0.04),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-36 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#5E9FE9]/10 border border-[#5E9FE9]/20 shadow-md">
            <FaScaleBalanced className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {t(tr.condHeroTitleFr, tr.condHeroTitleEn, lang)}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-8">
            {t(tr.condHeroSubtitleFr, tr.condHeroSubtitleEn, lang)}
          </p>
        </div>
      </section>

      {/* Règles principales */}
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-16">
        <div className="space-y-6">
          {/* Règle 1 */}
          <article className="flex gap-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">1</div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaUserCheck className="text-[#5E9FE9] text-xl" />
                <h2 className="text-xl font-semibold">{t(tr.rule1TitleFr, tr.rule1TitleEn, lang)}</h2>
              </div>
              <p className="text-gray-600 leading-7">{t(tr.rule1DescFr, tr.rule1DescEn, lang)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaCircleCheck className="text-[#5E9FE9]" /> {t(tr.rule1Badge1Fr, tr.rule1Badge1En, lang)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaCircleCheck className="text-[#5E9FE9]" /> {t(tr.rule1Badge2Fr, tr.rule1Badge2En, lang)}</span>
              </div>
            </div>
          </article>

          {/* Règle 2 */}
          <article className="flex gap-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">2</div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaHandshake className="text-[#5E9FE9] text-xl" />
                <h2 className="text-xl font-semibold">{t(tr.rule2TitleFr, tr.rule2TitleEn, lang)}</h2>
              </div>
              <p className="text-gray-600 leading-7">{t(tr.rule2DescFr, tr.rule2DescEn, lang)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaClock className="text-[#5E9FE9]" /> {t(tr.rule2Badge1Fr, tr.rule2Badge1En, lang)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaHandshake className="text-[#5E9FE9]" /> {t(tr.rule2Badge2Fr, tr.rule2Badge2En, lang)}</span>
              </div>
            </div>
          </article>

          {/* Règle 3 */}
          <article className="flex gap-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">3</div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaBan className="text-[#5E9FE9] text-xl" />
                <h2 className="text-xl font-semibold">{t(tr.rule3TitleFr, tr.rule3TitleEn, lang)}</h2>
              </div>
              <p className="text-gray-600 leading-7">{t(tr.rule3DescFr, tr.rule3DescEn, lang)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs text-red-600"><FaCircleXmark /> {t(tr.rule3Badge1Fr, tr.rule3Badge1En, lang)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs text-red-600"><FaCircleXmark /> {t(tr.rule3Badge2Fr, tr.rule3Badge2En, lang)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs text-red-600"><FaCircleXmark /> {t(tr.rule3Badge3Fr, tr.rule3Badge3En, lang)}</span>
              </div>
            </div>
          </article>

          {/* Règle 4 */}
          <article className="flex gap-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">4</div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaTriangleExclamation className="text-[#5E9FE9] text-xl" />
                <h2 className="text-xl font-semibold">{t(tr.rule4TitleFr, tr.rule4TitleEn, lang)}</h2>
              </div>
              <p className="text-gray-600 leading-7">{t(tr.rule4DescFr, tr.rule4DescEn, lang)}</p>
              <div className="mt-3">
                <Link href="/securite#signalement-form" className="inline-flex items-center gap-2 text-[#5E9FE9] hover:text-[#7db8f0] transition-colors text-sm font-medium">
                  {t(tr.rule4LinkFr, tr.rule4LinkEn, lang)} <FaArrowRight className="text-xs" />
                </Link>
              </div>
            </div>
          </article>

          {/* Règle 5 */}
          <article className="flex gap-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-xl hover:bg-gray-50 transition-all duration-300">
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9] text-white text-xl font-bold shadow-lg shadow-[#5E9FE9]/30">5</div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaGavel className="text-[#5E9FE9] text-xl" />
                <h2 className="text-xl font-semibold">{t(tr.rule5TitleFr, tr.rule5TitleEn, lang)}</h2>
              </div>
              <p className="text-gray-600 leading-7">{t(tr.rule5DescFr, tr.rule5DescEn, lang)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaShieldHalved className="text-[#5E9FE9]" /> {t(tr.rule5Badge1Fr, tr.rule5Badge1En, lang)}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"><FaFileContract className="text-[#5E9FE9]" /> {t(tr.rule5Badge2Fr, tr.rule5Badge2En, lang)}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Note légale */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-xl text-center">
          <FaFileContract className="mx-auto text-3xl text-[#5E9FE9] mb-4" />
          <p className="text-gray-500 text-sm leading-6 max-w-2xl mx-auto">
            {t(tr.legalNoteFr, tr.legalNoteEn, lang)}
          </p>
        </div>
      </section>
    </main>
  );
}