/**
 * @file useAuth.tsx
 * @deprecated Ce fichier est un doublon de `useloginForm.tsx`.
 *
 * Utilisez `useloginForm` depuis `@/features/auth/hooks/useloginForm` à la place.
 * Ce fichier ne sera pas maintenu et sera supprimé dans une prochaine itération.
 *
 * Différences avec le hook canonique :
 * - `useloginForm` valide le domaine `@la-citec.ca` et intègre `useLoader`
 * - `useAuth` (ce fichier) utilisait le domaine `@collegelacite.ca` sans `useLoader`
 *
 * @see features/auth/hooks/useloginForm.tsx
 */

// Re-export vers le hook canonique pour assurer la rétrocompatibilité
export { useLoginForm } from "./useloginForm";
