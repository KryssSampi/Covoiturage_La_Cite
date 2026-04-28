"use server";

/**
 * features/admin/services/admin.actions.ts
 * Server Actions complètes — couvre tous les endpoints AdminController +
 * AdminFeatureModuleController du Server Core.
 */

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("sc_token")?.value;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export interface AdminStats {
  activeUsers: number;
  tripsToday: number;
  pendingDrivers: number;
  openReports: number;
  totalCO2SavedKg: number;
}

export async function getDashboardStatsAction(): Promise<AdminStats> {
  const token = await getToken();
  return adminFetch("/api/admin/stats", {}, token);
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface AdminUser {
  id: string;
  email: string;
  status: "Active" | "Suspended";
}

export async function getUsersAction(): Promise<AdminUser[]> {
  const token = await getToken();
  return adminFetch("/api/admin/users", {}, token);
}

export async function suspendUserAction(userId: string, reason: string) {
  const token = await getToken();
  return adminFetch(`/api/admin/users/${userId}/suspend`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  }, token);
}

export async function reactivateUserAction(userId: string) {
  const token = await getToken();
  return adminFetch(`/api/admin/users/${userId}/reactivate`, {
    method: "PUT",
  }, token);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRIVERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PendingDriver {
  id: string;
  email: string;
}

export async function getPendingDriversAction(): Promise<PendingDriver[]> {
  const token = await getToken();
  return adminFetch("/api/admin/drivers/pending", {}, token);
}

export async function approveDriverAction(id: string) {
  const token = await getToken();
  return adminFetch(`/api/admin/drivers/${id}/approve`, { method: "PUT" }, token);
}

export async function rejectDriverAction(id: string, reason: string) {
  const token = await getToken();
  const encoded = encodeURIComponent(reason);
  return adminFetch(`/api/admin/drivers/${id}/reject?reason=${encoded}`, { method: "PUT" }, token);
}

// ═══════════════════════════════════════════════════════════════════════════════
// VEHICLES
// ═══════════════════════════════════════════════════════════════════════════════

export interface AdminVehicle {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  seats: number;
  documents: {
    insurance: boolean;
    registration: boolean;
    inspection: boolean;
  };
  isApproved: boolean;
  lastInspection?: string;
}

export type Vehicle = AdminVehicle;

export async function getVehiclesAction(): Promise<AdminVehicle[]> {
  const token = await getToken();
  return adminFetch("/api/admin/vehicles", {}, token);
}

export async function approveVehicleAction(vehicleId: string) {
  const token = await getToken();
  return adminFetch(`/api/admin/vehicles/${vehicleId}/approve`, { method: "PUT" }, token);
}

export async function rejectVehicleAction(vehicleId: string, reason: string) {
  const token = await getToken();
  return adminFetch(`/api/admin/vehicles/${vehicleId}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  }, token);
}

export async function getVehicleDocumentsAction(vehicleId: string) {
  const token = await getToken();
  return adminFetch(`/api/admin/vehicles/${vehicleId}/documents`, {}, token);
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface AdminReport {
  id: string;
  userId: string;
  reportedUserId: string;
  category: string;
  description: string;
  status: "Open" | "InReview" | "Resolved" | "Dismissed";
  severity: "Low" | "Medium" | "High" | "Critical";
  createdAt: string;
  resolvedAt?: string;
}

export type Report = AdminReport;

export async function getReportsAction(): Promise<AdminReport[]> {
  const token = await getToken();
  return adminFetch("/api/admin/reports", {}, token);
}

export async function updateReportStatusAction(reportId: string, status: string, notes?: string) {
  const token = await getToken();
  return adminFetch(`/api/admin/reports/${reportId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, notes }),
  }, token);
}

export async function dismissReportAction(reportId: string, reason: string) {
  const token = await getToken();
  return adminFetch(`/api/admin/reports/${reportId}/dismiss`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  }, token);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  totalTrips: number;
  tripsToday: number;
  totalRevenue: number;
  totalCO2Saved: number;
  averageRating: number;
  pendingApprovals: number;
  reportedIssues: number;
  userGrowthRate: number;
  tripGrowthRate: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label: string;
}

export async function getAnalyticsAction(): Promise<PlatformAnalytics> {
  const token = await getToken();
  return adminFetch("/api/admin/analytics", {}, token);
}

export async function getPlatformAnalyticsAction(): Promise<PlatformAnalytics> {
  return getAnalyticsAction();
}

export async function getUserGrowthAction(): Promise<TimeSeriesData[]> {
  const token = await getToken();
  return adminFetch("/api/admin/analytics/user-growth", {}, token);
}

export async function getTripTrendAction(): Promise<TimeSeriesData[]> {
  const token = await getToken();
  return adminFetch("/api/admin/analytics/trip-trend", {}, token);
}

export async function getRevenueAnalyticsAction(): Promise<TimeSeriesData[]> {
  const token = await getToken();
  return adminFetch("/api/admin/analytics/revenue", {}, token);
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCE
// ═══════════════════════════════════════════════════════════════════════════════

export interface FinanceData {
  totalRevenue: number;
  totalTransactions: number;
  platformShare: number;
  driverShare: number;
  averageTransactionValue: number;
  pendingPayouts: number;
  failedTransactions: number;
}

export interface AdminTransaction {
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

export interface AdminPenalty {
  id: string;
  userId: string;
  reason: string;
  amount: number;
  status: "Active" | "Paid" | "Waived";
  createdAt: string;
}

export type Transaction = AdminTransaction;
export type Penalty = AdminPenalty;

export async function getFinanceAnalyticsAction(): Promise<FinanceData> {
  const token = await getToken();
  return adminFetch("/api/admin/finance/analytics", {}, token);
}

export async function getTransactionsAction(): Promise<AdminTransaction[]> {
  const token = await getToken();
  return adminFetch("/api/admin/finance/transactions", {}, token);
}

export async function getPenaltiesAction(): Promise<AdminPenalty[]> {
  const token = await getToken();
  return adminFetch("/api/admin/finance/penalties", {}, token);
}

export async function wavePenaltyAction(penaltyId: string, reason: string) {
  const token = await getToken();
  return adminFetch(`/api/admin/finance/penalties/${penaltyId}/wave`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  }, token);
}

export async function generateFinanceReportAction(startDate: string, endDate: string) {
  const token = await getToken();
  return adminFetch("/api/admin/finance/report", {
    method: "POST",
    body: JSON.stringify({ startDate, endDate }),
  }, token);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODERATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface ModerationItem {
  id: string;
  type: "Message" | "Profile" | "Review" | "Trip" | "Report";
  contentId: string;
  reportedBy: string;
  reason: string;
  status: "Pending" | "Reviewing" | "Approved" | "Removed";
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  tripId: string;
  senderId: string;
  senderEmail: string;
  message: string;
  createdAt: string;
  isReported: boolean;
}

export async function getModerationQueueAction(): Promise<ModerationItem[]> {
  const token = await getToken();
  return adminFetch("/api/admin/moderations", {}, token);
}

export async function approveModerationAction(id: string, notes?: string) {
  const token = await getToken();
  return adminFetch(`/api/admin/moderations/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify({ notes }),
  }, token);
}

export async function removeModerationContentAction(id: string, reason: string) {
  const token = await getToken();
  return adminFetch(`/api/admin/moderations/${id}/remove`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  }, token);
}

export async function getReportedMessagesAction(): Promise<ChatMessage[]> {
  const token = await getToken();
  return adminFetch("/api/admin/moderations/messages", {}, token);
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE / PIPEDA
// ═══════════════════════════════════════════════════════════════════════════════

export interface ComplianceStatus {
  consentCollected: number;
  consentPending: number;
  exportRequests: number;
  anonymizationRequests: number;
  lastAuditDate: string;
  lastReportGenerated: string;
}

export interface UserExport {
  id: string;
  userId: string;
  email: string;
  status: "Pending" | "Processing" | "Ready" | "Expired" | "Failed";
  requestedAt: string;
  expiresAt?: string;
  downloadUrl?: string;
}

export async function getComplianceStatusAction(): Promise<ComplianceStatus> {
  const token = await getToken();
  return adminFetch("/api/admin/compliance/status", {}, token);
}

export async function getExportRequestsAction(): Promise<UserExport[]> {
  const token = await getToken();
  return adminFetch("/api/admin/compliance/exports", {}, token);
}

export async function processExportAction(exportId: string) {
  const token = await getToken();
  return adminFetch(`/api/admin/compliance/exports/${exportId}/process`, { method: "POST" }, token);
}

export async function anonymizeUserAction(userId: string, reason = "Anonymisation admin") {
  const token = await getToken();
  return adminFetch(`/api/admin/compliance/users/${userId}/anonymize`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  }, token);
}

export async function getUserExportsAction(): Promise<UserExport[]> {
  return getExportRequestsAction();
}

export async function processUserExportAction(exportId: string) {
  return processExportAction(exportId);
}

export async function getAuditLogsComplianceAction(days = 30) {
  const token = await getToken();
  return adminFetch(`/api/admin/compliance/audit-logs?days=${days}`, {}, token);
}

export async function generateComplianceReportAction() {
  const token = await getToken();
  return adminFetch("/api/admin/compliance/report", { method: "POST" }, token);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Export {
  id: string;
  type: string;
  format?: string;
  status: "Processing" | "Ready" | "Failed" | "Expired" | "Pending";
  createdAt: string;
  expiresAt?: string;
  downloadUrl?: string;
}

export async function getExportsAction(): Promise<Export[]> {
  const token = await getToken();
  return adminFetch("/api/admin/exports", {}, token);
}

export async function createExportAction(params: { type: string; format: string }) {
  const token = await getToken();
  return adminFetch("/api/admin/exports", {
    method: "POST",
    body: JSON.stringify(params),
  }, token);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGS
// ═══════════════════════════════════════════════════════════════════════════════

export interface AuditLog {
  id: string;
  action: string;
  date: string;
  adminEmail: string;
}

export async function getAuditLogsAction(): Promise<AuditLog[]> {
  const token = await getToken();
  return adminFetch("/api/admin/logs", {}, token);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PlatformSettings {
  id: string;
  smtpHost: string;
  smtpPort: number;
  corsOrigins: string[];
  jwtExpiration: number;
  maxLoginAttempts: number;
  rateLimitPerMinute: number;
  platformName: string;
  maintenanceMode: boolean;
}

export async function getSettingsAction(): Promise<PlatformSettings> {
  const token = await getToken();
  return adminFetch("/api/admin/settings", {}, token);
}

export async function updateSettingsAction(settings: Partial<PlatformSettings>) {
  const token = await getToken();
  return adminFetch("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  }, token);
}

export async function toggleMaintenanceModeAction(enabled: boolean) {
  const token = await getToken();
  return adminFetch("/api/admin/settings/maintenance", {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  }, token);
}

export async function getPlatformSettingsAction(): Promise<PlatformSettings> {
  return getSettingsAction();
}

export async function updatePlatformSettingsAction(settings: Partial<PlatformSettings>) {
  return updateSettingsAction(settings);
}

export async function removeModerationAction(id: string, reason: string) {
  return removeModerationContentAction(id, reason);
}

export async function getSignaledMessagesAction(): Promise<ChatMessage[]> {
  return getReportedMessagesAction();
}

export async function getAdminTripsAction() {
  const token = await getToken();
  return adminFetch("/api/admin/trips", {}, token);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG (admin core)
// ═══════════════════════════════════════════════════════════════════════════════

export interface PlatformConfig {
  key: string;
  value: string;
  dataType: string;
  category?: string;
  description?: string;
  updatedAt: string;
}

export async function getAllConfigAction(): Promise<PlatformConfig[]> {
  const token = await getToken();
  return adminFetch("/api/admin/config", {}, token);
}

export async function setConfigAction(key: string, value: string, dataType: string) {
  const token = await getToken();
  return adminFetch("/api/admin/config", {
    method: "PUT",
    body: JSON.stringify({ key, value, dataType }),
  }, token);
}
