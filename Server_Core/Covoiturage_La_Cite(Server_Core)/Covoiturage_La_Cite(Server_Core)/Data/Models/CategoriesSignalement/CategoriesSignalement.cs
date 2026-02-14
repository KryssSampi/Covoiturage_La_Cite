using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("categories_signalement")]
[Index("Code", Name = "categories_signalement_code_key", IsUnique = true)]
[Index("Code", Name = "idx_categories_signal_code")]
public partial class CategoriesSignalement
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

    [Column("gravite_defaut")]
    [StringLength(20)]
    public string GraviteDefaut { get; set; } = null!;

    [Column("penalite_suggeree")]
    [Precision(10, 2)]
    public decimal? PenaliteSuggeree { get; set; }
}
