"use client";

/**
 * features/admin/components/AdminShared.tsx
 * Composants UI rÃ©utilisables dans toutes les pages admin.
 * Design : industriel / utilitaire â€” palette bleue marine, accents vifs.
 */

import React from "react";
import { FiActivity, FiAlertTriangle, FiCloud, FiInbox, FiSearch, FiTruck, FiUsers } from "react-icons/fi";

// â”€â”€ Palette couleurs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  green:  { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  red:    { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  teal:   { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200" },
  slate:  { bg: "bg-slate-100", text: "text-slate-600",  border: "border-slate-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
};

// â”€â”€ StatCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: keyof typeof COLOR_MAP;
  change?: string;
  sub?: string;
  loading?: boolean;
}

export function StatCard({ label, value, icon = "users", color = "blue", change, sub, loading }: StatCardProps) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue;
  const iconMap: Record<string, React.ReactNode> = {
    users: <FiUsers />,
    car: <FiTruck />,
    clock: <FiActivity />,
    alert: <FiAlertTriangle />,
    cloud: <FiCloud />,
  };
  const iconNode = iconMap[icon] ?? icon;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4 flex items-start gap-3`}>
      <div className="text-2xl leading-none mt-0.5">{iconNode}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
        {loading ? (
          <div className="h-7 w-20 bg-slate-200 animate-pulse rounded mt-1" />
        ) : (
          <p className={`text-2xl font-bold ${c.text} leading-tight`}>{value}</p>
        )}
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        {change && <p className="text-xs text-slate-400 mt-0.5">{change}</p>}
      </div>
    </div>
  );
}

// â”€â”€ Badge statut â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface BadgeProps {
  label: string;
  color?: string;
  size?: "sm" | "md";
}

export function Badge({ label, color = "slate", size = "sm" }: BadgeProps) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.slate;
  const sz = size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span className={`inline-flex items-center rounded-full font-semibold border ${c.bg} ${c.text} ${c.border} ${sz}`}>
      {label}
    </span>
  );
}

// â”€â”€ Loading spinner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function LoadingSpinner({ text = "Chargement..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

// â”€â”€ Error display â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function ErrorDisplay({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="text-2xl"><FiAlertTriangle /></div>
      <p className="text-sm text-red-600 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-blue-600 underline hover:text-blue-800"
        >
          RÃ©essayer
        </button>
      )}
    </div>
  );
}

// â”€â”€ Empty state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function EmptyState({ text = "Aucune donnÃ©e." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
      <div className="text-3xl"><FiInbox /></div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

// â”€â”€ Table wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function AdminTable({
  headers,
  children,
  loading,
  empty,
  emptyText,
}: {
  headers: string[];
  children?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {headers.map((h) => (
                  <td key={h} className="py-3 px-4">
                    <div className="h-4 bg-slate-100 animate-pulse rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : empty ? (
            <tr>
              <td colSpan={headers.length} className="py-12 text-center text-slate-400 text-sm">
                {emptyText ?? "Aucune donnÃ©e."}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

// â”€â”€ Action button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function ActionButton({
  label,
  onClick,
  variant = "default",
  disabled,
  size = "sm",
}: {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: "default" | "success" | "danger" | "warning" | "primary";
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const variants = {
    default: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    primary: "bg-blue-600 text-white hover:bg-blue-700 border border-blue-700",
    success: "bg-green-600 text-white hover:bg-green-700 border border-green-700",
    danger:  "bg-red-600 text-white hover:bg-red-700 border border-red-700",
    warning: "bg-amber-500 text-white hover:bg-amber-600 border border-amber-600",
  };
  const sizes = {
    sm: "px-2.5 py-1 text-[11px]",
    md: "px-4 py-1.5 text-xs",
  };
  return (
    <button
      onClick={() => void onClick()}
      disabled={disabled}
      className={`rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]}`}
    >
      {label}
    </button>
  );
}

// â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function AdminTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[] | { key: string; label: string; count?: number }[];
  active: string;
  onChange: (key: string) => void;
}) {
  const normalized = tabs.map((tab) =>
    typeof tab === "string" ? { key: tab, label: tab } : tab,
  );
  return (
    <div className="flex gap-1 border-b border-slate-200 mb-4">
      {normalized.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            active === tab.key
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              active === tab.key ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// â”€â”€ Page header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function AdminPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// â”€â”€ Search input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function AdminSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"><FiSearch /></span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Rechercher..."}
        className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
      />
    </div>
  );
}

// â”€â”€ Select filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function AdminSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// â”€â”€ Confirm dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function confirmAction(message: string): Promise<boolean> {
  return window.confirm(message);
}

export async function promptText(message: string): Promise<string | null> {
  return window.prompt(message);
}

