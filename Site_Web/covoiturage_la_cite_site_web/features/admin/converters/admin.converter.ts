/**
 * admin.converter.ts
 * ViewConverter : DTO Server Core â†’ types UI admin
 * Source de vÃ©ritÃ© : AdminDtos.cs, AdminFeatureModuleController.cs
 */

// â”€â”€ Types UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface AdminStatCard {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal';
  change?: string;
}

export interface AdminUserView {
  id: string;
  email: string;
  status: 'Active' | 'Suspended' | 'Banned' | 'Deleted';
  statusLabel: string;
  statusColor: string;
}

export interface AdminDriverView {
  id: string;
  email: string;
  pendingSince?: string;
}

export interface AdminVehicleView {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  seats: number;
  isApproved: boolean;
  lastInspection?: string;
  documents: {
    insurance: boolean;
    registration: boolean;
    inspection: boolean;
  };
  docsComplete: boolean;
}

export interface AdminReportView {
  id: string;
  userId: string;
  reportedUserId: string;
  category: string;
  description: string;
  status: string;
  statusColor: string;
  severity: string;
  severityColor: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdminTransactionView {
  id: string;
  reservationId: string;
  driverId: string;
  passengerId: string;
  amount: number;
  driverShare: number;
  platformShare: number;
  status: string;
  statusColor: string;
  paymentMethod: string;
  createdAt: string;
}

export interface AdminPenaltyView {
  id: string;
  userId: string;
  reason: string;
  amount: number;
  status: string;
  statusColor: string;
  createdAt: string;
  isWaivable: boolean;
}

export interface AdminModerationView {
  id: string;
  type: string;
  contentId: string;
  reportedBy: string;
  reason: string;
  status: string;
  statusColor: string;
  content: string;
  contentPreview?: string;
  contentType?: string;
  reportedById?: string;
  reportCount?: number;
  severity?: string;
  severityColor?: string;
  createdAt: string;
}

export interface AdminExportView {
  id: string;
  type: string;
  exportType?: string;
  format?: string;
  status: string;
  statusColor: string;
  createdAt: string;
  expiresAt?: string;
  downloadUrl?: string;
}

export interface AdminAuditLogView {
  id: string;
  action: string;
  adminEmail: string;
  date: string;
  time: string;
  timestamp?: string;
  actorId?: string;
  targetId?: string;
  ipAddress?: string;
  details?: string;
}

export interface AdminAnalyticsView {
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

export interface AdminDashboardStats {
  activeUsers: number;
  tripsToday: number;
  pendingDrivers: number;
  openReports: number;
  totalCO2SavedKg: number;
}

export interface AdminFinanceView {
  totalRevenue: number;
  totalTransactions: number;
  platformShare: number;
  driverShare: number;
  averageTransactionValue: number;
  pendingPayouts: number;
  failedTransactions: number;
}

export interface AdminComplianceView {
  consentCollected: number;
  consentPending: number;
  exportRequests: number;
  anonymizationRequests: number;
  lastAuditDate: string;
  lastReportGenerated: string;
}

export interface AdminUserExportView {
  id: string;
  userId: string;
  email: string;
  status: string;
  statusColor: string;
  requestedAt: string;
  exportType?: string;
  expiresAt?: string;
  downloadUrl?: string;
}

export interface AdminSettingsView {
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

// â”€â”€ Helpers couleur â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function statusColorUser(status: string): string {
  switch (status) {
    case 'Active': return 'green';
    case 'Suspended': return 'amber';
    case 'Banned': return 'red';
    case 'Deleted': return 'slate';
    default: return 'slate';
  }
}

function statusColorReport(status: string): string {
  switch (status) {
    case 'Open': return 'amber';
    case 'InReview': return 'blue';
    case 'Resolved': return 'green';
    case 'Dismissed': return 'slate';
    default: return 'slate';
  }
}

function severityColor(severity: string): string {
  switch (severity) {
    case 'Critical': return 'red';
    case 'High': return 'orange';
    case 'Medium': return 'amber';
    case 'Low': return 'slate';
    default: return 'slate';
  }
}

function statusColorTransaction(status: string): string {
  switch (status) {
    case 'Captured': return 'green';
    case 'Pending': return 'amber';
    case 'Refunded': return 'blue';
    case 'Failed': return 'red';
    default: return 'slate';
  }
}

function statusColorPenalty(status: string): string {
  switch (status) {
    case 'Active': return 'red';
    case 'Paid': return 'green';
    case 'Waived': return 'slate';
    default: return 'amber';
  }
}

function statusColorModeration(status: string): string {
  switch (status) {
    case 'Pending': return 'amber';
    case 'Reviewing': return 'blue';
    case 'Approved': return 'green';
    case 'Removed': return 'red';
    default: return 'slate';
  }
}

function statusColorExport(status: string): string {
  switch (status) {
    case 'Ready': return 'green';
    case 'Processing': return 'blue';
    case 'Pending': return 'amber';
    case 'Failed': return 'red';
    case 'Expired': return 'slate';
    default: return 'slate';
  }
}

// â”€â”€ Converters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function toAdminUserView(raw: { id: string; email: string; status: string }): AdminUserView {
  return {
    id: raw.id,
    email: raw.email,
    status: raw.status as AdminUserView['status'],
    statusLabel: raw.status,
    statusColor: statusColorUser(raw.status),
  };
}

export function toAdminDriverView(raw: { id: string; email: string }): AdminDriverView {
  return {
    id: raw.id,
    email: raw.email,
  };
}

export function toAdminVehicleView(raw: {
  id: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  seats: number;
  isApproved: boolean;
  lastInspection?: string;
  documents: { insurance: boolean; registration: boolean; inspection: boolean };
}): AdminVehicleView {
  return {
    ...raw,
    docsComplete: raw.documents.insurance && raw.documents.registration && raw.documents.inspection,
  };
}

export function toAdminReportView(raw: {
  id: string;
  userId: string;
  reportedUserId: string;
  category: string;
  description: string;
  status: string;
  severity: string;
  createdAt: string;
  resolvedAt?: string;
}): AdminReportView {
  return {
    ...raw,
    statusColor: statusColorReport(raw.status),
    severityColor: severityColor(raw.severity),
  };
}

export function toAdminTransactionView(raw: {
  id: string;
  reservationId: string;
  driverId: string;
  passengerId: string;
  amount: number;
  driverShare: number;
  platformShare: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}): AdminTransactionView {
  return {
    ...raw,
    statusColor: statusColorTransaction(raw.status),
  };
}

export function toAdminPenaltyView(raw: {
  id: string;
  userId: string;
  reason: string;
  amount: number;
  status: string;
  createdAt: string;
}): AdminPenaltyView {
  return {
    ...raw,
    statusColor: statusColorPenalty(raw.status),
    isWaivable: raw.status === 'Active',
  };
}

export function toAdminModerationView(raw: {
  id: string;
  type: string;
  contentId: string;
  reportedBy: string;
  reason: string;
  status: string;
  content: string;
  createdAt: string;
}): AdminModerationView {
  return {
    ...raw,
    statusColor: statusColorModeration(raw.status),
    contentPreview: raw.content,
    contentType: raw.type,
    reportedById: raw.reportedBy,
    reportCount: 1,
    severity: raw.status === "Pending" ? "Medium" : "Low",
    severityColor: raw.status === "Pending" ? "amber" : "slate",
  };
}

export function toAdminExportView(raw: {
  id: string;
  type: string;
  format?: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
  downloadUrl?: string;
}): AdminExportView {
  return {
    ...raw,
    exportType: raw.type,
    statusColor: statusColorExport(raw.status),
  };
}

export function toAdminUserExportView(raw: {
  id: string;
  userId: string;
  email: string;
  status: string;
  requestedAt: string;
  expiresAt?: string;
  downloadUrl?: string;
}): AdminUserExportView {
  return {
    ...raw,
    statusColor: statusColorExport(raw.status),
    exportType: "PIPEDA",
  };
}

export function toAdminAuditLogView(raw: { id: string; action: string; date: string; adminEmail: string }): AdminAuditLogView {
  const d = new Date(raw.date);
  const isValid = !Number.isNaN(d.getTime());
  const timestamp = isValid ? d.toISOString() : "";
  return {
    id: raw.id,
    action: raw.action,
    adminEmail: raw.adminEmail,
    date: isValid ? d.toLocaleDateString('fr-CA') : raw.date,
    time: isValid ? d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) : "",
    timestamp,
    actorId: raw.adminEmail,
    targetId: "",
    ipAddress: "",
    details: "",
  };
}

export function dashboardStatsToCards(stats: AdminDashboardStats): AdminStatCard[] {
  return [
    { label: 'Utilisateurs actifs', value: stats.activeUsers, icon: 'users', color: 'blue' },
    { label: 'Trajets aujourd\'hui', value: stats.tripsToday, icon: 'car', color: 'green' },
    { label: 'Conducteurs en attente', value: stats.pendingDrivers, icon: 'clock', color: 'amber' },
    { label: 'Signalements ouverts', value: stats.openReports, icon: 'alert', color: 'red' },
    { label: 'CO2 economise', value: `${stats.totalCO2SavedKg} kg`, icon: 'cloud', color: 'teal' },
  ];
}

