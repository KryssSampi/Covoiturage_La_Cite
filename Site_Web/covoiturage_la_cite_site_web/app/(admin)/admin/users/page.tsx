"use client";

import { useEffect, useState } from "react";
import { getUsersAction, suspendUserAction, AdminUser } from "@/features/admin/services/admin.users.actions";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    getUsersAction().then(setUsers);
  }, []);

  return (
    <>
      <h1>Gestion des utilisateurs</h1>

      {users.map(u => (
        <div key={u.id}>
          {u.email} — {u.status}

          {u.status === "Active" && (
            <button
              onClick={async () => {
                await suspendUserAction(u.id, "Violation des règles");
                setUsers(await getUsersAction());
              }}
            >
              Suspendre
            </button>
          )}
        </div>
      ))}
    </>
  );
}
