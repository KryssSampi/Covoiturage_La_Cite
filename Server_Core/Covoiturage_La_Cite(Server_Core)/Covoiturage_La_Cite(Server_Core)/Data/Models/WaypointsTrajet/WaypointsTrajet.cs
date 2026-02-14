using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("waypoints_trajet")]
[Index("TrajetId", Name = "idx_waypoints_trajet")]
[Index("TrajetId", "Ordre", Name = "uq_trajet_ordre", IsUnique = true)]
public partial class WaypointsTrajet
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trajet_id")]
    public Guid TrajetId { get; set; }

    [Column("ordre")]
    public int Ordre { get; set; }

    [Column("position", TypeName = "geography(Point,4326)")]
    public Point Position { get; set; } = null!;

    [Column("adresse")]
    public string Adresse { get; set; } = null!;

    [Column("type")]
    [StringLength(20)]
    public string Type { get; set; } = null!;

    [Column("heure_estimee", TypeName = "timestamp without time zone")]
    public DateTime? HeureEstimee { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("TrajetId")]
    [InverseProperty("WaypointsTrajets")]
    public virtual Trajet Trajet { get; set; } = null!;
}
