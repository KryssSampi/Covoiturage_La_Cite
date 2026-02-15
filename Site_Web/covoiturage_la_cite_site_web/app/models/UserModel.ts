/* AUTO-GENERATED - 2026-02-15 02:48:22 */
/* Table: users */

export class UserModel {
  id: string = ''; 
  email: string = '';
  microsoft_id: string = '';
  nom: string = '';
  photo_url?: string | null;
  photo_verification_url?: string | null;
  role: string = '';
  is_active: boolean = false;
  profile_verified: boolean = false;
  verification_date?: string | null;
  verified_by?: string | null;
  dernier_login?: string | null;
  preferences_json?: object | null = null;
  created_at: string = '' ;
  updated_at: string = '' ;
  prenom?: string | null;

  constructor(data?: Partial<UserModel>) {
    if (data) Object.assign(this, data);
  }
}
