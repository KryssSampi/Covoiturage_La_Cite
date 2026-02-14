/* AUTO-GENERATED - 2026-02-14 03:38:02 */
/* Table: preferences_utilisateur */

export class PreferencesUtilisateurModel {
  id: string;
  user_id: string;
  musique_acceptee?: boolean | null;
  conversation_acceptee?: boolean | null;
  animaux_acceptes?: boolean | null;
  fumeur_accepte?: boolean | null;
  niveau_conversation?: string | null;
  genre_musique_prefere?: string | null;
  partage_auto_urgence?: boolean | null;
  created_at: string;
  updated_at: string;

  constructor(data?: Partial<PreferencesUtilisateurModel>) {
    if (data) Object.assign(this, data);
  }
}
