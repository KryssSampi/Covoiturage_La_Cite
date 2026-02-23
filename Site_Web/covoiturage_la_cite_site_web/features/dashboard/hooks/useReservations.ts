// features/dashboard/hooks/useReservations.ts

import { useMemo, useState } from "react";
import { FIXTURES_RESERVATIONS } from "@/tests/fixtures/dashboard/reservations.fixtures";
import { ReservationStatus, type Reservation } from "../types";

function sortReservations(reservations: Reservation[]): Reservation[] {
  const inProgress = reservations.filter(r => r.status === ReservationStatus.InProgress);
  const upcoming   = reservations
    .filter(r => r.status === ReservationStatus.Confirmed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pending    = reservations
    .filter(r => r.status === ReservationStatus.Pending)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const cancelled  = reservations
    .filter(r => r.status === ReservationStatus.Cancelled)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const done       = reservations
    .filter(r => r.status === ReservationStatus.Completed)
    .sort((a, b) => new Date(b.doneDate!).getTime() - new Date(a.doneDate!).getTime());

  return [...inProgress, ...upcoming, ...pending, ...cancelled, ...done];
}

interface UseReservationsReturn {
  reservations: Reservation[];
  isEmpty: boolean;
  openPassengerLists: boolean[];
  togglePassengerList: (index: number) => void;
  closePassengerList: (index: number) => void;
}

export function useReservations(): UseReservationsReturn {
  // TODO: Remplacer FIXTURES_RESERVATIONS par un appel API
  // const { data } = useQuery({ queryKey: ["my-reservations"], queryFn: fetchMyReservations });

  const reservations = useMemo(() => sortReservations(FIXTURES_RESERVATIONS), []);

  const [openPassengerLists, setOpenPassengerLists] = useState<boolean[]>(
    () => reservations.map(() => false)
  );

  const togglePassengerList = (index: number) =>
    setOpenPassengerLists((prev) => prev.map((v, i) => (i === index ? !v : v)));

  const closePassengerList = (index: number) =>
    setOpenPassengerLists((prev) => prev.map((v, i) => (i === index ? false : v)));

  return {
    reservations,
    isEmpty: reservations.length === 0,
    openPassengerLists,
    togglePassengerList,
    closePassengerList,
  };
}
