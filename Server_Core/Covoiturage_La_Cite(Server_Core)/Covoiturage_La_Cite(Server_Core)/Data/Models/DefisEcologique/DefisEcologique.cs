using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("defis_ecologiques")]
[Index("Code", Name = "defis_ecologiques_code_key", IsUnique = true)]
[Index("Actif", Name = "idx_defis_actif")]
[Index("Code", Name = "idx_defis_code")]
[Index("DateDebut", "DateFin", Name = "idx_defis_dates")]
public partial class DefisEcologique
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

    [Column("date_debut", TypeName = "timestamp without time zone")]
    public DateTime DateDebut { get; set; }

    [Column("date_fin", TypeName = "timestamp without time zone")]
    public DateTime DateFin { get; set; }

    [Column("objectif_json", TypeName = "jsonb")]
    public string ObjectifJson { get; set; } = null!;

    [Column("recompense_json", TypeName = "jsonb")]
    public string RecompenseJson { get; set; } = null!;

    [Column("actif")]
    public bool Actif { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Defi")]
    public virtual ICollection<ParticipationsDefi> ParticipationsDefis { get; set; } = new List<ParticipationsDefi>();
}
