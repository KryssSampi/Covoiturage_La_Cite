/**
 * server/services/index.ts — Barrel export de tous les services de délégation
 */

// ── Infrastructure ────────────────────────────────────────────────────────────
export { SERVER_CORE_URL, DEFAULT_TIMEOUT, API_PREFIX } from '../config';
export type { ApiResponse, RequestOptions } from '../http-client';

// ── Auth ──────────────────────────────────────────────────────────────────────
export { AuthService } from './AuthService';

// ── User ──────────────────────────────────────────────────────────────────────
export { UserService } from './UserService';
export type { PaginatedResult } from './UserService';

// ── Trip ──────────────────────────────────────────────────────────────────────
export { TripService } from './TripService';

// ── Reservation ───────────────────────────────────────────────────────────────
export { ReservationService } from './ReservationService';

// ── Vehicle ───────────────────────────────────────────────────────────────────
export { VehicleService } from './VehicleService';

// ── Finance ───────────────────────────────────────────────────────────────────
export { FinanceService } from './FinanceService';

// ── Notification ──────────────────────────────────────────────────────────────
export { NotificationService } from './NotificationService';

// ── Social (Review, Favorite, Report) ─────────────────────────────────────────
export { ReviewService, FavoriteService, ReportService } from './SocialService';

// ── Gamification (Badge, Challenge, GoTask, GoBoard) ──────────────────────────
export { BadgeService, ChallengeService, GoTaskService } from './GamificationService';
export type { GoTaskResponseDto, GoBoardResponseDto } from './GamificationService';

// ── GPS & SOS ─────────────────────────────────────────────────────────────────
export { GpsService, SosService } from './GpsService';

// ── Campus (Zones, Waypoints) ─────────────────────────────────────────────────
export { CampusZoneService, WaypointService } from './CampusService';

// ── Admin ─────────────────────────────────────────────────────────────────────
export { AdminService } from './AdminService';

// ── Matching ──────────────────────────────────────────────────────────────────
export { MatchingService } from './MatchingService';

// ── Security ──────────────────────────────────────────────────────────────────
export { SecurityService } from './SecurityService';

// ── PIPEDA ────────────────────────────────────────────────────────────────────
export { PipedaService } from './PipedaService';

// ── Draft (Brouillons) ───────────────────────────────────────────────────────
export { DraftService } from './DraftService';

// ── Historique ────────────────────────────────────────────────────────────────
export { HistoriqueService } from './HistoriqueService';

// ── Chat instantané ───────────────────────────────────────────────────────────
export { ChatService } from './ChatService';
export type { ChatMessageResponseDto, SendMessageDto, ConversationSummaryDto } from './ChatService';

// ── Contenu éditorial (Astuces + Nouveautés) ─────────────────────────────────
export { ContentService } from './ContentService';
export type { AstuceResponseDto, NouveauteResponseDto, CreateNouveauteDto } from './ContentService';

// ── Routing (ORS + fallback synthétique) ─────────────────────────────────────
export { RoutingService } from './RoutingService';
export type { SimpleRoute, CircuitRoute } from './RoutingService';
