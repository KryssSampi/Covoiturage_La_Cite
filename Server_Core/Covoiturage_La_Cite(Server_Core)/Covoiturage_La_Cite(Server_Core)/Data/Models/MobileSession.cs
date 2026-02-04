using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("mobile_sessions")]
[Index("DeviceId", Name = "idx_mobile_sessions_device")]
[Index("SessionToken", Name = "idx_mobile_sessions_token")]
[Index("UserId", Name = "idx_mobile_sessions_user")]
[Index("DeviceId", Name = "mobile_sessions_device_id_key", IsUnique = true)]
[Index("SessionToken", Name = "mobile_sessions_session_token_key", IsUnique = true)]
public partial class MobileSession
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("device_id")]
    [StringLength(255)]
    public string DeviceId { get; set; } = null!;

    [Column("push_token")]
    [StringLength(500)]
    public string? PushToken { get; set; }

    [Column("platform")]
    [StringLength(10)]
    public string Platform { get; set; } = null!;

    [Column("app_version")]
    [StringLength(20)]
    public string? AppVersion { get; set; }

    [Column("os_version")]
    [StringLength(20)]
    public string? OsVersion { get; set; }

    [Column("session_token")]
    [StringLength(500)]
    public string SessionToken { get; set; } = null!;

    [Column("refresh_token")]
    [StringLength(500)]
    public string? RefreshToken { get; set; }

    [Column("push_enabled")]
    public bool PushEnabled { get; set; }

    [Column("location_permission")]
    public bool LocationPermission { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("last_activity", TypeName = "timestamp without time zone")]
    public DateTime LastActivity { get; set; }

    [Column("expires_at", TypeName = "timestamp without time zone")]
    public DateTime ExpiresAt { get; set; }

    [InverseProperty("Session")]
    public virtual MobileDeviceInfo? MobileDeviceInfo { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("MobileSessions")]
    public virtual User User { get; set; } = null!;
}
