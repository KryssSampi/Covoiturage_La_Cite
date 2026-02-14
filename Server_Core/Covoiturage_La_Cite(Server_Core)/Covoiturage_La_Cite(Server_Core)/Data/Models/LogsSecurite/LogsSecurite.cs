using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("logs_securite")]
[Index("CreatedAt", Name = "idx_logs_sec_created")]
[Index("EventType", Name = "idx_logs_sec_event")]
[Index("Severity", Name = "idx_logs_sec_severity")]
[Index("UserId", Name = "idx_logs_sec_user")]
public partial class LogsSecurite
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid? UserId { get; set; }

    [Column("event_type")]
    [StringLength(50)]
    public string EventType { get; set; } = null!;

    [Column("ip_address")]
    [StringLength(45)]
    public string? IpAddress { get; set; }

    [Column("localisation", TypeName = "geography(Point,4326)")]
    public Point? Localisation { get; set; }

    [Column("device_info")]
    public string? DeviceInfo { get; set; }

    [Column("details_json", TypeName = "jsonb")]
    public string? DetailsJson { get; set; }

    [Column("severity")]
    [StringLength(20)]
    public string Severity { get; set; } = null!;

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("LogsSecurites")]
    public virtual User? User { get; set; }
}
