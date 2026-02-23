/* AUTO-GENERATED - 2026-02-15 02:48:20 */
/* Table: preferences_utilisateur */

export class PreferencesUtilisateurModel {
  id: string = '';
  user_id: string = '';
  musique_acceptee?: boolean | null = null;
  conversation_acceptee?: boolean | null = null;
  animaux_acceptes?: boolean | null = null;
  fumeur_accepte?: boolean | null = null;
  niveau_conversation?: string | null = null;
  genre_musique_prefere?: string | null = null;
  partage_auto_urgence?: boolean | null = null;
  created_at: string = '';
  updated_at: string = '';

  constructor(data?: Partial<PreferencesUtilisateurModel>) {
    if (data) Object.assign(this, data);
  }
}
