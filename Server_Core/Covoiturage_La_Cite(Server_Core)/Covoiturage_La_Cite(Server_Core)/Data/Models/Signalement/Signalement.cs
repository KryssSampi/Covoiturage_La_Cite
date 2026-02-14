using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("signalements")]
[Index("Gravite", Name = "idx_signal_gravite")]
[Index("SignaleId", Name = "idx_signal_signale")]
[Index("SignaleurId", Name = "idx_signal_signaleur")]
[Index("Statut", Name = "idx_signal_statut")]
[Index("TrajetId", Name = "idx_signal_trajet")]
public partial class Signalement
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("signaleur_id")]
    public Guid SignaleurId { get; set; }

    [Column("signale_id")]
    public Guid SignaleId { get; set; }

    [Column("trajet_id")]
    public Guid? TrajetId { get; set; }

    [Column("reservation_id")]
    public Guid? ReservationId { get; set; }

    [Column("motif")]
    [StringLength(50)]
    public string Motif { get; set; } = null!;

    [Column("gravite")]
    [StringLength(20)]
    public string Gravite { get; set; } = null!;

    [Column("description")]
    public string Description { get; set; } = null!;

    [Column("statut")]
    [StringLength(20)]
    public string Statut { get; set; } = null!;

    [Column("admin_responsable_id")]
    public Guid? AdminResponsableId { get; set; }

    [Column("action_prise")]
    public string? ActionPrise { get; set; }

    [Column("penalite_appliquee")]
    public bool PenaliteAppliquee { get; set; }

    [Column("penalite_id")]
    public Guid? PenaliteId { get; set; }

    [Column("date_signalement", TypeName = "timestamp without time zone")]
    public DateTime DateSignalement { get; set; }

    [Column("date_resolution", TypeName = "timestamp without time zone")]
    public DateTime? DateResolution { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("AdminResponsableId")]
    [InverseProperty("SignalementAdminResponsables")]
    public virtual User? AdminResponsable { get; set; }

    [ForeignKey("PenaliteId")]
    [InverseProperty("Signalements")]
    public virtual Penalite? Penalite { get; set; }

    [ForeignKey("ReservationId")]
    [InverseProperty("Signalements")]
    public virtual Reservation? Reservation { get; set; }

    [ForeignKey("SignaleId")]
    [InverseProperty("SignalementSignales")]
    public virtual User Signale { get; set; } = null!;

    [ForeignKey("SignaleurId")]
    [InverseProperty("SignalementSignaleurs")]
    public virtual User Signaleur { get; set; } = null!;

    [ForeignKey("TrajetId")]
    [InverseProperty("Signalements")]
    public virtual Trajet? Trajet { get; set; }
}
