using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Keyless]
public partial class VTrajetsDisponible
{
    [Column("id")]
    public Guid? Id { get; set; }

    [Column("conducteur_id")]
    public Guid? ConducteurId { get; set; }

    [Column("conducteur_nom")]
    [StringLength(200)]
    public string? ConducteurNom { get; set; }

    [Column("conducteur_photo")]
    [StringLength(500)]
    public string? ConducteurPhoto { get; set; }

    [Column("conducteur_note")]
    [Precision(3, 2)]
    public decimal? ConducteurNote { get; set; }

    [Column("vehicule")]
    public string? Vehicule { get; set; }

    [Column("vehicule_couleur")]
    [StringLength(30)]
    public string? VehiculeCouleur { get; set; }

    [Column("point_depart", TypeName = "geography(Point,4326)")]
    public Point? PointDepart { get; set; }

    [Column("adresse_depart")]
    public string? AdresseDepart { get; set; }

    [Column("point_arrivee", TypeName = "geography(Point,4326)")]
    public Point? PointArrivee { get; set; }

    [Column("adresse_arrivee")]
    public string? AdresseArrivee { get; set; }

    [Column("heure_depart_prevue", TypeName = "timestamp without time zone")]
    public DateTime? HeureDepartPrevue { get; set; }

    [Column("heure_arrivee_estimee", TypeName = "timestamp without time zone")]
    public DateTime? HeureArriveeEstimee { get; set; }

    [Column("nb_places_disponibles")]
    public int? NbPlacesDisponibles { get; set; }

    [Column("prix_par_passager")]
    [Precision(10, 2)]
    public decimal? PrixParPassager { get; set; }

    [Column("distance_km")]
    [Precision(10, 2)]
    public decimal? DistanceKm { get; set; }

    [Column("duree_minutes")]
    public int? DureeMinutes { get; set; }

    [Column("preferences_json", TypeName = "jsonb")]
    public string? PreferencesJson { get; set; }

    [Column("statut")]
    [StringLength(20)]
    public string? Statut { get; set; }
}
