/**
 * server/services/FinanceService.ts — Délégation Finances vers Server Core
 *
 * Endpoints : api/finances/*
 */

import { get, post, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DriverFinanceSummaryDto {
  soldeDisponible: number;
  soldeEnTransit: number;
  soldePenalites: number;
  tauxPrelevement: number;
  gainSemaine: number;
  gainMois: number;
  commissionTotale: number;
  nbTrajetsPayants: number;
  nbPenalitesActives: number;
  currency: string;
}

export interface PassengerFinanceSummaryDto {
  totalSpent: number;
  pendingHoldings: number;
  activePenalties: number;
}

export interface TransactionResponseDto {
  id: string;
  tripId: string;
  reservationId: string;
  passengerId: string;
  driverId: string;
  amount: number;
  platformFee: number;
  driverAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface PenaltyResponseDto {
  id: string;
  userId: string;
  type: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

export interface WithdrawalResponseDto {
  id: string;
  driverProfileId: string;
  amount: number;
  status: string;
  requestedAt: string;
  processedAt?: string;
}

export interface PreAuthorizeRequest {
  reservationId: string;
  amount: number;
}

export interface CaptureRequest {
  reservationId: string;
}

export interface RefundRequest {
  transactionId: string;
  reason?: string;
}

export interface WithdrawalRequest {
  amount: number;
}

export interface ContestPenaltyRequest {
  reason: string;
}

export interface BankAccountResponseDto {
  id: string;
  userId: string;
  accountType: string;
  institutionName: string;
  maskedAccountNumber: string;
  isDefault: boolean;
  createdAt: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const FinanceService = {

  /** Résumé financier du conducteur */
  async getDriverSummary(options?: RequestOptions): Promise<ApiResponse<DriverFinanceSummaryDto>> {
    return get<DriverFinanceSummaryDto>('api/finances/driver/summary', options);
  },

  /** Résumé financier du passager */
  async getPassengerSummary(options?: RequestOptions): Promise<ApiResponse<PassengerFinanceSummaryDto>> {
    return get<PassengerFinanceSummaryDto>('api/finances/passenger/summary', options);
  },

  /** Liste des transactions */
  async getTransactions(role?: string, from?: string, to?: string, options?: RequestOptions): Promise<ApiResponse<TransactionResponseDto[]>> {
    return get<TransactionResponseDto[]>('api/finances/transactions', {
      ...options,
      params: { ...(role ? { role } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}), ...options?.params },
    });
  },

  /** Détail d'une transaction */
  async getTransaction(transactionId: string, options?: RequestOptions): Promise<ApiResponse<TransactionResponseDto>> {
    return get<TransactionResponseDto>(`api/finances/transactions/${transactionId}`, options);
  },

  /** Pré-autorisation de paiement */
  async preAuthorize(data: PreAuthorizeRequest, options?: RequestOptions): Promise<ApiResponse<TransactionResponseDto>> {
    return post<TransactionResponseDto>('api/finances/pre-authorize', data, options);
  },

  /** Capturer le paiement */
  async capture(data: CaptureRequest, options?: RequestOptions): Promise<ApiResponse<TransactionResponseDto>> {
    return post<TransactionResponseDto>('api/finances/capture', data, options);
  },

  /** Rembourser */
  async refund(data: RefundRequest, options?: RequestOptions): Promise<ApiResponse<TransactionResponseDto>> {
    return post<TransactionResponseDto>('api/finances/refund', data, options);
  },

  /** Liste des pénalités */
  async getPenalties(options?: RequestOptions): Promise<ApiResponse<PenaltyResponseDto[]>> {
    return get<PenaltyResponseDto[]>('api/finances/penalties', options);
  },

  /** Contester une pénalité */
  async contestPenalty(penaltyId: string, data: ContestPenaltyRequest, options?: RequestOptions): Promise<ApiResponse<PenaltyResponseDto>> {
    return post<PenaltyResponseDto>(`api/finances/penalties/${penaltyId}/contest`, data, options);
  },

  /** Demander un retrait */
  async requestWithdrawal(data: WithdrawalRequest, options?: RequestOptions): Promise<ApiResponse<WithdrawalResponseDto>> {
    return post<WithdrawalResponseDto>('api/finances/withdraw', data, options);
  },

  /** Liste des retraits */
  async getWithdrawals(options?: RequestOptions): Promise<ApiResponse<WithdrawalResponseDto[]>> {
    return get<WithdrawalResponseDto[]>('api/finances/withdrawals', options);
  },

  /** Comptes bancaires enregistrés */
  async getBankAccounts(options?: RequestOptions): Promise<ApiResponse<BankAccountResponseDto[]>> {
    return get<BankAccountResponseDto[]>('api/finances/bank-accounts', options);
  },
};
