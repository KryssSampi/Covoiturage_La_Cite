import { redirect } from "next/navigation";
import { getCurrentUser } from "./adminPolicy";

export async function adminGuard() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role.toLowerCase() !== "admin") redirect("/");
}
