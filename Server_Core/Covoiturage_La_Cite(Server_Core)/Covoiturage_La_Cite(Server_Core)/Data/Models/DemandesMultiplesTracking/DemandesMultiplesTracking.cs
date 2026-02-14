using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("demandes_multiples_tracking")]
[Index("ReservationAccepteeId", Name = "idx_demandes_acceptee")]
[Index("PassagerId", Name = "idx_demandes_passager")]
[Index("RechercheId", Name = "idx_demandes_recherche")]
public partial class DemandesMultiplesTracking
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("passager_id")]
    public Guid PassagerId { get; set; }

    [Column("recherche_id")]
    public Guid? RechercheId { get; set; }

    [Column("reservation_ids_json", TypeName = "jsonb")]
    public string ReservationIdsJson { get; set; } = null!;

    [Column("nb_demandes_actives")]
    public int NbDemandesActives { get; set; }

    [Column("nb_demandes_max")]
    public int NbDemandesMax { get; set; }

    [Column("reservation_acceptee_id")]
    public Guid? ReservationAccepteeId { get; set; }

    [Column("date_auto_annulation", TypeName = "timestamp without time zone")]
    public DateTime? DateAutoAnnulation { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("PassagerId")]
    [InverseProperty("DemandesMultiplesTrackings")]
    public virtual User Passager { get; set; } = null!;

    [ForeignKey("ReservationAccepteeId")]
    [InverseProperty("DemandesMultiplesTrackings")]
    public virtual Reservation? ReservationAcceptee { get; set; }
}
