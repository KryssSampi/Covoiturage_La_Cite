/* AUTO-GENERATED - 2026-02-15 02:48:19 */
/* Table: mobile_device_info */

export class MobileDeviceInfoModel {
  id: string = '';
  session_id: string = '';
  device_model?: string | null = null;
  manufacturer?: string | null = null;
  screen_resolution?: string | null = null;
  battery_level?: number | null = null;
  low_power_mode?: boolean | null = null;
  network_type?: string | null = null;
  last_known_position?: object | null = null;
  updated_at: string = '';

  constructor(data?: Partial<MobileDeviceInfoModel>) {
    if (data) Object.assign(this, data);
  }
}
