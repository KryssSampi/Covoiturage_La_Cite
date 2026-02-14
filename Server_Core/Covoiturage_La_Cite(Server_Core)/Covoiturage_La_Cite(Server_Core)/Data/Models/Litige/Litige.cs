using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("litiges")]
[Index("DemandeurId", Name = "idx_litiges_demandeur")]
[Index("ReservationId", Name = "idx_litiges_reservation")]
[Index("Statut", Name = "idx_litiges_statut")]
[Index("TrajetId", Name = "idx_litiges_trajet")]
public partial class Litige
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trajet_id")]
    public Guid TrajetId { get; set; }

    [Column("reservation_id")]
    public Guid ReservationId { get; set; }

    [Column("demandeur_id")]
    public Guid DemandeurId { get; set; }

    [Column("mise_en_cause_id")]
    public Guid MiseEnCauseId { get; set; }

    [Column("motif")]
    [StringLength(50)]
    public string Motif { get; set; } = null!;

    [Column("description")]
    public string Description { get; set; } = null!;

    [Column("montant_conteste")]
    [Precision(10, 2)]
    public decimal? MontantConteste { get; set; }

    [Column("statut")]
    [StringLength(40)]
    public string Statut { get; set; } = null!;

    [Column("admin_responsable_id")]
    public Guid? AdminResponsableId { get; set; }

    [Column("decision")]
    public string? Decision { get; set; }

    [Column("montant_rembourse")]
    [Precision(10, 2)]
    public decimal? MontantRembourse { get; set; }

    [Column("preuves_json", TypeName = "jsonb")]
    public string? PreuvesJson { get; set; }

    [Column("date_creation", TypeName = "timestamp without time zone")]
    public DateTime DateCreation { get; set; }

    [Column("date_resolution", TypeName = "timestamp without time zone")]
    public DateTime? DateResolution { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("AdminResponsableId")]
    [InverseProperty("LitigeAdminResponsables")]
    public virtual User? AdminResponsable { get; set; }

    [ForeignKey("DemandeurId")]
    [InverseProperty("LitigeDemandeurs")]
    public virtual User Demandeur { get; set; } = null!;

    [ForeignKey("MiseEnCauseId")]
    [InverseProperty("LitigeMiseEnCauses")]
    public virtual User MiseEnCause { get; set; } = null!;

    [ForeignKey("ReservationId")]
    [InverseProperty("Litiges")]
    public virtual Reservation Reservation { get; set; } = null!;

    [ForeignKey("TrajetId")]
    [InverseProperty("Litiges")]
    public virtual Trajet Trajet { get; set; } = null!;
}
