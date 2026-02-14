using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("participations_defis")]
[Index("Complete", Name = "idx_participations_complete")]
[Index("DefiId", Name = "idx_participations_defi")]
[Index("UserId", Name = "idx_participations_user")]
[Index("DefiId", "UserId", Name = "uq_participation", IsUnique = true)]
public partial class ParticipationsDefi
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("defi_id")]
    public Guid DefiId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("progression_actuelle")]
    [Precision(10, 2)]
    public decimal ProgressionActuelle { get; set; }

    [Column("objectif_cible")]
    [Precision(10, 2)]
    public decimal ObjectifCible { get; set; }

    [Column("complete")]
    public bool Complete { get; set; }

    [Column("date_inscription", TypeName = "timestamp without time zone")]
    public DateTime DateInscription { get; set; }

    [Column("date_completion", TypeName = "timestamp without time zone")]
    public DateTime? DateCompletion { get; set; }

    [ForeignKey("DefiId")]
    [InverseProperty("ParticipationsDefis")]
    public virtual DefisEcologique Defi { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("ParticipationsDefis")]
    public virtual User User { get; set; } = null!;
}
