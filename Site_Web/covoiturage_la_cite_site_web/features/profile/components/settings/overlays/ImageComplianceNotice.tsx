"use client";

import Link from "next/link";

interface ImageComplianceNoticeProps {
  isFR: boolean;
  position?: "absolute" | "inline";
}

export function ImageComplianceNotice({ isFR, position = "absolute" }: ImageComplianceNoticeProps) {
  const positionClass =
    position === "absolute"
      ? "absolute bottom-3 left-4"
      : "mt-3";

  return (
    <div className={`${positionClass} max-w-md rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-800`}>
      {isFR ? (
        <>
          Les images choisies doivent respecter les{" "}
          <Link href="/conditions" className="font-semibold underline hover:text-amber-900">
            conditions d&apos;utilisation
          </Link>
          . Toute image inappropriée peut entraîner une suppression du contenu, une suspension ou un bannissement à durée indéterminée.
        </>
      ) : (
        <>
          Selected images must comply with the{" "}
          <Link href="/conditions" className="font-semibold underline hover:text-amber-900">
            terms of use
          </Link>
          . Any inappropriate image may lead to content removal, account suspension, or an indefinite ban.
        </>
      )}
    </div>
  );
}
