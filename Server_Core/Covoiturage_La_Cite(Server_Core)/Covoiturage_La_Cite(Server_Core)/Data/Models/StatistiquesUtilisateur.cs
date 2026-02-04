using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("statistiques_utilisateur")]
[Index("UserId", Name = "idx_stats_user")]
[Index("DateStats", Name = "idx_stats_user_date")]
[Index("UserId", "DateStats", Name = "uq_user_date_stats", IsUnique = true)]
public partial class StatistiquesUtilisateur
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("date_stats")]
    public DateOnly DateStats { get; set; }

    [Column("trajets_conducteur")]
    public int TrajetsConducteur { get; set; }

    [Column("trajets_passager")]
    public int TrajetsPassager { get; set; }

    [Column("km_parcourus")]
    [Precision(10, 2)]
    public decimal KmParcourus { get; set; }

    [Column("co2_economise_kg")]
    [Precision(10, 2)]
    public decimal Co2EconomiseKg { get; set; }

    [Column("economie_financiere_estimee")]
    [Precision(10, 2)]
    public decimal EconomieFinanciereEstimee { get; set; }

    [Column("revenus_conducteur")]
    [Precision(10, 2)]
    public decimal RevenusConducteur { get; set; }

    [Column("depenses_passager")]
    [Precision(10, 2)]
    public decimal DepensesPassager { get; set; }

    [Column("evaluations_recues")]
    public int EvaluationsRecues { get; set; }

    [Column("note_moyenne")]
    [Precision(3, 2)]
    public decimal? NoteMoyenne { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("StatistiquesUtilisateurs")]
    public virtual User User { get; set; } = null!;
}
