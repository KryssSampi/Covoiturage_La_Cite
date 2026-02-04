using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

/// <summary>
/// Réservations de places sur les trajets
/// </summary>
[Table("reservations")]
[Index("DateDemande", Name = "idx_reservations_date_demande")]
[Index("DateExpiration", Name = "idx_reservations_expiration")]
[Index("PassagerId", Name = "idx_reservations_passager")]
[Index("Statut", Name = "idx_reservations_statut")]
[Index("TrajetId", Name = "idx_reservations_trajet")]
public partial class Reservation
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trajet_id")]
    public Guid TrajetId { get; set; }

    [Column("passager_id")]
    public Guid PassagerId { get; set; }

    [Column("statut")]
    [StringLength(30)]
    public string Statut { get; set; } = null!;

    [Column("montant_total")]
    [Precision(10, 2)]
    public decimal MontantTotal { get; set; }

    [Column("montant_rembourse")]
    [Precision(10, 2)]
    public decimal? MontantRembourse { get; set; }

    [Column("date_demande", TypeName = "timestamp without time zone")]
    public DateTime DateDemande { get; set; }

    [Column("date_expiration", TypeName = "timestamp without time zone")]
    public DateTime DateExpiration { get; set; }

    [Column("date_reponse_conducteur", TypeName = "timestamp without time zone")]
    public DateTime? DateReponseConducteur { get; set; }

    [Column("date_annulation", TypeName = "timestamp without time zone")]
    public DateTime? DateAnnulation { get; set; }

    [Column("raison_annulation")]
    public string? RaisonAnnulation { get; set; }

    [Column("raison_refus")]
    public string? RaisonRefus { get; set; }

    [Column("position_file_attente")]
    public int? PositionFileAttente { get; set; }

    [Column("embarquement_confirme_conducteur")]
    public bool EmbarquementConfirmeConducteur { get; set; }

    [Column("embarquement_confirme_passager")]
    public bool EmbarquementConfirmePassager { get; set; }

    [Column("heure_embarquement", TypeName = "timestamp without time zone")]
    public DateTime? HeureEmbarquement { get; set; }

    [Column("score_compatibilite")]
    [Precision(5, 2)]
    public decimal? ScoreCompatibilite { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("ReservationAcceptee")]
    public virtual ICollection<DemandesMultiplesTracking> DemandesMultiplesTrackings { get; set; } = new List<DemandesMultiplesTracking>();

    [InverseProperty("Reservation")]
    public virtual ICollection<Evaluation> Evaluations { get; set; } = new List<Evaluation>();

    [InverseProperty("Reservation")]
    public virtual ICollection<Litige> Litiges { get; set; } = new List<Litige>();

    [ForeignKey("PassagerId")]
    [InverseProperty("Reservations")]
    public virtual User Passager { get; set; } = null!;

    [InverseProperty("Reservation")]
    public virtual ICollection<Penalite> Penalites { get; set; } = new List<Penalite>();

    [InverseProperty("Reservation")]
    public virtual ICollection<Signalement> Signalements { get; set; } = new List<Signalement>();

    [ForeignKey("TrajetId")]
    [InverseProperty("Reservations")]
    public virtual Trajet Trajet { get; set; } = null!;

    [InverseProperty("Reservation")]
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
