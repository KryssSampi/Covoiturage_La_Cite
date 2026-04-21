import { getUsers, suspendUser } from "@/features/admin/services/admin.users.service";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <>
      <h1>Utilisateurs</h1>
      {users.map(u => (
        <div key={u.id}>
          {u.email} — {u.status}
          <form action={suspendUser.bind(null, u.id)}>
            <button>Suspendre</button>
          </form>
        </div>
      ))}
    </>
  );
}
