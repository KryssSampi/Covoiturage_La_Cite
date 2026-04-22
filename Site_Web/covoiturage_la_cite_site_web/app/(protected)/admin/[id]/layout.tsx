import { AdminNav } from '@/features/admin/components/AdminNav';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav id={params.id} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
