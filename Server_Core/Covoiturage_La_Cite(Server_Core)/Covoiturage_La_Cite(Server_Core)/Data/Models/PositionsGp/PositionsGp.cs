using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("positions_gps")]
[Index("ConducteurId", Name = "idx_positions_conducteur")]
[Index("TimestampPosition", Name = "idx_positions_timestamp")]
[Index("TrajetId", Name = "idx_positions_trajet")]
public partial class PositionsGp
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trajet_id")]
    public Guid TrajetId { get; set; }

    [Column("conducteur_id")]
    public Guid ConducteurId { get; set; }

    /// <summary>
    /// Position GPS temps réel (PostGIS Point)
    /// </summary>
    [Column("position", TypeName = "geography(Point,4326)")]
    public Point Position { get; set; } = null!;

    [Column("latitude")]
    [Precision(10, 8)]
    public decimal Latitude { get; set; }

    [Column("longitude")]
    [Precision(11, 8)]
    public decimal Longitude { get; set; }

    [Column("vitesse_kmh")]
    [Precision(5, 2)]
    public decimal? VitesseKmh { get; set; }

    [Column("cap_degres")]
    public int? CapDegres { get; set; }

    [Column("altitude_m")]
    [Precision(7, 2)]
    public decimal? AltitudeM { get; set; }

    [Column("precision_m")]
    [Precision(6, 2)]
    public decimal? PrecisionM { get; set; }

    [Column("timestamp_position", TypeName = "timestamp without time zone")]
    public DateTime TimestampPosition { get; set; }

    [Column("en_deplacement")]
    public bool EnDeplacement { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("ConducteurId")]
    [InverseProperty("PositionsGps")]
    public virtual User Conducteur { get; set; } = null!;

    [ForeignKey("TrajetId")]
    [InverseProperty("PositionsGps")]
    public virtual Trajet Trajet { get; set; } = null!;
}
