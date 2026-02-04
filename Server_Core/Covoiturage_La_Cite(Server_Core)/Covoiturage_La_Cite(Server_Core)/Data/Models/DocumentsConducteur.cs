using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("documents_conducteur")]
[Index("ConducteurId", Name = "idx_documents_conducteur")]
[Index("DateExpiration", Name = "idx_documents_expiration")]
[Index("Statut", Name = "idx_documents_statut")]
[Index("TypeDocument", Name = "idx_documents_type")]
public partial class DocumentsConducteur
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("conducteur_id")]
    public Guid ConducteurId { get; set; }

    [Column("type_document")]
    [StringLength(50)]
    public string TypeDocument { get; set; } = null!;

    [Column("fichier_url")]
    [StringLength(500)]
    public string FichierUrl { get; set; } = null!;

    [Column("statut")]
    [StringLength(20)]
    public string Statut { get; set; } = null!;

    [Column("commentaire_refus")]
    public string? CommentaireRefus { get; set; }

    [Column("date_expiration")]
    public DateOnly? DateExpiration { get; set; }

    [Column("date_soumission", TypeName = "timestamp without time zone")]
    public DateTime DateSoumission { get; set; }

    [Column("date_validation", TypeName = "timestamp without time zone")]
    public DateTime? DateValidation { get; set; }

    [Column("validateur_id")]
    public Guid? ValidateurId { get; set; }

    [ForeignKey("ConducteurId")]
    [InverseProperty("DocumentsConducteurs")]
    public virtual ProfilsConducteur Conducteur { get; set; } = null!;

    [ForeignKey("ValidateurId")]
    [InverseProperty("DocumentsConducteurs")]
    public virtual User? Validateur { get; set; }
}
