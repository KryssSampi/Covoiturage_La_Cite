import { adminFetch } from "@/server/admin/admin.api";

export interface AdminUser {
  id: string;
  email: string;
  status: "Active" | "Suspended";
}

export function getUsers(): Promise<AdminUser[]> {
  return adminFetch("/api/admin/users");
}

export function suspendUser(userId: string, reason: string) {
  return adminFetch(`/api/admin/users/${userId}/suspend`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
}
