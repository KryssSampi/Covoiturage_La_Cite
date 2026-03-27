// Shim — le barrel canonique est features/reservations/ (C-3 Chantier C)
// Importer depuis @/features/reservations pour tout ce qui est reservation.
export { ReservationStatusBadge } from "./components/ReservationStatusBadge";
export { ReservationDetailCard } from "./components/ReservationDetailCard";
export { ReservationActions } from "./components/ReservationActions";
export { ReservationRequestToast } from "./components/ReservationRequestToast";
export { CancelConfirmToast } from "./components/CancelConfirmToast";
export { ReservationDecisionToast } from "./components/ReservationDecisionToast";
export type { DecisionType, DecisionDetails } from "./components/ReservationDecisionToast";
