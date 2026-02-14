using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("suppressions_compte")]
[Index("DateSuppression", Name = "idx_suppressions_date")]
[Index("UserId", Name = "idx_suppressions_user")]
public partial class SuppressionsCompte
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("raison")]
    [StringLength(30)]
    public string Raison { get; set; } = null!;

    [Column("commentaire")]
    public string? Commentaire { get; set; }

    [Column("donnees_anonymisees")]
    public bool DonneesAnonymisees { get; set; }

    [Column("donnees_archivees")]
    public bool DonneesArchivees { get; set; }

    [Column("archive_url")]
    [StringLength(500)]
    public string? ArchiveUrl { get; set; }

    [Column("date_suppression", TypeName = "timestamp without time zone")]
    public DateTime DateSuppression { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("SuppressionsComptes")]
    public virtual User User { get; set; } = null!;
}
