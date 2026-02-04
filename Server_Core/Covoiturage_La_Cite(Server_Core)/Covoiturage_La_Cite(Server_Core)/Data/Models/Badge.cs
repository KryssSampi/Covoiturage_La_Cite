using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("badges")]
[Index("Code", Name = "badges_code_key", IsUnique = true)]
[Index("Categorie", Name = "idx_badges_categorie")]
[Index("Code", Name = "idx_badges_code")]
public partial class Badge
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("code")]
    [StringLength(50)]
    public string Code { get; set; } = null!;

    [Column("nom")]
    [StringLength(100)]
    public string Nom { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("icon_url")]
    [StringLength(500)]
    public string? IconUrl { get; set; }

    [Column("categorie")]
    [StringLength(30)]
    public string Categorie { get; set; } = null!;

    [Column("condition_json", TypeName = "jsonb")]
    public string ConditionJson { get; set; } = null!;

    [Column("points_reputation_requis")]
    public int? PointsReputationRequis { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Badge")]
    public virtual ICollection<UsersBadge> UsersBadges { get; set; } = new List<UsersBadge>();
}
