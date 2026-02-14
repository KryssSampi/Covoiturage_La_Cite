using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

/// <summary>
/// Évaluations mutuelles après trajets
/// </summary>
[Table("evaluations")]
[Index("EvaluateurId", Name = "idx_eval_evaluateur")]
[Index("EvalueId", Name = "idx_eval_evalue")]
[Index("Note", Name = "idx_eval_note")]
[Index("ReservationId", Name = "idx_eval_reservation")]
[Index("TrajetId", Name = "idx_eval_trajet")]
[Index("ReservationId", "EvaluateurId", Name = "uq_eval_reservation_evaluateur", IsUnique = true)]
public partial class Evaluation
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trajet_id")]
    public Guid TrajetId { get; set; }

    [Column("reservation_id")]
    public Guid ReservationId { get; set; }

    [Column("evaluateur_id")]
    public Guid EvaluateurId { get; set; }

    [Column("evalue_id")]
    public Guid EvalueId { get; set; }

    [Column("role_evalue")]
    [StringLength(20)]
    public string RoleEvalue { get; set; } = null!;

    [Column("note")]
    public int Note { get; set; }

    [Column("commentaire")]
    public string? Commentaire { get; set; }

    [Column("tags_json", TypeName = "jsonb")]
    public string? TagsJson { get; set; }

    [Column("signale_comme_inapproprie")]
    public bool SignaleCommeInapproprie { get; set; }

    [Column("masque")]
    public bool Masque { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("EvaluateurId")]
    [InverseProperty("EvaluationEvaluateurs")]
    public virtual User Evaluateur { get; set; } = null!;

    [ForeignKey("EvalueId")]
    [InverseProperty("EvaluationEvalues")]
    public virtual User Evalue { get; set; } = null!;

    [ForeignKey("ReservationId")]
    [InverseProperty("Evaluations")]
    public virtual Reservation Reservation { get; set; } = null!;

    [ForeignKey("TrajetId")]
    [InverseProperty("Evaluations")]
    public virtual Trajet Trajet { get; set; } = null!;
}
