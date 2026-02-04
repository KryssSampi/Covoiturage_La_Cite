using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("exports_donnees")]
[Index("Statut", Name = "idx_exports_statut")]
[Index("UserId", Name = "idx_exports_user")]
public partial class ExportsDonnee
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("type_export")]
    [StringLength(20)]
    public string TypeExport { get; set; } = null!;

    [Column("tables_exportees_json", TypeName = "jsonb")]
    public string? TablesExporteesJson { get; set; }

    [Column("fichier_url")]
    [StringLength(500)]
    public string? FichierUrl { get; set; }

    [Column("statut")]
    [StringLength(20)]
    public string Statut { get; set; } = null!;

    [Column("date_demande", TypeName = "timestamp without time zone")]
    public DateTime DateDemande { get; set; }

    [Column("date_completion", TypeName = "timestamp without time zone")]
    public DateTime? DateCompletion { get; set; }

    [Column("date_expiration_lien", TypeName = "timestamp without time zone")]
    public DateTime? DateExpirationLien { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("ExportsDonnees")]
    public virtual User User { get; set; } = null!;
}
