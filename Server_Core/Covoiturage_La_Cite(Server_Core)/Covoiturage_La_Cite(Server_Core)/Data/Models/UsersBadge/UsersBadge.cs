using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("users_badges")]
[Index("BadgeId", Name = "idx_user_badges_badge")]
[Index("UserId", Name = "idx_user_badges_user")]
[Index("UserId", "BadgeId", Name = "uq_user_badge", IsUnique = true)]
public partial class UsersBadge
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("badge_id")]
    public Guid BadgeId { get; set; }

    [Column("date_obtention", TypeName = "timestamp without time zone")]
    public DateTime DateObtention { get; set; }

    [Column("notification_envoyee")]
    public bool NotificationEnvoyee { get; set; }

    [ForeignKey("BadgeId")]
    [InverseProperty("UsersBadges")]
    public virtual Badge Badge { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("UsersBadges")]
    public virtual User User { get; set; } = null!;
}
