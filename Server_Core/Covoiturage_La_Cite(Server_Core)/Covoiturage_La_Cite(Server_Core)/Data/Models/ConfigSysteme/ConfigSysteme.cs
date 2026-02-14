using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("config_systeme")]
[Index("Cle", Name = "config_systeme_cle_key", IsUnique = true)]
[Index("Cle", Name = "idx_config_cle")]
public partial class ConfigSysteme
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("cle")]
    [StringLength(100)]
    public string Cle { get; set; } = null!;

    [Column("valeur")]
    public string Valeur { get; set; } = null!;

    [Column("type_valeur")]
    [StringLength(20)]
    public string TypeValeur { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("modifie_par")]
    public Guid? ModifiePar { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("ModifiePar")]
    [InverseProperty("ConfigSystemes")]
    public virtual User? ModifieParNavigation { get; set; }
}
