/**
 * server/services/OnboardingService.ts — Délégation Onboarding vers Server Core
 *
 * Endpoints : api/onboarding/*
 */

import { get, post, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OnboardingStatusDto {
  userId: string;
  alreadySignPolitics: boolean;
  alreadySubmittedAllVehiculeDocument: boolean;
  alreadySetAProfilePicture: boolean;
  onboardingCompleted: boolean;
  role: string;
  schoolRole: string;
}

export interface OnboardingStepResult {
  success: boolean;
  message?: string;
}

export interface SetRoleRequest {
  role: string;
  schoolRole: string;
}

export interface SetPhoneRequest {
  phoneNumber: string;
}

export interface SubmitVehicleRequest {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  capacity: number;
}

export interface SubmitVehicleResponse {
  vehicleId: string;
}

export interface SubmitVehiclePhotosRequest {
  vehicleId: string;
  photoUrls: string[];
}

export interface SubmitDriverDocumentRequest {
  vehicleId: string;
  documentType: string;
  fileUrl: string;
  expiryDate?: string;
}

export interface SetProfilePictureRequest {
  avatarUrl: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const OnboardingService = {

  async getStatus(options?: RequestOptions): Promise<ApiResponse<OnboardingStatusDto>> {
    return get<OnboardingStatusDto>('api/onboarding/status', options);
  },

  async acceptPolitics(options?: RequestOptions): Promise<ApiResponse<OnboardingStepResult>> {
    return post<OnboardingStepResult>('api/onboarding/accept-politics', { accepted: true }, options);
  },

  async setRole(data: SetRoleRequest, options?: RequestOptions): Promise<ApiResponse<OnboardingStepResult>> {
    return post<OnboardingStepResult>('api/onboarding/set-role', data, options);
  },

  async setPhone(data: SetPhoneRequest, options?: RequestOptions): Promise<ApiResponse<OnboardingStepResult>> {
    return post<OnboardingStepResult>('api/onboarding/set-phone', data, options);
  },

  async submitVehicle(data: SubmitVehicleRequest, options?: RequestOptions): Promise<ApiResponse<SubmitVehicleResponse>> {
    return post<SubmitVehicleResponse>('api/onboarding/submit-vehicle', data, options);
  },

  async submitVehiclePhotos(data: SubmitVehiclePhotosRequest, options?: RequestOptions): Promise<ApiResponse<OnboardingStepResult>> {
    return post<OnboardingStepResult>('api/onboarding/submit-vehicle-photos', data, options);
  },

  async submitDocument(data: SubmitDriverDocumentRequest, options?: RequestOptions): Promise<ApiResponse<OnboardingStepResult>> {
    return post<OnboardingStepResult>('api/onboarding/submit-document', data, options);
  },

  async setProfilePicture(data: SetProfilePictureRequest, options?: RequestOptions): Promise<ApiResponse<OnboardingStepResult>> {
    return post<OnboardingStepResult>('api/onboarding/set-profile-picture', data, options);
  },

  async submitIdentityVerification(photos: string[], options?: RequestOptions): Promise<ApiResponse<OnboardingStepResult>> {
    return post<OnboardingStepResult>('api/onboarding/identity-verification', { photos }, options);
  },

  async abandonDriver(options?: RequestOptions): Promise<ApiResponse<OnboardingStepResult>> {
    return post<OnboardingStepResult>('api/onboarding/abandon-driver', {}, options);
  },
};
