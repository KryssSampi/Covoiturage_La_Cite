"use client";

import { ReactNode } from "react";

interface TripListHeaderProps {
  title: ReactNode;
  isFirst?: boolean;
  isBlocked?: boolean;
}

export function TripListHeader({ title, isFirst = false, isBlocked = false }: TripListHeaderProps) {
  return (
    <p
      style={{
        margin: isFirst ? "0 0 2px" : "12px 0 2px",
        fontSize: 12,
        fontWeight: 800,
        color: isBlocked ? "#9a3412" : "#08316e",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {title}
    </p>
  );
}
