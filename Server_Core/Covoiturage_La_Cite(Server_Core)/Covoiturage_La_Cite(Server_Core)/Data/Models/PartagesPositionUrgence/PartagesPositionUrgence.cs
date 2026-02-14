using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("partages_position_urgence")]
[Index("ShareToken", Name = "idx_partages_token")]
[Index("TrajetId", Name = "idx_partages_trajet")]
[Index("UserId", Name = "idx_partages_user")]
[Index("ShareToken", Name = "partages_position_urgence_share_token_key", IsUnique = true)]
public partial class PartagesPositionUrgence
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("trajet_id")]
    public Guid TrajetId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("contact_urgence_id")]
    public Guid ContactUrgenceId { get; set; }

    [Column("share_token")]
    [StringLength(255)]
    public string ShareToken { get; set; } = null!;

    [Column("actif")]
    public bool Actif { get; set; }

    [Column("date_activation", TypeName = "timestamp without time zone")]
    public DateTime DateActivation { get; set; }

    [Column("date_expiration", TypeName = "timestamp without time zone")]
    public DateTime DateExpiration { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("ContactUrgenceId")]
    [InverseProperty("PartagesPositionUrgences")]
    public virtual ContactsUrgence ContactUrgence { get; set; } = null!;

    [ForeignKey("TrajetId")]
    [InverseProperty("PartagesPositionUrgences")]
    public virtual Trajet Trajet { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("PartagesPositionUrgences")]
    public virtual User User { get; set; } = null!;
}
