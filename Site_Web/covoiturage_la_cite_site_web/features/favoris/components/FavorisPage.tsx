"use client";

/**
 * Page Mes Favoris — Composant de présentation pure.
 * Toutes les sections (Lieux, Utilisateurs, Alertes) sont affichées sur la même page.
 * Les boutons du header servent au scroll vers chaque section.
 * Aucun appel API — toutes les données et callbacks viennent des props.
 */

import React from "react";
import Link from "next/link";
import {
  FaChartBar, FaTriangleExclamation, FaPlus,
  FaMapPin, FaUserGroup, FaBell, FaMagnifyingGlass,
} from "react-icons/fa6";
import FeatureHeader from "@/shared/components/FeatureHeader";
import { useFavoris } from "../hooks/useFavoris";
import { Language, useAppState } from "@/core/state/app_state";
import type {
  FavorisApiResponse,
  FavorisCallbacks,
} from "../types/favoris.types";

// ─── Sous-composants UI ──────────────────────────────────────────────────────
import Card       from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import TrendMsg   from "./ui/TrendMsg";

// ─── Sous-composants feature ─────────────────────────────────────────────────
import LieuItem       from "./LieuItem";
import UserCard       from "./UserCard";
import AlerteCard     from "./AlerteCard";
import AddLieuOverlay from "./AddLieuOverlay";
import AddUserOverlay from "./AddUserOverlay";

// ═══════════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════════

export interface FavorisPageProps {
  /** Données chargées par la route page */
  data: FavorisApiResponse | null;
  /** Callbacks CRUD */
  callbacks: FavorisCallbacks;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE FAVORIS
// ═══════════════════════════════════════════════════════════════════════════════

export default function FavorisPage({ data, callbacks }: FavorisPageProps) {
  const {
    overlayLieu, setOverlayLieu,
    overlayUser, setOverlayUser,
    lieuxRef, usersRef, alertesRef,
    scrollTo,
  } = useFavoris();

  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  // Chargement en cours — pas encore de données
  if (!data) {
    return (
      <div className="min-h-screen bg-[#f0f4fb] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#08316e] border-t-transparent rounded-full" />
      </div>
    );
  }

  const { lieux, utilisateursFavoris, alertes, usersSearch } = data;

  // Moyenne de notes des utilisateurs favoris (pour le message conditionnel)
  const avgNote = utilisateursFavoris.length > 0
    ? (utilisateursFavoris.reduce((s, u) => s + u.note, 0) / utilisateursFavoris.length).toFixed(2)
    : "0";

  return (
    <div className="min-h-screen bg-[#f0f4fb]">
      {/* En-tête avec boutons de navigation rapide */}
      <FeatureHeader
        breadcrumb={isFR ? "Mes Favoris" : "My Favourites"}
        title={isFR ? "Mes Favoris" : "My Favourites"}
        subtitle={isFR ? "Lieux, utilisateurs et alertes de trajets enregistrés" : "Saved places, users and trip alerts"}
      >
        <div className="flex gap-1.5 mt-5">
          <button
            onClick={() => scrollTo("lieux")}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 font-['DM_Sans',sans-serif] bg-white text-[#08316e] border-none"
          >
            <FaMapPin /> {isFR ? "Lieux" : "Places"}
            <span className="inline-flex items-center justify-center w-[17px] h-[17px] rounded-full text-[9px] font-bold text-white" style={{ background: "#08316e" }}>
              {lieux.length}
            </span>
          </button>
          <button
            onClick={() => scrollTo("utilisateurs")}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 font-['DM_Sans',sans-serif] bg-white text-[#08316e] border-none"
          >
            <FaUserGroup /> {isFR ? "Utilisateurs" : "Users"}
            <span className="inline-flex items-center justify-center w-[17px] h-[17px] rounded-full text-[9px] font-bold text-white" style={{ background: "#0aad6a" }}>
              {utilisateursFavoris.length}
            </span>
          </button>
          <button
            onClick={() => scrollTo("alertes")}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 font-['DM_Sans',sans-serif] bg-white text-[#08316e] border-none"
          >
            <FaBell /> {isFR ? "Alertes" : "Alerts"}
            <span className="inline-flex items-center justify-center w-[17px] h-[17px] rounded-full text-[9px] font-bold text-white" style={{ background: "#c8960a" }}>
              {alertes.length}
            </span>
          </button>
        </div>
      </FeatureHeader>

      {/* Contenu principal — toutes les sections visibles */}
      <div className="px-6 md:px-10 pt-5 pb-8 flex flex-col gap-6">

        {/* ── SECTION LIEUX ── */}
        <div ref={lieuxRef}>
          <Card>
            <CardHeader
              title={isFR ? "Lieux Favoris" : "Favourite Places"}
              dotColor="#08316e"
              right={
                <button
                  onClick={() => setOverlayLieu(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#08316e] bg-[rgba(8,49,110,0.07)] px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-[rgba(8,49,110,0.13)] transition-colors"
                >
                  <FaPlus size={9} /> {isFR ? "Ajouter un lieu" : "Add a place"}
                </button>
              }
            />
            {lieux.length === 0 ? (
              <p className="text-[#7a90b8] text-xs text-center py-6 px-5">
                {isFR ? "Aucun lieu favori pour le moment." : "No favourite places yet."}
              </p>
            ) : (
              <div className="flex flex-col gap-2 px-5 pt-3 pb-4">
                {lieux.map((lieu, i) => (
                  <LieuItem
                    key={lieu.id}
                    lieu={lieu}
                    delay={i * 60}
                    onDelete={lieu.isAnchored ? undefined : callbacks.onDeleteLieu}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── SECTION UTILISATEURS (unique — pas de séparation par rôle) ── */}
        <div ref={usersRef}>
          <Card>
            <CardHeader
              title={isFR ? "Utilisateurs Favoris" : "Favourite Users"}
              dotColor="#08316e"
              right={
                <button
                  onClick={() => setOverlayUser(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#08316e] bg-[rgba(8,49,110,0.07)] px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-[rgba(8,49,110,0.13)] transition-colors"
                >
                  <FaPlus size={9} /> {isFR ? "Ajouter" : "Add"}
                </button>
              }
            />
            <div className="flex flex-col gap-2 px-5 pt-3 pb-4">
              {utilisateursFavoris.length === 0 ? (
                <p className="text-[#7a90b8] text-xs text-center py-4">
                  {isFR ? "Aucun utilisateur favori pour le moment." : "No favourite users yet."}
                </p>
              ) : (
                utilisateursFavoris.map((u, i) => (
                  <UserCard
                    key={u.id}
                    user={u}
                    delay={i * 60}
                    onDelete={() => callbacks.onDeleteUserFavori(u.affiniteId)}
                  />
                ))
              )}
            </div>
          </Card>
          {/* Message contextuel — seulement s'il y a des utilisateurs */}
          {utilisateursFavoris.length > 0 && (
            <TrendMsg variant="stable" icon={<FaChartBar className="text-[#08316e]" />}>
              {isFR
                ? <><strong>Vos {utilisateursFavoris.length} favoris ont une note moyenne de {avgNote}/5.</strong></>
                : <><strong>Your {utilisateursFavoris.length} favourites have an average rating of {avgNote}/5.</strong></>}
            </TrendMsg>
          )}
        </div>

        {/* ── SECTION ALERTES ── */}
        <div ref={alertesRef}>
          <Card>
            <CardHeader
              title={isFR ? "Alertes de Trajets" : "Trip Alerts"}
              dotColor="#c8960a"
              right={
                <Link
                  href="/search"
                  className="flex items-center gap-1 text-xs font-semibold text-[#c8960a] bg-[rgba(200,150,10,0.07)] px-3 py-1.5 rounded-lg no-underline hover:bg-[rgba(200,150,10,0.13)] transition-colors"
                >
                  <FaPlus size={9} /> {isFR ? "Ajouter une alerte" : "Add an alert"}
                </Link>
              }
            />
            <div className="flex flex-col gap-2 px-5 pt-3 pb-4">
              {alertes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[#7a90b8] text-xs mb-3">
                    {isFR ? "Aucune alerte configurée." : "No alerts configured."}
                  </p>
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#08316e] bg-[rgba(8,49,110,0.07)] px-4 py-2 rounded-lg no-underline hover:bg-[rgba(8,49,110,0.13)] transition-colors"
                  >
                    <FaMagnifyingGlass size={10} /> {isFR ? "Rechercher un trajet" : "Search a trip"}
                  </Link>
                </div>
              ) : (
                alertes.map((a, i) => (
                  <AlerteCard
                    key={a.id}
                    alerte={a}
                    delay={i * 70}
                    onToggle={callbacks.onToggleAlerte}
                    onDelete={callbacks.onDeleteAlerte}
                  />
                ))
              )}
            </div>
          </Card>
          {/* Message contextuel — seulement s'il y a des alertes */}
          {alertes.length > 0 && (
            <TrendMsg variant="warn" icon={<FaTriangleExclamation className="text-[#c8960a]" />}>
              {isFR
                ? <><strong>{alertes.filter(a => a.surveyIsOn).length} alerte(s) active(s)</strong> sur {alertes.length} configurée(s).</>
                : <><strong>{alertes.filter(a => a.surveyIsOn).length} active alert(s)</strong> out of {alertes.length} configured.</>}
            </TrendMsg>
          )}
        </div>
      </div>

      {/* Overlays */}
      <AddLieuOverlay
        open={overlayLieu}
        onClose={() => setOverlayLieu(false)}
        onAdd={callbacks.onAddLieu}
      />
      <AddUserOverlay
        open={overlayUser}
        onClose={() => setOverlayUser(false)}
        usersSearch={usersSearch}
        onAdd={callbacks.onAddUserFavori}
      />
    </div>
  );
}
