/**
 * ProfileBanner - Bannière du profil public
 * Anciennement dans [id]/page.tsx lignes 301-311
 */

"use client";

import Image from "next/image";

interface ProfileBannerProps {
  bannerSrc: string;
  alt: string;
}

export function ProfileBanner({ bannerSrc, alt }: ProfileBannerProps) {
  return (
    <div className="relative -mt-6">
      <div className="relative h-70 w-full overflow-hidden rounded-md">
        <Image
          src={bannerSrc}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
