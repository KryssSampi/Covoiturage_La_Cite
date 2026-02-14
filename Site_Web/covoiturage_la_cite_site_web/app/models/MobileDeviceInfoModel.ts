/* AUTO-GENERATED - 2026-02-14 03:38:01 */
/* Table: mobile_device_info */

export class MobileDeviceInfoModel {
  id: string;
  session_id: string;
  device_model?: string | null;
  manufacturer?: string | null;
  screen_resolution?: string | null;
  battery_level?: number | null;
  low_power_mode?: boolean | null;
  network_type?: string | null;
  last_known_position?: any | null;
  updated_at: string;

  constructor(data?: Partial<MobileDeviceInfoModel>) {
    if (data) Object.assign(this, data);
  }
}
