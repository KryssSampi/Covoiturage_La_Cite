using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("alertes_urgence")]
[Index("Statut", Name = "idx_alertes_statut")]
[Index("TrajetId", Name = "idx_alertes_trajet")]
[Index("UserId", Name = "idx_alertes_user")]
public partial class AlertesUrgence
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("trajet_id")]
    public Guid? TrajetId { get; set; }

    [Column("position_alerte", TypeName = "geography(Point,4326)")]
    public Point? PositionAlerte { get; set; }

    [Column("type_urgence")]
    [StringLength(30)]
    public string TypeUrgence { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("statut")]
    [StringLength(20)]
    public string Statut { get; set; } = null!;

    [Column("contacts_notifies_json", TypeName = "jsonb")]
    public string? ContactsNotifiesJson { get; set; }

    [Column("admin_intervenant_id")]
    public Guid? AdminIntervenantId { get; set; }

    [Column("date_alerte", TypeName = "timestamp without time zone")]
    public DateTime DateAlerte { get; set; }

    [Column("date_resolution", TypeName = "timestamp without time zone")]
    public DateTime? DateResolution { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("AdminIntervenantId")]
    [InverseProperty("AlertesUrgenceAdminIntervenants")]
    public virtual User? AdminIntervenant { get; set; }

    [ForeignKey("TrajetId")]
    [InverseProperty("AlertesUrgences")]
    public virtual Trajet? Trajet { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("AlertesUrgenceUsers")]
    public virtual User User { get; set; } = null!;
}
