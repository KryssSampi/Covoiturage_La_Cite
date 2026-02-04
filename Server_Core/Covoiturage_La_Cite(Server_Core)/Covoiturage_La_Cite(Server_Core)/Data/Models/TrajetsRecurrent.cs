using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("trajets_recurrents")]
[Index("Actif", Name = "idx_recurrents_actif")]
[Index("ConducteurId", Name = "idx_recurrents_conducteur")]
[Index("TrajetTemplateId", Name = "idx_recurrents_template")]
public partial class TrajetsRecurrent
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("conducteur_id")]
    public Guid ConducteurId { get; set; }

    [Column("trajet_template_id")]
    public Guid TrajetTemplateId { get; set; }

    [Column("jours_semaine")]
    [StringLength(50)]
    public string JoursSemaine { get; set; } = null!;

    [Column("heure_depart")]
    public TimeOnly HeureDepart { get; set; }

    [Column("actif")]
    public bool Actif { get; set; }

    [Column("date_debut")]
    public DateOnly DateDebut { get; set; }

    [Column("date_fin")]
    public DateOnly? DateFin { get; set; }

    [Column("nb_instances_generees")]
    public int NbInstancesGenerees { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("ConducteurId")]
    [InverseProperty("TrajetsRecurrents")]
    public virtual ProfilsConducteur Conducteur { get; set; } = null!;

    [ForeignKey("TrajetTemplateId")]
    [InverseProperty("TrajetsRecurrents")]
    public virtual Trajet TrajetTemplate { get; set; } = null!;
}
