"use client";

/**
 * En-tête partagé pour les pages de features (Statistiques, Favoris, GoBoard, Finances).
 * Image de fond + dégradé bleu du coin inférieur-droit vers le coin supérieur-gauche (~70% de la hauteur).
 */

import React from "react";
import Image from "next/image";
import { Language, useAppState } from "@/core/state/app_state";

interface FeatureHeaderProps {
  /** Libellé affiché dans le breadcrumb après "Tableau de bord /" */
  breadcrumb: string;
  /** Titre principal (peut contenir du JSX, ex: <span>Go!</span> Board) */
  title: React.ReactNode;
  /** Sous-titre descriptif */
  subtitle: string;
  /** Contenu additionnel sous le sous-titre (ex: PeriodSelector) */
  children?: React.ReactNode;
}

export default function FeatureHeader({ breadcrumb, title, subtitle, children }: FeatureHeaderProps) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  return (
    <div className="relative overflow-hidden px-6 md:px-10 pt-8 pb-7">
      {/* Image de fond couvrant tout le header */}
      <Image
        src="/img/list-detail-background.png"
        alt=""
        fill
        className="absolute inset-0 object-cover w-full h-full pointer-events-none"
        priority
      />

      {/* Dégradé bleu : du bottom-right vers le top-left, couvrant ~70% de la hauteur */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top left, rgba(8,49,110,0.92) 0%, rgba(13,68,144,0.78) 35%, rgba(26,92,176,0.45) 55%, transparent 70%)",
        }}
      />

      {/* Bulle décorative */}
      <div className="absolute -top-17.5 -right-17.5 w-70 h-70 rounded-full bg-[rgba(255,255,255,0.06)] pointer-events-none" />

      {/* Contenu texte */}
      <div className="relative z-10">
        <div className="text-xs text-[rgba(255,255,255,0.65)] mb-2.5 tracking-wide">
          {isFR ? "Tableau de bord" : "Dashboard"} / <span className="text-white font-semibold">{breadcrumb}</span>
        </div>
        <h1 className="font-['Syne',sans-serif] font-extrabold text-2xl md:text-[28px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
          {title}
        </h1>
        <p className="text-[rgba(255,255,255,0.75)] text-[13px] mt-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  );
}
