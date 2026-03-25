/**
 * Données fictives pour la page Mes Finances.
 */
import type { FinancesPageModel } from "@/features/finances/types/finances.types";

export const FIXTURES_FINANCES: FinancesPageModel = {
  conducteurId: "ahmed-ibrahim",
  soldeDisponible: 148.25,
  soldeTransit: 20.00,
  penalitesTotal: -13.75,
  revenuMensuel: 150.75,
  objectifMensuel: 200,
  commission: 0.15,
  nbTrajetsPayants: 12,
  transactions: [
    { id: "t1", type: "revenu",   montant:  17.00, description: "Revenu trajet — Pauline D.",   date: "2026-03-13", trajetId: "tr1", nbPassagers: 1, statut: "confirme" },
    { id: "t2", type: "transit",  montant:  20.00, description: "En transit — Karima B.",        date: "2026-03-13", trajetId: "tr2", nbPassagers: 1, statut: "transit"  },
    { id: "t3", type: "revenu",   montant:  34.00, description: "Revenu trajet — Samuel O. +1", date: "2026-03-12", trajetId: "tr3", nbPassagers: 2, statut: "confirme" },
    { id: "t4", type: "penalite", montant:  -5.00, description: "Pénalité — Retard 18 min",     date: "2026-03-10", trajetId: "tr4", nbPassagers: 0, statut: "penalite" },
    { id: "t5", type: "revenu",   montant:  12.75, description: "Revenu trajet — Ahmed T.",     date: "2026-03-10", trajetId: "tr5", nbPassagers: 1, statut: "confirme" },
  ],
  penalitesActives: [
    { id: "p1", raison: "retard",     montant: -5.00, date: "2026-03-10", trajetId: "tr4", description: "Retard 18 min", routeDescription: "Ottawa → Campus · 10 mars 08h30", estContestable: true  },
    { id: "p2", raison: "annulation", montant: -8.75, date: "2026-03-08", trajetId: "tr6", description: "Annulation <24h", routeDescription: "Ottawa → Montréal · 8 mars · 2 passagers", estContestable: false },
  ],
  historiqueParSemaine: [
    { label: "S1 fév",   montantPrincipal: 28, montantSecondaire: 0, nbTrajets: 2 },
    { label: "S2 fév",   montantPrincipal: 35, montantSecondaire: 0, nbTrajets: 3 },
    { label: "S3 fév",   montantPrincipal: 22, montantSecondaire: 0, nbTrajets: 2 },
    { label: "S4 fév",   montantPrincipal: 40, montantSecondaire: 0, nbTrajets: 3 },
    { label: "S9 mars",  montantPrincipal: 45, montantSecondaire: 5, nbTrajets: 3 },
    { label: "S10 mars", montantPrincipal: 62, montantSecondaire: 0, nbTrajets: 4 },
    { label: "S11 mars", montantPrincipal: 32, montantSecondaire: 9, nbTrajets: 2 },
    { label: "S12",      montantPrincipal:  0, montantSecondaire: 0, nbTrajets: 0 },
  ],
  scatterGainParHeure: [
    { heureDepartISO: "06:00", montant: 12, nbPassagers: 1, creneau: "matin" },
    { heureDepartISO: "07:00", montant: 22, nbPassagers: 1, creneau: "matin" },
    { heureDepartISO: "08:00", montant: 34, nbPassagers: 2, creneau: "matin" },
    { heureDepartISO: "08:30", montant: 27, nbPassagers: 1, creneau: "matin" },
    { heureDepartISO: "09:00", montant: 20, nbPassagers: 1, creneau: "midi"  },
    { heureDepartISO: "12:00", montant:  8, nbPassagers: 1, creneau: "midi"  },
    { heureDepartISO: "17:00", montant: 18, nbPassagers: 1, creneau: "soir"  },
    { heureDepartISO: "17:30", montant: 25, nbPassagers: 1, creneau: "soir"  },
    { heureDepartISO: "18:00", montant: 33, nbPassagers: 2, creneau: "soir"  },
    { heureDepartISO: "19:00", montant: 22, nbPassagers: 1, creneau: "soir"  },
  ],
  ibanMasque: "CA●● ●●●● ●●●● 4821",
  periodeActive: "mois",
};
