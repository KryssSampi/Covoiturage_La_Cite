import { adminGuard } from '@/features/auth/adminGuard';
import AdminSidebar from '@/features/admin/components/AdminSidebar';
import '@/styles/admin.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await adminGuard();
  return (
    <div className='admin-layout'>
      <AdminSidebar />
      <main className='admin-content'>{children}</main>
    </div>
  );
}
