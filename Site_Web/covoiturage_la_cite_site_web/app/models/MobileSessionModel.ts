/* AUTO-GENERATED - 2026-02-14 03:38:01 */
/* Table: mobile_sessions */

export class MobileSessionModel {
  id: string;
  user_id: string;
  device_id: string;
  push_token?: string | null;
  platform: string;
  app_version?: string | null;
  os_version?: string | null;
  session_token: string;
  refresh_token?: string | null;
  push_enabled: boolean;
  location_permission: boolean;
  created_at: string;
  last_activity: string;
  expires_at: string;

  constructor(data?: Partial<MobileSessionModel>) {
    if (data) Object.assign(this, data);
  }
}
