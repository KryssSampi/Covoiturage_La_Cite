"use client";

/**
 * @file BrouillonsPage.tsx
 * @description Page de listing des brouillons de trajets (conducteur uniquement).
 * Utilise ListDetailPage avec DraftTripCard et DraftDetailView.
 */

import { useCallback } from "react";
import { ListDetailPage } from "@/shared/components/list-detail-page";
import type { DraftTrip } from "@/features/brouillons/types";
import { DraftTripCard }   from "./DraftTripCard";
import { DraftDetailView } from "./DraftDetailView";
import { useDrafts }       from "../hooks/useDrafts";

export function BrouillonsPage() {
  const { drafts, sortOptions, searchKeys, emptyMessage } = useDrafts();

  // Rendu d'une carte dans la liste
  const renderCard = useCallback(
    (draft: DraftTrip, isSelected: boolean) => (
      <DraftTripCard draft={draft} isSelected={isSelected} />
    ),
    [],
  );

  // Rendu du panneau détail : CreateTripForm pré-rempli
  const renderDetail = useCallback(
    (draft: DraftTrip) => <DraftDetailView draft={draft} />,
    [],
  );

  return (
    <ListDetailPage
      items={drafts}
      renderCard={renderCard}
      renderDetail={renderDetail}
      sortOptions={sortOptions}
      searchKeys={searchKeys}
      emptyMessage={emptyMessage}
      itemParamKey="brouillonid"
    />
  );
}
