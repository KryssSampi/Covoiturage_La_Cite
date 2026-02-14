/* AUTO-GENERATED - 2026-02-14 03:38:01 */
/* Table: logs_securite */

export class LogsSecuriteModel {
  id: string;
  user_id?: string | null;
  event_type: string;
  ip_address?: string | null;
  localisation?: any | null;
  device_info?: string | null;
  details_json?: any | null;
  severity: string;
  created_at: string;

  constructor(data?: Partial<LogsSecuriteModel>) {
    if (data) Object.assign(this, data);
  }
}
