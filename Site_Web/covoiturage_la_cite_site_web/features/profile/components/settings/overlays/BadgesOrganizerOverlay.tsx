"use client";

import { FaXmark } from "react-icons/fa6";
import { ProfileBadgeOption, getBadgeIcon } from "../constants/badgeCatalog";

interface BadgesOrganizerOverlayProps {
  isOpen: boolean;
  isFR: boolean;
  allBadges: ProfileBadgeOption[];
  selectedBadgeIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onClose: () => void;
}

const MAX_VISIBLE_BADGES = 9;

export function BadgesOrganizerOverlay({
  isOpen,
  isFR,
  allBadges,
  selectedBadgeIds,
  onSelectionChange,
  onClose,
}: BadgesOrganizerOverlayProps) {
  if (!isOpen) return null;

  const toggleBadge = (badgeId: string) => {
    if (selectedBadgeIds.includes(badgeId)) {
      onSelectionChange(selectedBadgeIds.filter((id) => id !== badgeId));
      return;
    }

    if (selectedBadgeIds.length >= MAX_VISIBLE_BADGES) return;
    onSelectionChange([...selectedBadgeIds, badgeId]);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {isFR ? "Organisation des badges publics" : "Public badges organizer"}
            </h3>
            <p className="text-xs text-gray-500">
              {selectedBadgeIds.length} / {MAX_VISIBLE_BADGES} {isFR ? "badges visibles sélectionnés" : "visible badges selected"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <FaXmark size={16} />
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allBadges.map((badge) => {
              const Icon = getBadgeIcon(badge.iconKey);
              const isSelected = selectedBadgeIds.includes(badge.id);
              const disableUnchecked = selectedBadgeIds.length >= MAX_VISIBLE_BADGES && !isSelected;

              return (
                <button
                  key={badge.id}
                  type="button"
                  disabled={disableUnchecked}
                  onClick={() => toggleBadge(badge.id)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    isSelected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
                  } ${disableUnchecked ? "cursor-not-allowed opacity-45" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${badge.colorClass}`}>
                        <Icon size={18} />
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {isFR ? badge.nameFr : badge.nameEn}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleBadge(badge.id)}
                      disabled={disableUnchecked}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
