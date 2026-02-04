using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("vehicules")]
[Index("Actif", Name = "idx_vehicules_actif")]
[Index("ConducteurId", Name = "idx_vehicules_conducteur")]
[Index("Immatriculation", Name = "idx_vehicules_immatriculation")]
[Index("Immatriculation", Name = "vehicules_immatriculation_key", IsUnique = true)]
public partial class Vehicule
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("conducteur_id")]
    public Guid ConducteurId { get; set; }

    [Column("marque")]
    [StringLength(50)]
    public string Marque { get; set; } = null!;

    [Column("modele")]
    [StringLength(50)]
    public string Modele { get; set; } = null!;

    [Column("couleur")]
    [StringLength(30)]
    public string? Couleur { get; set; }

    [Column("immatriculation")]
    [StringLength(20)]
    public string Immatriculation { get; set; } = null!;

    [Column("annee")]
    public int? Annee { get; set; }

    [Column("nb_places_max")]
    public int NbPlacesMax { get; set; }

    [Column("photo_url")]
    [StringLength(500)]
    public string? PhotoUrl { get; set; }

    [Column("actif")]
    public bool Actif { get; set; }

    [Column("valide")]
    public bool Valide { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("ConducteurId")]
    [InverseProperty("Vehicules")]
    public virtual ProfilsConducteur Conducteur { get; set; } = null!;

    [InverseProperty("Vehicule")]
    public virtual ICollection<Trajet> Trajets { get; set; } = new List<Trajet>();
}
