using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("contacts_urgence")]
[Index("Actif", Name = "idx_contacts_actif")]
[Index("UserId", Name = "idx_contacts_user")]
[Index("UserId", "OrdrePriorite", Name = "uq_user_ordre", IsUnique = true)]
public partial class ContactsUrgence
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("nom_complet")]
    [StringLength(200)]
    public string NomComplet { get; set; } = null!;

    [Column("telephone")]
    [StringLength(20)]
    public string Telephone { get; set; } = null!;

    [Column("email")]
    [StringLength(255)]
    public string? Email { get; set; }

    [Column("relation")]
    [StringLength(50)]
    public string Relation { get; set; } = null!;

    [Column("actif")]
    public bool Actif { get; set; }

    [Column("ordre_priorite")]
    public int OrdrePriorite { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("ContactUrgence")]
    public virtual ICollection<PartagesPositionUrgence> PartagesPositionUrgences { get; set; } = new List<PartagesPositionUrgence>();

    [ForeignKey("UserId")]
    [InverseProperty("ContactsUrgences")]
    public virtual User User { get; set; } = null!;
}
