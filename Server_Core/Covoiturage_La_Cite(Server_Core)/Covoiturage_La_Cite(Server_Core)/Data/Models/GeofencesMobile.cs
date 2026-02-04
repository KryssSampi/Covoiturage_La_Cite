using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("geofences_mobile")]
[Index("ZoneId", Name = "idx_geofences_zone")]
public partial class GeofencesMobile
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("zone_id")]
    public Guid ZoneId { get; set; }

    [Column("nom")]
    [StringLength(100)]
    public string Nom { get; set; } = null!;

    [Column("perimetre", TypeName = "geography(Polygon,4326)")]
    public Polygon Perimetre { get; set; } = null!;

    [Column("rayon_m")]
    [Precision(8, 2)]
    public decimal? RayonM { get; set; }

    [Column("monitoring_actif")]
    public bool MonitoringActif { get; set; }

    [Column("trigger_events_json", TypeName = "jsonb")]
    public string? TriggerEventsJson { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Geofence")]
    public virtual ICollection<GeofenceEvent> GeofenceEvents { get; set; } = new List<GeofenceEvent>();

    [ForeignKey("ZoneId")]
    [InverseProperty("GeofencesMobiles")]
    public virtual ZonesCampus Zone { get; set; } = null!;
}
