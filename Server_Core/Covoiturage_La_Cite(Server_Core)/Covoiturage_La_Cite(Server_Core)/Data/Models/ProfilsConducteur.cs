using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("profils_conducteur")]
[Index("NoteMoyenne", Name = "idx_profil_note")]
[Index("StatutValidation", Name = "idx_profil_statut")]
[Index("UserId", Name = "idx_profil_user")]
[Index("UserId", Name = "profils_conducteur_user_id_key", IsUnique = true)]
public partial class ProfilsConducteur
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("statut_validation")]
    [StringLength(30)]
    public string StatutValidation { get; set; } = null!;

    [Column("commentaire_admin")]
    public string? CommentaireAdmin { get; set; }

    [Column("validateur_id")]
    public Guid? ValidateurId { get; set; }

    [Column("points_reputation")]
    public int PointsReputation { get; set; }

    [Column("note_moyenne")]
    [Precision(3, 2)]
    public decimal? NoteMoyenne { get; set; }

    [Column("total_trajets")]
    public int TotalTrajets { get; set; }

    [Column("total_passagers")]
    public int TotalPassagers { get; set; }

    [Column("co2_economise_kg")]
    [Precision(10, 2)]
    public decimal Co2EconomiseKg { get; set; }

    [Column("taux_annulation")]
    [Precision(5, 2)]
    public decimal TauxAnnulation { get; set; }

    [Column("nb_retards")]
    public int NbRetards { get; set; }

    [Column("nb_annulations_tardives")]
    public int NbAnnulationsTardives { get; set; }

    [Column("date_validation", TypeName = "timestamp without time zone")]
    public DateTime? DateValidation { get; set; }

    [Column("date_suspension", TypeName = "timestamp without time zone")]
    public DateTime? DateSuspension { get; set; }

    [Column("raison_suspension")]
    public string? RaisonSuspension { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("Conducteur")]
    public virtual ICollection<DocumentsConducteur> DocumentsConducteurs { get; set; } = new List<DocumentsConducteur>();

    [InverseProperty("Conducteur")]
    public virtual ICollection<Trajet> Trajets { get; set; } = new List<Trajet>();

    [InverseProperty("Conducteur")]
    public virtual ICollection<TrajetsRecurrent> TrajetsRecurrents { get; set; } = new List<TrajetsRecurrent>();

    [ForeignKey("UserId")]
    [InverseProperty("ProfilsConducteurUser")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("ValidateurId")]
    [InverseProperty("ProfilsConducteurValidateurs")]
    public virtual User? Validateur { get; set; }

    [InverseProperty("Conducteur")]
    public virtual ICollection<Vehicule> Vehicules { get; set; } = new List<Vehicule>();
}
