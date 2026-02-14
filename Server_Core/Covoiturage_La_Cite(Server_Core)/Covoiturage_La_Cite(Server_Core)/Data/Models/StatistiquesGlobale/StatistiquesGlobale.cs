using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("statistiques_globales")]
[Index("DateStats", Name = "idx_stats_globales_date")]
[Index("DateStats", Name = "statistiques_globales_date_stats_key", IsUnique = true)]
public partial class StatistiquesGlobale
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("date_stats")]
    public DateOnly DateStats { get; set; }

    [Column("trajets_total")]
    public int TrajetsTotal { get; set; }

    [Column("trajets_completes")]
    public int TrajetsCompletes { get; set; }

    [Column("trajets_annules")]
    public int TrajetsAnnules { get; set; }

    [Column("demandes_multiples_utilisees")]
    public int DemandesMultiplesUtilisees { get; set; }

    [Column("revenus_app")]
    [Precision(12, 2)]
    public decimal RevenusApp { get; set; }

    [Column("revenus_conducteurs")]
    [Precision(12, 2)]
    public decimal RevenusConducteurs { get; set; }

    [Column("nouveaux_users")]
    public int NouveauxUsers { get; set; }

    [Column("users_actifs")]
    public int UsersActifs { get; set; }

    [Column("note_moyenne_plateforme")]
    [Precision(3, 2)]
    public decimal? NoteMoyennePlateforme { get; set; }

    [Column("co2_total_economise_kg")]
    [Precision(12, 2)]
    public decimal Co2TotalEconomiseKg { get; set; }

    [Column("nb_urgences_activees")]
    public int NbUrgencesActivees { get; set; }

    [Column("nb_signalements")]
    public int NbSignalements { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }
}
