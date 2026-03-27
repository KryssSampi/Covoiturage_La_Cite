"use client";

/**
 * @file BrouillonsPage.tsx
 * @description Composant de listing des brouillons de trajets (conducteur uniquement).
 * Composant pur : reçoit items et callbacks de la page route.
 * Utilise ListDetailPage avec DraftTripCard et DraftDetailView.
 */

import { useCallback } from "react";
import { ListDetailPage } from "@/shared/components/list-detail-page";
import type { DraftTrip } from "@/features/brouillons/types";
import { DraftTripCard }   from "./DraftTripCard";
import { DraftDetailView } from "./DraftDetailView";
import { useDraftsConfig } from "../hooks/useDrafts";

/** Props injectées par la page route */
export interface BrouillonsPageProps {
  items: DraftTrip[];
  onRemove?: (id: string) => void;
}

export function BrouillonsPage({ items, onRemove }: BrouillonsPageProps) {
  const { filterGroups, sortOptions, searchKeys, emptyMessage } = useDraftsConfig();

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
      items={items}
      renderCard={renderCard}
      renderDetail={renderDetail}
      filterGroups={filterGroups}
      sortOptions={sortOptions}
      searchKeys={searchKeys}
      emptyMessage={emptyMessage}
      itemParamKey="brouillonid"
    />
  );
}
