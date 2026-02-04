using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("geofence_events")]
[Index("GeofenceId", Name = "idx_geofence_events_fence")]
[Index("EventTime", Name = "idx_geofence_events_time")]
[Index("UserId", Name = "idx_geofence_events_user")]
public partial class GeofenceEvent
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("geofence_id")]
    public Guid GeofenceId { get; set; }

    [Column("event_type")]
    [StringLength(10)]
    public string EventType { get; set; } = null!;

    [Column("position", TypeName = "geography(Point,4326)")]
    public Point Position { get; set; } = null!;

    [Column("event_time", TypeName = "timestamp without time zone")]
    public DateTime EventTime { get; set; }

    [Column("metadata_json", TypeName = "jsonb")]
    public string? MetadataJson { get; set; }

    [ForeignKey("GeofenceId")]
    [InverseProperty("GeofenceEvents")]
    public virtual GeofencesMobile Geofence { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("GeofenceEvents")]
    public virtual User User { get; set; } = null!;
}
