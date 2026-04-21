"use server";

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

export interface ChatMessage {
  id: string;
  tripId: string;
  senderId: string;
  senderEmail: string;
  message: string;
  createdAt: string;
  isReported: boolean;
}

export interface ModerationItem {
  id: string;
  type: "Message" | "Profile" | "Review" | "Trip";
  contentId: string;
  reportedBy: string;
  reason: string;
  status: "Pending" | "Reviewing" | "Approved" | "Removed";
  content: string;
  createdAt: string;
}

export async function getModerationQueueAction(): Promise<ModerationItem[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch("/api/admin/moderations", {}, token);
}

export async function approveModerationAction(id: string, notes?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch(
    `/api/admin/moderations/${id}/approve`,
    {
      method: "PUT",
      body: JSON.stringify({ notes }),
    },
    token
  );
}

export async function removeModerationContentAction(
  id: string,
  reason: string
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch(
    `/api/admin/moderations/${id}/remove`,
    {
      method: "PUT",
      body: JSON.stringify({ reason }),
    },
    token
  );
}

export async function getReportedMessagesAction(): Promise<ChatMessage[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch("/api/admin/moderations/messages", {}, token);
}
