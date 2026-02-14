using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Keyless]
public partial class VReservationsDetail
{
    [Column("id")]
    public Guid? Id { get; set; }

    [Column("trajet_id")]
    public Guid? TrajetId { get; set; }

    [Column("passager_id")]
    public Guid? PassagerId { get; set; }

    [Column("passager_nom")]
    [StringLength(200)]
    public string? PassagerNom { get; set; }

    [Column("passager_photo")]
    [StringLength(500)]
    public string? PassagerPhoto { get; set; }

    [Column("conducteur_id")]
    public Guid? ConducteurId { get; set; }

    [Column("conducteur_nom")]
    [StringLength(200)]
    public string? ConducteurNom { get; set; }

    [Column("adresse_depart")]
    public string? AdresseDepart { get; set; }

    [Column("adresse_arrivee")]
    public string? AdresseArrivee { get; set; }

    [Column("heure_depart_prevue", TypeName = "timestamp without time zone")]
    public DateTime? HeureDepartPrevue { get; set; }

    [Column("montant_total")]
    [Precision(10, 2)]
    public decimal? MontantTotal { get; set; }

    [Column("statut")]
    [StringLength(30)]
    public string? Statut { get; set; }

    [Column("score_compatibilite")]
    [Precision(5, 2)]
    public decimal? ScoreCompatibilite { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime? CreatedAt { get; set; }
}
