using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

/// <summary>
/// Système de points GO! Score pour gamification
/// </summary>
[Table("points_reputation")]
[Index("PointsActuels", Name = "idx_reputation_points")]
[Index("UserId", Name = "idx_reputation_user")]
[Index("UserId", Name = "points_reputation_user_id_key", IsUnique = true)]
public partial class PointsReputation
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("points_actuels")]
    public int PointsActuels { get; set; }

    [Column("points_maximum")]
    public int PointsMaximum { get; set; }

    [Column("historique_json", TypeName = "jsonb")]
    public string? HistoriqueJson { get; set; }

    [Column("derniere_modification", TypeName = "timestamp without time zone")]
    public DateTime DerniereModification { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("PointsReputation")]
    public virtual User User { get; set; } = null!;
}
