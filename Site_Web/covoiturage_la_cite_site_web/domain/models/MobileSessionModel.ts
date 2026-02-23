/* AUTO-GENERATED - 2026-02-15 02:48:19 */
/* Table: mobile_sessions */

export class MobileSessionModel {
  id: string = '';
  user_id: string = '';
  device_id: string = '';
  push_token?: string | null = null;
  platform: string = '';
  app_version?: string | null = null;
  os_version?: string | null = null;
  session_token: string = '';
  refresh_token?: string | null = null;
  push_enabled: boolean = false;
  location_permission: boolean = false;
  created_at: string = '';
  last_activity: string = '';
  expires_at: string = '';

  constructor(data?: Partial<MobileSessionModel>) {
    if (data) Object.assign(this, data);
  }
}
