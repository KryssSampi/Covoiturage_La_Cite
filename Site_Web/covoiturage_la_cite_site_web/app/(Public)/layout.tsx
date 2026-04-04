import { PublicHeaderWrapper } from './PublicHeaderWrapper';
import { Footer } from '@/shared/components/footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <PublicHeaderWrapper />
      <main lang="fr" className="grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
