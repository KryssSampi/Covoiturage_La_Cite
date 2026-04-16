'use client';

import Image from 'next/image';
import { FaUniversalAccess, FaKeyboard, FaCircleHalfStroke, FaFont, FaComments, FaMobileScreen, FaCircleCheck, FaHandPointer, FaHeadphones, FaArrowsRotate, FaWheelchair, FaHeart } from 'react-icons/fa6';
import { ACCESSIBILITY_TRANSLATIONS, t } from '@/core/i18n/public-pages.translations';
import { Language, useAppState } from '@/core/state/app_state';

export default function AccessibilitePage() {
  const { lang } = useAppState();
  const isFr = lang === Language.FR;
  const tr = ACCESSIBILITY_TRANSLATIONS;

  return (
    <main className="min-h-screen bg-white text-gray-900 w-full">
      {/* Hero */}
      <section className="relative overflow-hidden w-full">
        <Image src="/img/list-detail-background.png" fill className="object-cover" alt="" priority />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.80)_60%,rgba(255,255,255,0.97)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,49,110,0.04),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 md:pt-28 pb-12 md:pb-36 text-center w-full">
          <div className="mx-auto mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-[#5E9FE9]/10 border border-[#5E9FE9]/20 shadow-md">
            <FaUniversalAccess className="text-[#5E9FE9] text-base lg:text-3xl" />
          </div>
          <h1 className="text-base lg:text-5xl font-bold tracking-tight">
            <span className="text-[#5E9FE9]">{t(tr.accessHeroTitleFr, tr.accessHeroTitleEn, lang)}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm lg:text-lg text-gray-600 leading-8">
            {t(tr.accessHeroSubtitleFr, tr.accessHeroSubtitleEn, lang)}
          </p>
        </div>
      </section>

      {/* Engagements principaux */}
      <section className="mx-auto max-w-6xl px-4 pt-8 md:pt-16 pb-8 md:pb-16 w-full">
        <h2 className="text-base lg:text-3xl font-bold text-center mb-6 md:mb-10 w-full">
          <FaHeart className="inline mr-2 text-[#5E9FE9]" />
          {t(tr.commitmentsTitleFr, tr.commitmentsTitleEn, lang)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
          <article className="group rounded-2xl border border-gray-200 bg-white p-4 md:p-7 shadow-xl hover:bg-gray-50 transition-all duration-300 w-full">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaKeyboard className="text-[#5E9FE9] text-base lg:text-2xl" />
            </div>
            <h3 className="text-sm lg:text-xl font-semibold">{t(tr.keyboardTitleFr, tr.keyboardTitleEn, lang)}</h3>
            <p className="mt-3 text-gray-600 leading-7">{t(tr.keyboardDescFr, tr.keyboardDescEn, lang)}</p>
            <ul className="mt-4 space-y-2 text-xs lg:text-sm text-gray-500">
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {t(tr.keyboardBullet1Fr, tr.keyboardBullet1En, lang)}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {t(tr.keyboardBullet2Fr, tr.keyboardBullet2En, lang)}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {t(tr.keyboardBullet3Fr, tr.keyboardBullet3En, lang)}</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-gray-200 bg-white p-4 md:p-7 shadow-xl hover:bg-gray-50 transition-all duration-300 w-full">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaCircleHalfStroke className="text-[#5E9FE9] text-base lg:text-2xl" />
            </div>
            <h3 className="text-sm lg:text-xl font-semibold">{t(tr.contrastTitleFr, tr.contrastTitleEn, lang)}</h3>
            <p className="mt-3 text-gray-600 leading-7">{t(tr.contrastDescFr, tr.contrastDescEn, lang)}</p>
            <ul className="mt-4 space-y-2 text-xs lg:text-sm text-gray-500">
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {t(tr.contrastBullet1Fr, tr.contrastBullet1En, lang)}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {t(tr.contrastBullet2Fr, tr.contrastBullet2En, lang)}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {t(tr.contrastBullet3Fr, tr.contrastBullet3En, lang)}</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-gray-200 bg-white p-4 md:p-7 shadow-xl hover:bg-gray-50 transition-all duration-300 w-full">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaFont className="text-[#5E9FE9] text-base lg:text-2xl" />
            </div>
            <h3 className="text-sm lg:text-xl font-semibold">{t(tr.typographyTitleFr, tr.typographyTitleEn, lang)}</h3>
            <p className="mt-3 text-gray-600 leading-7">{t(tr.typographyDescFr, tr.typographyDescEn, lang)}</p>
            <ul className="mt-4 space-y-2 text-xs lg:text-sm text-gray-500">
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {t(tr.typographyBullet1Fr, tr.typographyBullet1En, lang)}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {t(tr.typographyBullet2Fr, tr.typographyBullet2En, lang)}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {t(tr.typographyBullet3Fr, tr.typographyBullet3En, lang)}</li>
            </ul>
          </article>

          <article className="group rounded-2xl border border-gray-200 bg-white p-4 md:p-7 shadow-xl hover:bg-gray-50 transition-all duration-300 w-full">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E9FE9]/10">
              <FaComments className="text-[#5E9FE9] text-2xl" />
            </div>
            <h3 className="text-xl font-semibold">{t(tr.formsTitleFr, tr.formsTitleEn, lang)}</h3>
            <p className="mt-3 text-gray-600 leading-7">{t(tr.formsDescFr, tr.formsDescEn, lang)}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {t(tr.formsBullet1Fr, tr.formsBullet1En, lang)}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {t(tr.formsBullet2Fr, tr.formsBullet2En, lang)}</li>
              <li className="flex items-center gap-2"><FaCircleCheck className="text-[#5E9FE9] shrink-0" /> {t(tr.formsBullet3Fr, tr.formsBullet3En, lang)}</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Fonctionnalités d'aide */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <FaWheelchair className="inline mr-2 text-[#5E9FE9]" />
            {t(tr.techTitleFr, tr.techTitleEn, lang)}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaHeadphones className="text-[#5E9FE9] text-2xl" />
              </div>
              <h3 className="font-semibold text-lg">{t(tr.techScreenReaderTitleFr, tr.techScreenReaderTitleEn, lang)}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-6">{t(tr.techScreenReaderDescFr, tr.techScreenReaderDescEn, lang)}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaHandPointer className="text-[#5E9FE9] text-2xl" />
              </div>
              <h3 className="font-semibold text-lg">{t(tr.techTouchTitleFr, tr.techTouchTitleEn, lang)}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-6">{t(tr.techTouchDescFr, tr.techTouchDescEn, lang)}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaMobileScreen className="text-[#5E9FE9] text-2xl" />
              </div>
              <h3 className="font-semibold text-lg">{t(tr.techResponsiveTitleFr, tr.techResponsiveTitleEn, lang)}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-6">{t(tr.techResponsiveDescFr, tr.techResponsiveDescEn, lang)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Amélioration continue */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5E9FE9]/10">
                <FaArrowsRotate className="text-[#5E9FE9] text-2xl" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">{t(tr.improvementTitleFr, tr.improvementTitleEn, lang)}</h2>
              <p className="text-gray-500 leading-7">{t(tr.improvementDescFr, tr.improvementDescEn, lang)}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 md:ml-22">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{t(tr.improvementBadge1Fr, tr.improvementBadge1En, lang)}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{t(tr.improvementBadge2Fr, tr.improvementBadge2En, lang)}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{t(tr.improvementBadge3Fr, tr.improvementBadge3En, lang)}</span>
          </div>
        </div>
      </section>
    </main>
  );
}