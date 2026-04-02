import { Header } from '@/features/homepage/component/header';
import { Footer } from '@/shared/components/footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      <Header />
      <main lang="fr" className="grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
