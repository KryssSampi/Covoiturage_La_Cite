"use client";

/**
 * Page Mes Favoris — Lieux, Utilisateurs, Alertes.
 * Les sous-composants sont importés depuis ./components/.
 */

import React from "react";
import {
  FaCircleCheck, FaChartBar, FaTriangleExclamation, FaPlus,
} from "react-icons/fa6";
import FeatureHeader from "@/shared/components/FeatureHeader";
import { useFavoris } from "../hooks/useFavoris";
import { Language, useAppState } from "@/core/state/app_state";

// ─── Sous-composants UI ──────────────────────────────────────────────────────
import Card       from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import TrendMsg   from "./ui/TrendMsg";

// ─── Sous-composants feature ─────────────────────────────────────────────────
import TabBar         from "./TabBar";
import LieuItem       from "./LieuItem";
import StatsStrip     from "./StatsStrip";
import UserCard       from "./UserCard";
import AlerteCard     from "./AlerteCard";
import AddLieuOverlay from "./AddLieuOverlay";
import AddUserOverlay from "./AddUserOverlay";

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PAGE PRINCIPALE FAVORIS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export default function FavorisPage() {
  const {
    ongletActif, setOngletActif,
    lieux, conducteursFavoris, passagersFavoris, alertes, stats,
    usersSearch,
    overlayLieu, setOverlayLieu,
    overlayUser, setOverlayUser,
    supprimerLieu,
  } = useFavoris();

  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  const totalUtilisateurs = conducteursFavoris.length + passagersFavoris.length;

  return (
    <div className="min-h-screen bg-[#f0f4fb]">
      {/* En-tÃªte */}
      <FeatureHeader
        breadcrumb={isFR ? "Mes Favoris" : "My Favourites"}
        title={isFR ? "Mes Favoris" : "My Favourites"}
        subtitle={isFR ? "Lieux, conducteurs, passagers et alertes de trajets enregistrés" : "Saved places, drivers, passengers and trip alerts"}
      >
        <TabBar
          active={ongletActif}
          onChange={(v) => setOngletActif(v as "lieux" | "utilisateurs" | "alertes")}
          counts={{ lieux: lieux.length, utilisateurs: totalUtilisateurs, alertes: alertes.length }}
        />
      </FeatureHeader>

      {/* Contenu principal */}
      <div className="px-6 md:px-10 pt-5 pb-3">

        {/* â”€â”€ ONGLET LIEUX â”€â”€ */}
        {ongletActif === "lieux" && (
          <>

            <Card>
              <CardHeader
                title={isFR ? "Lieux Favoris" : "Favourite Places"}
                dotColor="#08316e"
                right={
                  <button
                    onClick={() => setOverlayLieu(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#08316e] bg-[rgba(8,49,110,0.07)] px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-[rgba(8,49,110,0.13)] transition-colors"
                  >
                    <FaPlus size={9} /> {isFR ? 'Ajouter un lieu' : 'Add a place'}
                  </button>
                }
              />
              <div className="flex flex-col gap-2 px-5 pt-3 pb-1.5">
                {lieux.map((lieu, i) => (
                  <LieuItem key={lieu.id} lieu={lieu} delay={i * 60} onDelete={supprimerLieu} />
                ))}
              </div>
              <StatsStrip stats={stats} />
            </Card>
            <TrendMsg variant="up" icon={<FaCircleCheck className="text-[#0aad6a]" />}>
              {isFR
                ? <><strong>Campus La Cité est votre lieu le plus utilisé</strong> avec 24 des 32 trajets du mois.</>
                : <><strong>Campus La Cité is your most used place</strong> with 24 of the 32 trips this month.</>}
            </TrendMsg>
          </>
        )}

        {/* â”€â”€ ONGLET UTILISATEURS â”€â”€ */}
        {ongletActif === "utilisateurs" && (
          <>
            {/* Conducteurs */}
            <Card className="mb-4">
              <CardHeader
                title={isFR ? "Conducteurs Favoris" : "Favourite Drivers"}
                dotColor="#08316e"
                right={
                  <button
                    onClick={() => setOverlayUser(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#08316e] bg-[rgba(8,49,110,0.07)] px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-[rgba(8,49,110,0.13)] transition-colors"
                  >
                    <FaPlus size={9} /> {isFR ? 'Ajouter' : 'Add'}
                  </button>
                }
              />
              <div className="flex flex-col gap-2 px-5 pt-3 pb-4">
                {conducteursFavoris.map((u, i) => (
                  <UserCard key={u.id} user={u} delay={i * 60} />
                ))}
              </div>
            </Card>

            {/* Passagers */}
            <Card>
              <CardHeader
                title={isFR ? "Passagers Favoris" : "Favourite Passengers"}
                dotColor="#0aad6a"
                right={
                  <button
                    onClick={() => setOverlayUser(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#0aad6a] bg-[rgba(10,173,106,0.07)] px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-[rgba(10,173,106,0.13)] transition-colors"
                  >
                    <FaPlus size={9} /> {isFR ? 'Ajouter' : 'Add'}
                  </button>
                }
              />
              <div className="flex flex-col gap-2 px-5 pt-3 pb-4">
                {passagersFavoris.map((u, i) => (
                  <UserCard key={u.id} user={u} delay={i * 60} />
                ))}
              </div>
            </Card>
            <TrendMsg variant="stable" icon={<FaChartBar className="text-[#08316e]" />}>
              {isFR
                ? <><strong>Vos 3 conducteurs favoris ont une note moyenne de 4.77/5.</strong></>
                : <><strong>Your 3 favourite drivers have an average rating of 4.77/5.</strong></>}
            </TrendMsg>
          </>
        )}

        {/* â”€â”€ ONGLET ALERTES â”€â”€ */}
        {ongletActif === "alertes" && (
          <>

            <Card>
              <CardHeader
                title={isFR ? "Alertes de Trajets" : "Trip Alerts"}
                dotColor="#c8960a"
                right={
                  <span className="text-[11px] text-[#7a90b8]">{alertes.length} {isFR ? 'alertes' : 'alerts'}</span>
                }
              />
              <div className="flex flex-col gap-2 px-5 pt-3 pb-4">
                {alertes.map((a, i) => (
                  <AlerteCard key={a.id} alerte={a} delay={i * 70} />
                ))}
              </div>
            </Card>
            <TrendMsg variant="warn" icon={<FaTriangleExclamation className="text-[#c8960a]" />}>
              {isFR
                ? <><strong>Alerte Campus → Gatineau sans correspondance depuis 5 jours.</strong></>
                : <><strong>Alert Campus → Gatineau with no match for 5 days.</strong></>}
            </TrendMsg>
          </>
        )}
      </div>

      {/* Overlays */}
      <AddLieuOverlay open={overlayLieu} onClose={() => setOverlayLieu(false)} />
      <AddUserOverlay open={overlayUser} onClose={() => setOverlayUser(false)} usersSearch={usersSearch} />
    </div>
  );
}