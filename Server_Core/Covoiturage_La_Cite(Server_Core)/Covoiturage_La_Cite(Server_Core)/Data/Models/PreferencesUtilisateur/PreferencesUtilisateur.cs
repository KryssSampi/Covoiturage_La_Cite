using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

[Table("preferences_utilisateur")]
[Index("UserId", Name = "idx_preferences_user")]
[Index("UserId", Name = "preferences_utilisateur_user_id_key", IsUnique = true)]
public partial class PreferencesUtilisateur
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("musique_acceptee")]
    public bool? MusiqueAcceptee { get; set; }

    [Column("conversation_acceptee")]
    public bool? ConversationAcceptee { get; set; }

    [Column("animaux_acceptes")]
    public bool? AnimauxAcceptes { get; set; }

    [Column("fumeur_accepte")]
    public bool? FumeurAccepte { get; set; }

    [Column("niveau_conversation")]
    [StringLength(20)]
    public string? NiveauConversation { get; set; }

    [Column("genre_musique_prefere")]
    [StringLength(100)]
    public string? GenreMusiquePrefere { get; set; }

    [Column("partage_auto_urgence")]
    public bool? PartageAutoUrgence { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("PreferencesUtilisateur")]
    public virtual User User { get; set; } = null!;
}
