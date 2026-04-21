import { adminGuard } from "@/features/auth/adminGuard";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import "@/styles/admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  adminGuard();

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">{children}</main>
    </div>
  );
}
