/* AUTO-GENERATED - 2026-02-15 02:48:21 */
/* Table: spatial_ref_sys */

export class SpatialRefSyModel {
  srid: number = 0;
  auth_name?: string | null = null;
  auth_srid?: number | null = null;
  srtext?: string | null = null;
  proj4text?: string | null = null;

  constructor(data?: Partial<SpatialRefSyModel>) {
    if (data) Object.assign(this, data);
  }
}
