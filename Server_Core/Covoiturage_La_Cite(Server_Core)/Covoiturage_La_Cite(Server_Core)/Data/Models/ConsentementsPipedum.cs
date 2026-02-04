using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("consentements_pipeda")]
[Index("UserId", Name = "idx_consent_user")]
[Index("VersionPolitique", Name = "idx_consent_version")]
public partial class ConsentementsPipedum
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("consentement_partage_donnees")]
    public bool ConsentementPartageDonnees { get; set; }

    [Column("consentement_geolocalisation")]
    public bool ConsentementGeolocalisation { get; set; }

    [Column("consentement_marketing")]
    public bool ConsentementMarketing { get; set; }

    [Column("consentement_analyse_comportement")]
    public bool ConsentementAnalyseComportement { get; set; }

    [Column("version_politique")]
    [StringLength(20)]
    public string VersionPolitique { get; set; } = null!;

    [Column("date_consentement", TypeName = "timestamp without time zone")]
    public DateTime DateConsentement { get; set; }

    [Column("ip_consentement")]
    [StringLength(45)]
    public string? IpConsentement { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("ConsentementsPipeda")]
    public virtual User User { get; set; } = null!;
}
