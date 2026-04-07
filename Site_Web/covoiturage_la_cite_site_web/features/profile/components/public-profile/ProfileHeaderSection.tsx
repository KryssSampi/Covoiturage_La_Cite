/**
 * ProfileHeaderSection - En-tête avec avatar, infos, bio et boutons d'action
 * Anciennement dans [id]/page.tsx lignes 313-369
 */

"use client";

import Image from "next/image";
import { FaCircleCheck, FaHeart, FaUserPlus } from "react-icons/fa6";
import { Language } from "@/core/state/app_state";

interface ProfileHeaderSectionProps {
  avatarUrl?: string;
  fullName: string;
  isProfileVerified: boolean;
  schoolRoleLabel: string;
  atlacite: string;
  actually: string;
  role: string;
  bio?: string;
  bioLabel: string;
  isSelf: boolean;
  isLiked: boolean;
  likeCount: number;
  subscriptionLabel: string;
  onLike: () => void;
  onFavorite: () => void;
}

export function ProfileHeaderSection({
  avatarUrl,
  fullName,
  isProfileVerified,
  schoolRoleLabel,
  atlacite,
  actually,
  role,
  bio,
  bioLabel,
  isSelf,
  isLiked,
  likeCount,
  subscriptionLabel,
  onLike,
  onFavorite,
}: ProfileHeaderSectionProps) {
  return (
    <div className="bg-gray-50 px-5 py-1 mb-5 rounded-lg shadow-lg relative">
      <div className="mb-6 flex items-center gap-6">
        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gray-200">
          <Image
            src={avatarUrl ?? "/assets/placeholder/placeholer-profile-picture.png"}
            alt={fullName}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{fullName}</h2>
              {isProfileVerified && (
                <FaCircleCheck className="text-blue-500" size={18} />
              )}
            </div>
            <p className="text-md text-gray-500">
              {schoolRoleLabel} {atlacite} — {actually} {role}
            </p>
            {bio && (
              <p className="mt-2 text-md leading-relaxed text-gray-600 max-w-2xl">
                <span className="font-semibold">{bioLabel}:</span> {bio}
              </p>
            )}
          </div>
          {!isSelf && (
            <div className="flex gap-2 absolute right-5 bottom-10">
              <button
                onClick={onLike}
                className={`flex flex-col items-center rounded-4xl px-5 justify-center ${
                  isLiked ? "bg-rose-500 text-white" : "border border-rose-500 text-rose-500"
                }`}
              >
                <div className="flex items-center gap-1">
                  <FaHeart size={18} />
                  <span className="text-sm font-bold">{likeCount}</span>
                </div>
              </button>
              <button
                onClick={onFavorite}
                className="flex flex-row gap-3 items-center rounded-lg px-5 py-3 justify-center bg-blue-600 text-white"
              >
                <FaUserPlus size={22} />
                <span className="text-lg">{subscriptionLabel}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
