'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavProps {
  id: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export function AdminNav({ id }: AdminNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: 'Tableau de bord', href: `/admin/${id}`, icon: '📊' },
    { label: 'Statistiques', href: `/admin/${id}/statistiques`, icon: '📈' },
    { label: 'Signalements', href: `/admin/${id}/rapports`, icon: '🚩' },
    { label: 'Modération', href: `/admin/${id}/moderation`, icon: '🛡️' },
    { label: 'Configuration', href: `/admin/${id}/configuration`, icon: '⚙️' },
    { label: 'Journal d\'audit', href: `/admin/${id}/audit`, icon: '📋' },
  ];

  const isActive = (href: string) => {
    if (href === `/admin/${id}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-[#1a2236] text-white flex flex-col shadow-xl">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-lg font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-semibold">Administration</p>
            <p className="text-xs text-gray-400">Covoiturage La Cité</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <span>🏠</span>
          <span>Retour accueil</span>
        </Link>
      </div>
    </aside>
  );
}
