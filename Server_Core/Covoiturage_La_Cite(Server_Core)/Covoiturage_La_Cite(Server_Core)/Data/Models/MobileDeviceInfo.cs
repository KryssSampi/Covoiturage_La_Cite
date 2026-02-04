using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("mobile_device_info")]
[Index("SessionId", Name = "idx_device_info_session")]
[Index("SessionId", Name = "mobile_device_info_session_id_key", IsUnique = true)]
public partial class MobileDeviceInfo
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("session_id")]
    public Guid SessionId { get; set; }

    [Column("device_model")]
    [StringLength(100)]
    public string? DeviceModel { get; set; }

    [Column("manufacturer")]
    [StringLength(50)]
    public string? Manufacturer { get; set; }

    [Column("screen_resolution")]
    [StringLength(20)]
    public string? ScreenResolution { get; set; }

    [Column("battery_level")]
    public int? BatteryLevel { get; set; }

    [Column("low_power_mode")]
    public bool? LowPowerMode { get; set; }

    [Column("network_type")]
    [StringLength(10)]
    public string? NetworkType { get; set; }

    [Column("last_known_position", TypeName = "geography(Point,4326)")]
    public Point? LastKnownPosition { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("SessionId")]
    [InverseProperty("MobileDeviceInfo")]
    public virtual MobileSession Session { get; set; } = null!;
}
