using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("zones_campus")]
[Index("Actif", Name = "idx_zones_actif")]
[Index("Code", Name = "idx_zones_code")]
[Index("TypeZone", Name = "idx_zones_type")]
[Index("Code", Name = "zones_campus_code_key", IsUnique = true)]
public partial class ZonesCampus
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("nom")]
    [StringLength(100)]
    public string Nom { get; set; } = null!;

    [Column("code")]
    [StringLength(50)]
    public string Code { get; set; } = null!;

    [Column("position", TypeName = "geography(Point,4326)")]
    public Point Position { get; set; } = null!;

    [Column("perimetre", TypeName = "geography(Polygon,4326)")]
    public Polygon? Perimetre { get; set; }

    [Column("type_zone")]
    [StringLength(30)]
    public string TypeZone { get; set; } = null!;

    [Column("instructions")]
    public string? Instructions { get; set; }

    [Column("photo_url")]
    [StringLength(500)]
    public string? PhotoUrl { get; set; }

    [Column("actif")]
    public bool Actif { get; set; }

    [Column("capacite")]
    public int? Capacite { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("Zone")]
    public virtual ICollection<GeofencesMobile> GeofencesMobiles { get; set; } = new List<GeofencesMobile>();

    [InverseProperty("ZoneArrivee")]
    public virtual ICollection<Trajet> TrajetZoneArrivees { get; set; } = new List<Trajet>();

    [InverseProperty("ZoneDepart")]
    public virtual ICollection<Trajet> TrajetZoneDeparts { get; set; } = new List<Trajet>();
}
