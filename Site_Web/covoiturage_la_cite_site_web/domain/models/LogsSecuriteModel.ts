/* AUTO-GENERATED - 2026-02-15 02:48:19 */
/* Table: logs_securite */

export class LogsSecuriteModel {
  id: string = '';
  user_id?: string | null = null;
  event_type: string = '';
  ip_address?: string | null = null;
  localisation?: object | null = null;
  device_info?: string | null = null;
  details_json?: object | null = null;
  severity: string = '';
  created_at: string = '';

  constructor(data?: Partial<LogsSecuriteModel>) {
    if (data) Object.assign(this, data);
  }
}
