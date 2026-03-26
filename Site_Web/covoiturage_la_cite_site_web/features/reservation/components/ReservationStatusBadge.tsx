"use client";

import { ReservationStatus } from "@/features/dashboard/types";

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<ReservationStatus, { label: { fr: string; en: string }; className: string }> = {
  [ReservationStatus.Pending]:    { label: { fr: "En attente", en: "Pending" },       className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  [ReservationStatus.Confirmed]:  { label: { fr: "Confirmée",  en: "Confirmed" },     className: "bg-green-100 text-green-800 border-green-200" },
  [ReservationStatus.InProgress]: { label: { fr: "En cours",   en: "In Progress" },   className: "bg-blue-100 text-blue-800 border-blue-200" },
  [ReservationStatus.Completed]:  { label: { fr: "Terminée",   en: "Completed" },     className: "bg-gray-100 text-gray-600 border-gray-200" },
  [ReservationStatus.Cancelled]:  { label: { fr: "Annulée",    en: "Cancelled" },     className: "bg-red-100 text-red-700 border-red-200" },
  [ReservationStatus.Rejected]:   { label: { fr: "Refusée",    en: "Rejected" },      className: "bg-red-50 text-red-500 border-red-100" },
};

/**
 * Badge de statut de réservation.
 * Couleur et libellé déterminés par le statut.
 */
export function ReservationStatusBadge({ status, size = "md" }: ReservationStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[ReservationStatus.Pending];

  const sizeClass = size === "sm"
    ? "text-[10px] px-1.5 py-0.5"
    : "text-xs px-2 py-1";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClass} ${config.className}`}
    >
      {config.label.fr}
    </span>
  );
}
