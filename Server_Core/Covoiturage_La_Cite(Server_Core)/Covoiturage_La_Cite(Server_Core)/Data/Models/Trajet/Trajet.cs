using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

/// <summary>
/// Trajets proposés par les conducteurs
/// </summary>
[Table("trajets")]
[Index("ConducteurId", Name = "idx_trajets_conducteur")]
[Index("CreatedAt", Name = "idx_trajets_created")]
[Index("HeureDepartPrevue", Name = "idx_trajets_heure_depart")]
[Index("Recurrent", Name = "idx_trajets_recurrent")]
[Index("Statut", Name = "idx_trajets_statut")]
[Index("VehiculeId", Name = "idx_trajets_vehicule")]
[Index("ZoneArriveeId", Name = "idx_trajets_zone_arrivee")]
[Index("ZoneDepartId", Name = "idx_trajets_zone_depart")]
public partial class Trajet
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("conducteur_id")]
    public Guid ConducteurId { get; set; }

    [Column("vehicule_id")]
    public Guid VehiculeId { get; set; }

    /// <summary>
    /// Géolocalisation PostGIS du point de départ (SRID 4326)
    /// </summary>
    [Column("point_depart", TypeName = "geography(Point,4326)")]
    public Point PointDepart { get; set; } = null!;

    [Column("adresse_depart")]
    public string AdresseDepart { get; set; } = null!;

    /// <summary>
    /// Géolocalisation PostGIS du point d&apos;arrivée (SRID 4326)
    /// </summary>
    [Column("point_arrivee", TypeName = "geography(Point,4326)")]
    public Point PointArrivee { get; set; } = null!;

    [Column("adresse_arrivee")]
    public string AdresseArrivee { get; set; } = null!;

    [Column("zone_depart_id")]
    public Guid? ZoneDepartId { get; set; }

    [Column("zone_arrivee_id")]
    public Guid? ZoneArriveeId { get; set; }

    [Column("point_rencontre_depart", TypeName = "geography(Point,4326)")]
    public Point? PointRencontreDepart { get; set; }

    [Column("instructions_rencontre_depart")]
    public string? InstructionsRencontreDepart { get; set; }

    [Column("point_rencontre_arrivee", TypeName = "geography(Point,4326)")]
    public Point? PointRencontreArrivee { get; set; }

    [Column("instructions_rencontre_arrivee")]
    public string? InstructionsRencontreArrivee { get; set; }

    [Column("heure_depart_prevue", TypeName = "timestamp without time zone")]
    public DateTime HeureDepartPrevue { get; set; }

    [Column("heure_arrivee_estimee", TypeName = "timestamp without time zone")]
    public DateTime HeureArriveeEstimee { get; set; }

    [Column("type_depart")]
    [StringLength(20)]
    public string TypeDepart { get; set; } = null!;

    [Column("nb_places_disponibles")]
    public int NbPlacesDisponibles { get; set; }

    [Column("nb_places_totales")]
    public int NbPlacesTotales { get; set; }

    [Column("prix_par_passager")]
    [Precision(10, 2)]
    public decimal PrixParPassager { get; set; }

    [Column("distance_km")]
    [Precision(10, 2)]
    public decimal DistanceKm { get; set; }

    [Column("duree_minutes")]
    public int DureeMinutes { get; set; }

    [Column("statut")]
    [StringLength(20)]
    public string Statut { get; set; } = null!;

    [Column("recurrent")]
    public bool Recurrent { get; set; }

    [Column("trajet_recurrent_id")]
    public Guid? TrajetRecurrentId { get; set; }

    [Column("preferences_json", TypeName = "jsonb")]
    public string? PreferencesJson { get; set; }

    [Column("itineraire_flexible")]
    public bool ItineraireFlexible { get; set; }

    [Column("detour_max_minutes")]
    public int? DetourMaxMinutes { get; set; }

    [Column("score_matching_min")]
    [Precision(5, 2)]
    public decimal? ScoreMatchingMin { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("Trajet")]
    public virtual ICollection<AlertesUrgence> AlertesUrgences { get; set; } = new List<AlertesUrgence>();

    [ForeignKey("ConducteurId")]
    [InverseProperty("Trajets")]
    public virtual ProfilsConducteur Conducteur { get; set; } = null!;

    [InverseProperty("Trajet")]
    public virtual ICollection<Evaluation> Evaluations { get; set; } = new List<Evaluation>();

    [InverseProperty("Trajet")]
    public virtual HistoriqueTrajet? HistoriqueTrajet { get; set; }

    [InverseProperty("TrajetRecurrent")]
    public virtual ICollection<Trajet> InverseTrajetRecurrent { get; set; } = new List<Trajet>();

    [InverseProperty("Trajet")]
    public virtual ICollection<Litige> Litiges { get; set; } = new List<Litige>();

    [InverseProperty("Trajet")]
    public virtual ICollection<PartagesPositionUrgence> PartagesPositionUrgences { get; set; } = new List<PartagesPositionUrgence>();

    [InverseProperty("Trajet")]
    public virtual ICollection<Penalite> Penalites { get; set; } = new List<Penalite>();

    [InverseProperty("Trajet")]
    public virtual ICollection<PositionsGp> PositionsGps { get; set; } = new List<PositionsGp>();

    [InverseProperty("Trajet")]
    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

    [InverseProperty("Trajet")]
    public virtual ICollection<Signalement> Signalements { get; set; } = new List<Signalement>();

    [ForeignKey("TrajetRecurrentId")]
    [InverseProperty("InverseTrajetRecurrent")]
    public virtual Trajet? TrajetRecurrent { get; set; }

    [InverseProperty("TrajetTemplate")]
    public virtual ICollection<TrajetsRecurrent> TrajetsRecurrents { get; set; } = new List<TrajetsRecurrent>();

    [InverseProperty("Trajet")]
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    [ForeignKey("VehiculeId")]
    [InverseProperty("Trajets")]
    public virtual Vehicule Vehicule { get; set; } = null!;

    [InverseProperty("Trajet")]
    public virtual ICollection<WaypointsTrajet> WaypointsTrajets { get; set; } = new List<WaypointsTrajet>();

    [ForeignKey("ZoneArriveeId")]
    [InverseProperty("TrajetZoneArrivees")]
    public virtual ZonesCampus? ZoneArrivee { get; set; }

    [ForeignKey("ZoneDepartId")]
    [InverseProperty("TrajetZoneDeparts")]
    public virtual ZonesCampus? ZoneDepart { get; set; }
}
