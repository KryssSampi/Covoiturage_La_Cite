"use client";

/**
 * Page Go! Board — rôle Passager.
 * Délègue au composant partagé GoBoardRoutePage.
 */
import { GoBoardRoutePage } from "@/features/goboard/components/GoBoardRoutePage";

export default function PassengerGoBoardRoutePage() {
  return <GoBoardRoutePage expectedRole="passenger" />;
}