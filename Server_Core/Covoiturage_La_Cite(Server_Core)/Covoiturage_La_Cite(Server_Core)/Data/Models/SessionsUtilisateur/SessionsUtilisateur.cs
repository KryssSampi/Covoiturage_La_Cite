using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("sessions_utilisateur")]
[Index("ExpiresAt", Name = "idx_sessions_expires")]
[Index("SessionToken", Name = "idx_sessions_token")]
[Index("UserId", Name = "idx_sessions_user")]
[Index("SessionToken", Name = "sessions_utilisateur_session_token_key", IsUnique = true)]
public partial class SessionsUtilisateur
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("session_token")]
    [StringLength(500)]
    public string SessionToken { get; set; } = null!;

    [Column("refresh_token")]
    [StringLength(500)]
    public string? RefreshToken { get; set; }

    [Column("device_info")]
    public string? DeviceInfo { get; set; }

    [Column("ip_address")]
    [StringLength(45)]
    public string? IpAddress { get; set; }

    [Column("localisation_connexion", TypeName = "geography(Point,4326)")]
    public Point? LocalisationConnexion { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("expires_at", TypeName = "timestamp without time zone")]
    public DateTime ExpiresAt { get; set; }

    [Column("last_activity", TypeName = "timestamp without time zone")]
    public DateTime LastActivity { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("SessionsUtilisateurs")]
    public virtual User User { get; set; } = null!;
}
