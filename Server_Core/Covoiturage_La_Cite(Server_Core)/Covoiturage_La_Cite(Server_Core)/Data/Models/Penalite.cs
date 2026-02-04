using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

/// <summary>
/// Pénalités appliquées pour non-respect des règles
/// </summary>
[Table("penalites")]
[Index("DateIncident", Name = "idx_penalites_date")]
[Index("ReservationId", Name = "idx_penalites_reservation")]
[Index("Statut", Name = "idx_penalites_statut")]
[Index("TrajetId", Name = "idx_penalites_trajet")]
[Index("Type", Name = "idx_penalites_type")]
[Index("UserId", Name = "idx_penalites_user")]
public partial class Penalite
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("trajet_id")]
    public Guid? TrajetId { get; set; }

    [Column("reservation_id")]
    public Guid? ReservationId { get; set; }

    [Column("type")]
    [StringLength(50)]
    public string Type { get; set; } = null!;

    [Column("montant")]
    [Precision(10, 2)]
    public decimal Montant { get; set; }

    [Column("taux_prelevement")]
    [Precision(5, 4)]
    public decimal TauxPrelevement { get; set; }

    [Column("raison")]
    public string Raison { get; set; } = null!;

    [Column("statut")]
    [StringLength(30)]
    public string Statut { get; set; } = null!;

    [Column("montant_rembourse")]
    [Precision(10, 2)]
    public decimal? MontantRembourse { get; set; }

    [Column("justificatif_fourni")]
    public bool JustificatifFourni { get; set; }

    [Column("justificatif_url")]
    [StringLength(500)]
    public string? JustificatifUrl { get; set; }

    [Column("date_incident", TypeName = "timestamp without time zone")]
    public DateTime DateIncident { get; set; }

    [Column("date_contestation", TypeName = "timestamp without time zone")]
    public DateTime? DateContestation { get; set; }

    [Column("motif_contestation")]
    public string? MotifContestation { get; set; }

    [Column("admin_evaluateur_id")]
    public Guid? AdminEvaluateurId { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("AdminEvaluateurId")]
    [InverseProperty("PenaliteAdminEvaluateurs")]
    public virtual User? AdminEvaluateur { get; set; }

    [InverseProperty("Penalite")]
    public virtual ICollection<RemboursementsPenalite> RemboursementsPenalites { get; set; } = new List<RemboursementsPenalite>();

    [ForeignKey("ReservationId")]
    [InverseProperty("Penalites")]
    public virtual Reservation? Reservation { get; set; }

    [InverseProperty("Penalite")]
    public virtual ICollection<Signalement> Signalements { get; set; } = new List<Signalement>();

    [ForeignKey("TrajetId")]
    [InverseProperty("Penalites")]
    public virtual Trajet? Trajet { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("PenaliteUsers")]
    public virtual User User { get; set; } = null!;
}
