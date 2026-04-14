'use client';

import Image from 'next/image';
import { FAQClientView } from '@/features/faq/components/FAQClientView';
import type { FAQItemModel } from '@/domain/models/FAQItemModel';
import { FaCircleQuestion } from 'react-icons/fa6';
import { FAQ_TRANSLATIONS } from '@/core/i18n/public-pages.translations';
import { Language, useAppState } from '@/core/state/app_state';
import { useEffect, useState } from 'react';

async function getFAQItems(): Promise<FAQItemModel[]> {
  try {
    const res = await fetch('/api/faq', { cache: 'force-cache', next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

export default function FAQPage() {
  const { lang } = useAppState();
  const isFr = lang === Language.FR;
  const tr = FAQ_TRANSLATIONS;
  const [items, setItems] = useState<FAQItemModel[]>([]);

  useEffect(() => {
    getFAQItems().then(setItems).catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image src="/img/planifier-background.png" fill className="object-cover" alt="" priority />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.80)_60%,rgba(255,255,255,0.97)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(8,49,110,0.06),transparent_60%)]" />

        <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-36 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#5E9FE9]/10 border border-[#5E9FE9]/20 shadow-md">
            <FaCircleQuestion className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {isFr ? tr.faqHeroTitleFr : tr.faqHeroTitleEn}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-8">
            {isFr ? tr.faqHeroSubtitleFr : tr.faqHeroSubtitleEn}
          </p>
        </div>
      </section>

      {/* Vue interactive (Client Component) */}
      <FAQClientView items={items} />
    </>
  );
}