/* AUTO-GENERATED - 2026-02-14 03:38:03 */
/* Table: users */

export class UserModel {
  id: string = "";
  email: string = "";
  microsoft_id: string = "";
  nom_complet: string = "";
  photo_url?: string | null;
  photo_verification_url?: string | null;
  role: string = "";
  is_active: boolean = false;
  profile_verified: boolean = false;
  verification_date?: string | null;
  verified_by?: string | null;
  dernier_login?: string | null;
  preferences_json?: any | null;
  created_at: Date = new Date() ;
  updated_at: Date = new Date ();

  constructor(data?: Partial<UserModel>) {
    if (data) Object.assign(this, data);
  }
}
