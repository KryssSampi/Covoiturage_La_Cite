import Image from 'next/image';
import { headers } from 'next/headers';
import { FAQClientView }  from '@/features/faq/components/FAQClientView';
import type { FAQItemModel } from '@/domain/models/FAQItemModel';
import { FaCircleQuestion } from 'react-icons/fa6';

async function getFAQItems(): Promise<FAQItemModel[]> {
  try {
    // Lecture via l'API interne (server-side)
    const headersList = await headers();
    const host = headersList.get('host') ?? 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

    const res = await fetch(`${protocol}://${host}/api/faq`, {
      cache: 'force-cache',
      next: { revalidate: 3600 }, // revalidate toutes les heures
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'FAQ — Covoiturage La Cité',
  description: 'Foire aux questions de Covoiturage La Cité. Trouvez rapidement des réponses sur votre compte, vos trajets, la sécurité et bien plus.',
};

export default async function FAQPage() {
  const items = await getFAQItems();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Image
          src="/img/planifier-background.png"
          fill
          className="object-cover"
          alt=""
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.80)_60%,rgba(255,255,255,0.97)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(8,49,110,0.06),transparent_60%)]" />

        <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-36 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#5E9FE9]/10 border border-[#5E9FE9]/20 shadow-md">
            <FaCircleQuestion className="text-[#5E9FE9] text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Foire aux <span className="text-[#5E9FE9]">questions</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-8">
            Trouvez rapidement des réponses à vos questions sur Covoiturage La Cité —
            inscription, trajets, sécurité, paiements et bien plus encore.
          </p>
        </div>
      </section>

      {/* ── Vue interactive (Client Component) ───────────────────────────── */}
      <FAQClientView items={items} />
    </>
  );
}
