/* AUTO-GENERATED - 2026-02-14 03:38:02 */
/* Table: spatial_ref_sys */

export class SpatialRefSyModel {
  srid: number;
  auth_name?: string | null;
  auth_srid?: number | null;
  srtext?: string | null;
  proj4text?: string | null;

  constructor(data?: Partial<SpatialRefSyModel>) {
    if (data) Object.assign(this, data);
  }
}
