using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("favoris")]
[Index("ConducteurId", Name = "idx_favoris_conducteur")]
[Index("PassagerId", Name = "idx_favoris_passager")]
[Index("PassagerId", "ConducteurId", Name = "uq_favoris_passager_conducteur", IsUnique = true)]
public partial class Favori
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("passager_id")]
    public Guid PassagerId { get; set; }

    [Column("conducteur_id")]
    public Guid ConducteurId { get; set; }

    [Column("type")]
    [StringLength(20)]
    public string Type { get; set; } = null!;

    [Column("nb_trajets_ensemble")]
    public int NbTrajetsEnsemble { get; set; }

    [Column("note_moyenne_recue")]
    [Precision(3, 2)]
    public decimal? NoteMoyenneRecue { get; set; }

    [Column("date_ajout", TypeName = "timestamp without time zone")]
    public DateTime DateAjout { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("ConducteurId")]
    [InverseProperty("FavoriConducteurs")]
    public virtual User Conducteur { get; set; } = null!;

    [ForeignKey("PassagerId")]
    [InverseProperty("FavoriPassagers")]
    public virtual User Passager { get; set; } = null!;
}
