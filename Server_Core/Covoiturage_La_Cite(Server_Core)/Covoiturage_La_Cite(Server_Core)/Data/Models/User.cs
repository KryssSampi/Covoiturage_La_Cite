using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.Models;

/// <summary>
/// Utilisateurs de la plateforme (passagers, conducteurs, admins)
/// </summary>
[Table("users")]
[Index("Email", Name = "idx_users_email")]
[Index("IsActive", Name = "idx_users_is_active")]
[Index("MicrosoftId", Name = "idx_users_microsoft_id")]
[Index("ProfileVerified", Name = "idx_users_profile_verified")]
[Index("Role", Name = "idx_users_role")]
[Index("Email", Name = "users_email_key", IsUnique = true)]
[Index("MicrosoftId", Name = "users_microsoft_id_key", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("email")]
    [StringLength(255)]
    public string Email { get; set; } = null!;

    [Column("microsoft_id")]
    [StringLength(255)]
    public string MicrosoftId { get; set; } = null!;

    [Column("nom_complet")]
    [StringLength(200)]
    public string NomComplet { get; set; } = null!;

    [Column("photo_url")]
    [StringLength(500)]
    public string? PhotoUrl { get; set; }

    [Column("photo_verification_url")]
    [StringLength(500)]
    public string? PhotoVerificationUrl { get; set; }

    [Column("role")]
    [StringLength(20)]
    public string Role { get; set; } = null!;

    [Column("is_active")]
    public bool IsActive { get; set; }

    [Column("profile_verified")]
    public bool ProfileVerified { get; set; }

    [Column("verification_date", TypeName = "timestamp without time zone")]
    public DateTime? VerificationDate { get; set; }

    [Column("verified_by")]
    public Guid? VerifiedBy { get; set; }

    [Column("dernier_login", TypeName = "timestamp without time zone")]
    public DateTime? DernierLogin { get; set; }

    [Column("preferences_json", TypeName = "jsonb")]
    public string? PreferencesJson { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at", TypeName = "timestamp without time zone")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("AdminIntervenant")]
    public virtual ICollection<AlertesUrgence> AlertesUrgenceAdminIntervenants { get; set; } = new List<AlertesUrgence>();

    [InverseProperty("User")]
    public virtual ICollection<AlertesUrgence> AlertesUrgenceUsers { get; set; } = new List<AlertesUrgence>();

    [InverseProperty("User")]
    public virtual ComptesVirtuel? ComptesVirtuel { get; set; }

    [InverseProperty("ModifieParNavigation")]
    public virtual ICollection<ConfigSysteme> ConfigSystemes { get; set; } = new List<ConfigSysteme>();

    [InverseProperty("User")]
    public virtual ICollection<ConsentementsPipedum> ConsentementsPipeda { get; set; } = new List<ConsentementsPipedum>();

    [InverseProperty("User")]
    public virtual ICollection<ContactsUrgence> ContactsUrgences { get; set; } = new List<ContactsUrgence>();

    [InverseProperty("Passager")]
    public virtual ICollection<DemandesMultiplesTracking> DemandesMultiplesTrackings { get; set; } = new List<DemandesMultiplesTracking>();

    [InverseProperty("Validateur")]
    public virtual ICollection<DocumentsConducteur> DocumentsConducteurs { get; set; } = new List<DocumentsConducteur>();

    [InverseProperty("Evaluateur")]
    public virtual ICollection<Evaluation> EvaluationEvaluateurs { get; set; } = new List<Evaluation>();

    [InverseProperty("Evalue")]
    public virtual ICollection<Evaluation> EvaluationEvalues { get; set; } = new List<Evaluation>();

    [InverseProperty("User")]
    public virtual ICollection<ExportsDonnee> ExportsDonnees { get; set; } = new List<ExportsDonnee>();

    [InverseProperty("Conducteur")]
    public virtual ICollection<Favori> FavoriConducteurs { get; set; } = new List<Favori>();

    [InverseProperty("Passager")]
    public virtual ICollection<Favori> FavoriPassagers { get; set; } = new List<Favori>();

    [InverseProperty("Conducteur")]
    public virtual ICollection<FavorisConducteur> FavorisConducteurConducteurs { get; set; } = new List<FavorisConducteur>();

    [InverseProperty("Passager")]
    public virtual ICollection<FavorisConducteur> FavorisConducteurPassagers { get; set; } = new List<FavorisConducteur>();

    [InverseProperty("User")]
    public virtual ICollection<GeofenceEvent> GeofenceEvents { get; set; } = new List<GeofenceEvent>();

    [InverseProperty("VerifiedByNavigation")]
    public virtual ICollection<User> InverseVerifiedByNavigation { get; set; } = new List<User>();

    [InverseProperty("User")]
    public virtual ICollection<LieuxFavori> LieuxFavoris { get; set; } = new List<LieuxFavori>();

    [InverseProperty("AdminResponsable")]
    public virtual ICollection<Litige> LitigeAdminResponsables { get; set; } = new List<Litige>();

    [InverseProperty("Demandeur")]
    public virtual ICollection<Litige> LitigeDemandeurs { get; set; } = new List<Litige>();

    [InverseProperty("MiseEnCause")]
    public virtual ICollection<Litige> LitigeMiseEnCauses { get; set; } = new List<Litige>();

    [InverseProperty("User")]
    public virtual ICollection<LogsSecurite> LogsSecurites { get; set; } = new List<LogsSecurite>();

    [InverseProperty("User")]
    public virtual ICollection<MobileSession> MobileSessions { get; set; } = new List<MobileSession>();

    [InverseProperty("User")]
    public virtual ICollection<PartagesPositionUrgence> PartagesPositionUrgences { get; set; } = new List<PartagesPositionUrgence>();

    [InverseProperty("User")]
    public virtual ICollection<ParticipationsDefi> ParticipationsDefis { get; set; } = new List<ParticipationsDefi>();

    [InverseProperty("AdminEvaluateur")]
    public virtual ICollection<Penalite> PenaliteAdminEvaluateurs { get; set; } = new List<Penalite>();

    [InverseProperty("User")]
    public virtual ICollection<Penalite> PenaliteUsers { get; set; } = new List<Penalite>();

    [InverseProperty("User")]
    public virtual PointsReputation? PointsReputation { get; set; }

    [InverseProperty("Conducteur")]
    public virtual ICollection<PositionsGp> PositionsGps { get; set; } = new List<PositionsGp>();

    [InverseProperty("User")]
    public virtual PreferencesUtilisateur? PreferencesUtilisateur { get; set; }

    [InverseProperty("User")]
    public virtual ProfilsConducteur? ProfilsConducteurUser { get; set; }

    [InverseProperty("Validateur")]
    public virtual ICollection<ProfilsConducteur> ProfilsConducteurValidateurs { get; set; } = new List<ProfilsConducteur>();

    [InverseProperty("ApprouveParNavigation")]
    public virtual ICollection<RemboursementsPenalite> RemboursementsPenalites { get; set; } = new List<RemboursementsPenalite>();

    [InverseProperty("Passager")]
    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

    [InverseProperty("User")]
    public virtual ICollection<SessionsUtilisateur> SessionsUtilisateurs { get; set; } = new List<SessionsUtilisateur>();

    [InverseProperty("AdminResponsable")]
    public virtual ICollection<Signalement> SignalementAdminResponsables { get; set; } = new List<Signalement>();

    [InverseProperty("Signale")]
    public virtual ICollection<Signalement> SignalementSignales { get; set; } = new List<Signalement>();

    [InverseProperty("Signaleur")]
    public virtual ICollection<Signalement> SignalementSignaleurs { get; set; } = new List<Signalement>();

    [InverseProperty("User")]
    public virtual ICollection<StatistiquesUtilisateur> StatistiquesUtilisateurs { get; set; } = new List<StatistiquesUtilisateur>();

    [InverseProperty("User")]
    public virtual ICollection<SuppressionsCompte> SuppressionsComptes { get; set; } = new List<SuppressionsCompte>();

    [InverseProperty("Conducteur")]
    public virtual ICollection<Transaction> TransactionConducteurs { get; set; } = new List<Transaction>();

    [InverseProperty("Passager")]
    public virtual ICollection<Transaction> TransactionPassagers { get; set; } = new List<Transaction>();

    [InverseProperty("User")]
    public virtual ICollection<UsersBadge> UsersBadges { get; set; } = new List<UsersBadge>();

    [ForeignKey("VerifiedBy")]
    [InverseProperty("InverseVerifiedByNavigation")]
    public virtual User? VerifiedByNavigation { get; set; }
}
