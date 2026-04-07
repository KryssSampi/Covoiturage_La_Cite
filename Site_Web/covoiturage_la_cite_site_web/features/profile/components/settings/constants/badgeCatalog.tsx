import {
  FaCar,
  FaClock,
  FaLeaf,
  FaFaceSmile,
  FaShieldHalved,
  FaHandshake,
  FaMedal,
  FaRoad,
  FaBolt,
  FaUserGroup,
  FaStar,
  FaSnowflake,
} from "react-icons/fa6";
import type { ComponentType } from "react";

export interface ProfileBadgeOption {
  id: string;
  nameFr: string;
  nameEn: string;
  iconKey: string;
  colorClass: string;
}

const ICON_MAP: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  FaCar,
  FaClock,
  FaLeaf,
  FaFaceSmile,
  FaShieldHalved,
  FaHandshake,
  FaMedal,
  FaRoad,
  FaBolt,
  FaUserGroup,
  FaStar,
  FaSnowflake,
};

export const PROFILE_BADGE_CATALOG: ProfileBadgeOption[] = [
  { id: "b1", nameFr: "Conducteur Expert", nameEn: "Expert Driver", iconKey: "FaCar", colorClass: "bg-blue-100 text-blue-700" },
  { id: "b2", nameFr: "Ponctuel", nameEn: "Punctual", iconKey: "FaClock", colorClass: "bg-emerald-100 text-emerald-700" },
  { id: "b3", nameFr: "Éco-responsable", nameEn: "Eco Friendly", iconKey: "FaLeaf", colorClass: "bg-lime-100 text-lime-700" },
  { id: "b4", nameFr: "Ambiance Sympa", nameEn: "Good Vibes", iconKey: "FaFaceSmile", colorClass: "bg-amber-100 text-amber-700" },
  { id: "b5", nameFr: "Conduite Sûre", nameEn: "Safe Driver", iconKey: "FaShieldHalved", colorClass: "bg-cyan-100 text-cyan-700" },
  { id: "b6", nameFr: "Super Courtois", nameEn: "Courteous", iconKey: "FaHandshake", colorClass: "bg-teal-100 text-teal-700" },
  { id: "b7", nameFr: "Top Noté", nameEn: "Top Rated", iconKey: "FaMedal", colorClass: "bg-yellow-100 text-yellow-700" },
  { id: "b8", nameFr: "Longue Distance", nameEn: "Long Distance", iconKey: "FaRoad", colorClass: "bg-indigo-100 text-indigo-700" },
  { id: "b9", nameFr: "Réponse Rapide", nameEn: "Fast Response", iconKey: "FaBolt", colorClass: "bg-orange-100 text-orange-700" },
  { id: "b10", nameFr: "Esprit Communauté", nameEn: "Community Spirit", iconKey: "FaUserGroup", colorClass: "bg-fuchsia-100 text-fuchsia-700" },
  { id: "b11", nameFr: "5 Étoiles", nameEn: "5 Stars", iconKey: "FaStar", colorClass: "bg-rose-100 text-rose-700" },
  { id: "b12", nameFr: "Hiver Solide", nameEn: "Winter Ready", iconKey: "FaSnowflake", colorClass: "bg-sky-100 text-sky-700" },
];

export function getBadgeIcon(iconKey: string) {
  return ICON_MAP[iconKey] ?? FaMedal;
}
