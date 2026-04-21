import { redirect } from "next/navigation";
import { getCurrentUser } from "./adminPolicy";

export function adminGuard() {
  const user = getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "Admin") redirect("/unauthorized");
}
