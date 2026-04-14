"use client";

/**
 * Page Go! Board — rôle Conducteur.
 * Délègue au composant partagé GoBoardRoutePage.
 */
import { GoBoardRoutePage } from "@/features/goboard/components/GoBoardRoutePage";

export default function DriverGoBoardRoutePage() {
  return <GoBoardRoutePage expectedRole="driver" />;
}