"use client";

interface NotificationsBadgeProps {
  /** Nombre de notifications non lues */
  count: number;
  /** Taille du badge (défaut : md) */
  size?: "sm" | "md";
}

/**
 * Badge compteur de notifications non lues.
 * Invisible si count === 0. Affiche "9+" au-delà de 9.
 * Utilisé dans le header, à côté de l'icône cloche.
 */
export function NotificationsBadge({ count, size = "md" }: NotificationsBadgeProps) {
  if (count <= 0) return null;

  const label = count > 9 ? "9+" : String(count);

  const sizeClass = size === "sm"
    ? "min-w-[16px] h-4 text-[9px] px-[3px]"
    : "min-w-[20px] h-5 text-[10px] px-1";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-red-500 text-white font-bold leading-none ${sizeClass}`}
      aria-label={`${count} notification${count > 1 ? "s" : ""} non lue${count > 1 ? "s" : ""}`}
    >
      {label}
    </span>
  );
}
