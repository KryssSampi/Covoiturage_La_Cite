using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("historique_trajets")]
[Index("TrajetId", Name = "historique_trajets_trajet_id_key", IsUnique = true)]
[Index("TrajetId", Name = "idx_historique_trajet")]
public partial class HistoriqueTrajet
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trajet_id")]
    public Guid TrajetId { get; set; }

    [Column("polyline", TypeName = "geography(LineString,4326)")]
    public LineString? Polyline { get; set; }

    [Column("duree_reelle_minutes")]
    public int? DureeReelleMinutes { get; set; }

    [Column("distance_reelle_km")]
    [Precision(10, 2)]
    public decimal? DistanceReelleKm { get; set; }

    [Column("heure_depart_reelle", TypeName = "timestamp without time zone")]
    public DateTime? HeureDepartReelle { get; set; }

    [Column("heure_arrivee_reelle", TypeName = "timestamp without time zone")]
    public DateTime? HeureArriveeReelle { get; set; }

    [Column("ecart_temps_minutes")]
    public int? EcartTempsMinutes { get; set; }

    [Column("incidents_json", TypeName = "jsonb")]
    public string? IncidentsJson { get; set; }

    [Column("vitesse_moyenne_kmh")]
    [Precision(5, 2)]
    public decimal? VitesseMoyenneKmh { get; set; }

    [Column("vitesse_max_kmh")]
    [Precision(5, 2)]
    public decimal? VitesseMaxKmh { get; set; }

    [Column("nb_arrets")]
    public int? NbArrets { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("TrajetId")]
    [InverseProperty("HistoriqueTrajet")]
    public virtual Trajet Trajet { get; set; } = null!;
}
