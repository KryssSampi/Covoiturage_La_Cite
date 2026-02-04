using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("lieux_favoris")]
[Index("LieuPrincipal", Name = "idx_lieux_principal")]
[Index("UserId", Name = "idx_lieux_user")]
public partial class LieuxFavori
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("nom_lieu")]
    [StringLength(100)]
    public string NomLieu { get; set; } = null!;

    [Column("position", TypeName = "geography(Point,4326)")]
    public Point Position { get; set; } = null!;

    [Column("adresse")]
    public string Adresse { get; set; } = null!;

    [Column("badge")]
    [StringLength(20)]
    public string? Badge { get; set; }

    [Column("frequence_utilisation")]
    public int FrequenceUtilisation { get; set; }

    [Column("lieu_principal")]
    public bool LieuPrincipal { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("LieuxFavoris")]
    public virtual User User { get; set; } = null!;
}
