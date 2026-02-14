/* AUTO-GENERATED - 2026-02-14 03:38:02 */
/* Table: sessions_utilisateur */

export class SessionsUtilisateurModel {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token?: string | null;
  device_info?: string | null;
  ip_address?: string | null;
  localisation_connexion?: any | null;
  created_at: string;
  expires_at: string;
  last_activity: string;

  constructor(data?: Partial<SessionsUtilisateurModel>) {
    if (data) Object.assign(this, data);
  }
}
