"use server";

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

export interface FinanceData {
  totalRevenue: number;
  totalTransactions: number;
  platformShare: number;
  driverShare: number;
  averageTransactionValue: number;
  pendingPayouts: number;
  failedTransactions: number;
}

export interface Transaction {
  id: string;
  reservationId: string;
  driverId: string;
  passengerId: string;
  amount: number;
  driverShare: number;
  platformShare: number;
  status: "Pending" | "Captured" | "Refunded" | "Failed";
  paymentMethod: string;
  createdAt: string;
}

export interface Penalty {
  id: string;
  userId: string;
  reason: string;
  amount: number;
  status: "Active" | "Paid" | "Waived";
  createdAt: string;
}

export async function getFinanceAnalyticsAction(): Promise<FinanceData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch("/api/admin/finance/analytics", {}, token);
}

export async function getTransactionsAction(): Promise<Transaction[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch("/api/admin/finance/transactions", {}, token);
}

export async function getPenaltiesAction(): Promise<Penalty[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch("/api/admin/finance/penalties", {}, token);
}

export async function wavePenaltyAction(penaltyId: string, reason: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch(
    `/api/admin/finance/penalties/${penaltyId}/wave`,
    {
      method: "PUT",
      body: JSON.stringify({ reason }),
    },
    token
  );
}

export async function generateFinanceReportAction(startDate: string, endDate: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch(
    "/api/admin/finance/report",
    {
      method: "POST",
      body: JSON.stringify({ startDate, endDate }),
    },
    token
  );
}
