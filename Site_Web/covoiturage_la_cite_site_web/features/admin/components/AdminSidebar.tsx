import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <nav>
        <h2>Administration</h2>
        <ul>
          <li>
            <Link href="/admin">📊 Tableau de bord</Link>
          </li>
          <li>
            <Link href="/admin/analytics">📈 Analytics</Link>
          </li>
          <li>
            <Link href="/admin/users">👥 Utilisateurs</Link>
          </li>
          <li>
            <Link href="/admin/drivers">🚗 Conducteurs</Link>
          </li>
          <li>
            <Link href="/admin/vehicles">🛞 Véhicules</Link>
          </li>
          <li>
            <Link href="/admin/reports">📋 Signalements</Link>
          </li>
          <li>
            <Link href="/admin/moderations">💬 Modération</Link>
          </li>
          <li>
            <Link href="/admin/finance">💰 Finances</Link>
          </li>
          <li>
            <Link href="/admin/compliance">📜 PIPEDA</Link>
          </li>
          <li>
            <Link href="/admin/logs">📝 Logs d'audit</Link>
          </li>
          <li>
            <Link href="/admin/exports">📤 Exports</Link>
          </li>
          <li>
            <Link href="/admin/settings">⚙️ Paramètres</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
