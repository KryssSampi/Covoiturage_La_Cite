using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("raisons_annulation")]
[Index("Code", Name = "idx_raisons_annul_code")]
[Index("Code", Name = "raisons_annulation_code_key", IsUnique = true)]
public partial class RaisonsAnnulation
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("code")]
    [StringLength(50)]
    public string Code { get; set; } = null!;

    [Column("label")]
    [StringLength(100)]
    public string Label { get; set; } = null!;

    [Column("applicable_a")]
    [StringLength(20)]
    public string ApplicableA { get; set; } = null!;

    [Column("penalite_associee")]
    [Precision(10, 2)]
    public decimal? PenaliteAssociee { get; set; }
}
