/* AUTO-GENERATED - 2026-02-15 02:48:22 */
/* Table: users_badges */

export class UsersBadgeModel {
  id: string = '';
  user_id: string = '';
  badge_id: string = '';
  date_obtention: string = '';
  notification_envoyee: boolean = false;

  constructor(data?: Partial<UsersBadgeModel>) {
    if (data) Object.assign(this, data);
  }
}
