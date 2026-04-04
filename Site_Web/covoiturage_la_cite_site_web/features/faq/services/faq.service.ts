import type { FAQItemModel } from '@/domain/models/FAQItemModel';

export const FAQService = {
  async getAll(): Promise<FAQItemModel[]> {
    const res = await fetch('/api/faq', { cache: 'no-store' });
    if (!res.ok) throw new Error('Impossible de charger les FAQ.');
    const data = await res.json();
    return data.items as FAQItemModel[];
  },
};
