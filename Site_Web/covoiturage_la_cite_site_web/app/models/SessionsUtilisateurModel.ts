/* AUTO-GENERATED - 2026-02-15 02:48:21 */
/* Table: sessions_utilisateur */

export class SessionsUtilisateurModel {
  id: string = '';
  user_id: string = '';
  session_token: string = '';
  refresh_token?: string | null = null;
  device_info?: string | null = null;
  ip_address?: string | null = null;
  localisation_connexion?: object| null = null;
  created_at: string = '';
  expires_at: string = '';
  last_activity: string = '';

  constructor(data?: Partial<SessionsUtilisateurModel>) {
    if (data) Object.assign(this, data);
  }
}
