// ─────────────────────────────────────────────────────────────────────────────
// shared/utils/lieu-favori-icon.tsx
// Résolveur d'icônes pour les lieux favoris
// ─────────────────────────────────────────────────────────────────────────────
import { FaGraduationCap, FaHome, FaBriefcase, FaSchool, FaCity, FaMapPin } from 'react-icons/fa';
import type { LieuFavoriIconTag } from '../types/lieu-favori.types';

/**
 * Résout un iconTag en composant React icon.
 * Utilisé par FavoritesSection, SuperSearchSection, et la légende de la carte.
 */
export function getLieuFavoriIcon(tag: LieuFavoriIconTag, className = 'text-4xl text-white') {
  switch (tag) {
    case 'campus':   return <FaGraduationCap className={className} />;
    case 'domicile': return <FaHome className={className} />;
    case 'travail':  return <FaBriefcase className={className} />;
    case 'ecole':    return <FaSchool className={className} />;
    case 'ville':    return <FaCity className={className} />;
    default:         return <FaMapPin className={className} />;
  }
}
