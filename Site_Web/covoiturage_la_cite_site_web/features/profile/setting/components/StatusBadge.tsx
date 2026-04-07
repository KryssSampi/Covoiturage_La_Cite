/**
 * StatusBadge — Badge d'état pour le VehicleTab
 */

import {
  FaCircleCheck,
  FaTriangleExclamation,
  FaFileLines,
} from "react-icons/fa6";

interface StatusBadgeProps {
  icon: React.ReactNode;
  label: string;
  variant: "green" | "blue" | "yellow" | "red";
}

const variants = {
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700 animate-pulse",
};

export function StatusBadge({ icon, label, variant }: StatusBadgeProps) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${variants[variant]}`}>
      {icon}
      {label}
    </div>
  );
}

// Icônes prédéfinies pour les badges
export const StatusIcons = {
  active: <FaCircleCheck size={10} />,
  inactive: <FaTriangleExclamation size={10} />,
  validated: <FaCircleCheck size={10} />,
  notValidated: <FaTriangleExclamation size={10} />,
  documentsRequired: <FaFileLines size={10} />,
};
