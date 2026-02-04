using Covoiturage_La_Cite_Server_Core_.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AlertesUrgence> AlertesUrgences { get; set; }

    public virtual DbSet<Badge> Badges { get; set; }

    public virtual DbSet<CategoriesSignalement> CategoriesSignalements { get; set; }

    public virtual DbSet<ComptesVirtuel> ComptesVirtuels { get; set; }

    public virtual DbSet<ConfigSysteme> ConfigSystemes { get; set; }

    public virtual DbSet<ConsentementsPipedum> ConsentementsPipeda { get; set; }

    public virtual DbSet<ContactsUrgence> ContactsUrgences { get; set; }

    public virtual DbSet<DefisEcologique> DefisEcologiques { get; set; }

    public virtual DbSet<DemandesMultiplesTracking> DemandesMultiplesTrackings { get; set; }

    public virtual DbSet<DocumentsConducteur> DocumentsConducteurs { get; set; }

    public virtual DbSet<Evaluation> Evaluations { get; set; }

    public virtual DbSet<ExportsDonnee> ExportsDonnees { get; set; }

    public virtual DbSet<Favori> Favoris { get; set; }

    public virtual DbSet<FavorisConducteur> FavorisConducteurs { get; set; }

    public virtual DbSet<GeofenceEvent> GeofenceEvents { get; set; }

    public virtual DbSet<GeofencesMobile> GeofencesMobiles { get; set; }

    public virtual DbSet<HistoriqueTrajet> HistoriqueTrajets { get; set; }

    public virtual DbSet<LieuxFavori> LieuxFavoris { get; set; }

    public virtual DbSet<Litige> Litiges { get; set; }

    public virtual DbSet<LogsSecurite> LogsSecurites { get; set; }

    public virtual DbSet<MobileDeviceInfo> MobileDeviceInfos { get; set; }

    public virtual DbSet<MobileSession> MobileSessions { get; set; }

    public virtual DbSet<PartagesPositionUrgence> PartagesPositionUrgences { get; set; }

    public virtual DbSet<ParticipationsDefi> ParticipationsDefis { get; set; }

    public virtual DbSet<Penalite> Penalites { get; set; }

    public virtual DbSet<PointsReputation> PointsReputations { get; set; }

    public virtual DbSet<PositionsGp> PositionsGps { get; set; }

    public virtual DbSet<PreferencesUtilisateur> PreferencesUtilisateurs { get; set; }

    public virtual DbSet<ProfilsConducteur> ProfilsConducteurs { get; set; }

    public virtual DbSet<RaisonsAnnulation> RaisonsAnnulations { get; set; }

    public virtual DbSet<RemboursementsPenalite> RemboursementsPenalites { get; set; }

    public virtual DbSet<RemboursementsTransaction> RemboursementsTransactions { get; set; }

    public virtual DbSet<Reservation> Reservations { get; set; }

    public virtual DbSet<SessionsUtilisateur> SessionsUtilisateurs { get; set; }

    public virtual DbSet<Signalement> Signalements { get; set; }

    public virtual DbSet<StatistiquesGlobale> StatistiquesGlobales { get; set; }

    public virtual DbSet<StatistiquesUtilisateur> StatistiquesUtilisateurs { get; set; }

    public virtual DbSet<SuppressionsCompte> SuppressionsComptes { get; set; }

    public virtual DbSet<Trajet> Trajets { get; set; }

    public virtual DbSet<TrajetsRecurrent> TrajetsRecurrents { get; set; }

    public virtual DbSet<Transaction> Transactions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UsersBadge> UsersBadges { get; set; }

    public virtual DbSet<VReservationsDetail> VReservationsDetails { get; set; }

    public virtual DbSet<VTrajetsDisponible> VTrajetsDisponibles { get; set; }

    public virtual DbSet<Vehicule> Vehicules { get; set; }

    public virtual DbSet<WaypointsTrajet> WaypointsTrajets { get; set; }

    public virtual DbSet<ZonesCampus> ZonesCampuses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresExtension("btree_gist")
            .HasPostgresExtension("pg_trgm")
            .HasPostgresExtension("postgis")
            .HasPostgresExtension("uuid-ossp");

        modelBuilder.Entity<AlertesUrgence>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("alertes_urgence_pkey");

            entity.HasIndex(e => e.PositionAlerte, "idx_alertes_position").HasMethod("gist");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.ContactsNotifiesJson).HasDefaultValueSql("'[]'::jsonb");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DateAlerte).HasDefaultValueSql("now()");
            entity.Property(e => e.Statut).HasDefaultValueSql("'active'::character varying");

            entity.HasOne(d => d.AdminIntervenant).WithMany(p => p.AlertesUrgenceAdminIntervenants)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_alerte_admin");

            entity.HasOne(d => d.Trajet).WithMany(p => p.AlertesUrgences)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_alerte_trajet");

            entity.HasOne(d => d.User).WithMany(p => p.AlertesUrgenceUsers)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_alerte_user");
        });

        modelBuilder.Entity<Badge>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("badges_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.PointsReputationRequis).HasDefaultValue(0);
        });

        modelBuilder.Entity<CategoriesSignalement>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("categories_signalement_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.PenaliteSuggeree).HasDefaultValueSql("0.00");
        });

        modelBuilder.Entity<ComptesVirtuel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("comptes_virtuels_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.BalanceDisponible).HasDefaultValueSql("0.00");
            entity.Property(e => e.BalancePenalite).HasDefaultValueSql("0.00");
            entity.Property(e => e.BalancePending).HasDefaultValueSql("0.00");
            entity.Property(e => e.TauxPrelevementActuel).HasDefaultValueSql("0.15");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithOne(p => p.ComptesVirtuel)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_compte_user");
        });

        modelBuilder.Entity<ConfigSysteme>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("config_systeme_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.ModifieParNavigation).WithMany(p => p.ConfigSystemes)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_config_modif");
        });

        modelBuilder.Entity<ConsentementsPipedum>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("consentements_pipeda_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.ConsentementAnalyseComportement).HasDefaultValue(false);
            entity.Property(e => e.ConsentementGeolocalisation).HasDefaultValue(false);
            entity.Property(e => e.ConsentementMarketing).HasDefaultValue(false);
            entity.Property(e => e.ConsentementPartageDonnees).HasDefaultValue(false);
            entity.Property(e => e.DateConsentement).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithMany(p => p.ConsentementsPipeda).HasConstraintName("fk_consent_user");
        });

        modelBuilder.Entity<ContactsUrgence>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("contacts_urgence_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Actif).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.OrdrePriorite).HasDefaultValue(1);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithMany(p => p.ContactsUrgences).HasConstraintName("fk_contacts_user");
        });

        modelBuilder.Entity<DefisEcologique>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("defis_ecologiques_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Actif).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<DemandesMultiplesTracking>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("demandes_multiples_tracking_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.NbDemandesActives).HasDefaultValue(0);
            entity.Property(e => e.NbDemandesMax).HasDefaultValue(5);
            entity.Property(e => e.ReservationIdsJson).HasDefaultValueSql("'[]'::jsonb");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Passager).WithMany(p => p.DemandesMultiplesTrackings).HasConstraintName("fk_demandes_passager");

            entity.HasOne(d => d.ReservationAcceptee).WithMany(p => p.DemandesMultiplesTrackings)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_demandes_acceptee");
        });

        modelBuilder.Entity<DocumentsConducteur>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("documents_conducteur_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.DateSoumission).HasDefaultValueSql("now()");
            entity.Property(e => e.Statut).HasDefaultValueSql("'en_attente'::character varying");

            entity.HasOne(d => d.Conducteur).WithMany(p => p.DocumentsConducteurs).HasConstraintName("fk_document_conducteur");

            entity.HasOne(d => d.Validateur).WithMany(p => p.DocumentsConducteurs)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_document_validateur");
        });

        modelBuilder.Entity<Evaluation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("evaluations_pkey");

            entity.ToTable("evaluations", tb => tb.HasComment("Évaluations mutuelles après trajets"));

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Masque).HasDefaultValue(false);
            entity.Property(e => e.SignaleCommeInapproprie).HasDefaultValue(false);
            entity.Property(e => e.TagsJson).HasDefaultValueSql("'[]'::jsonb");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Evaluateur).WithMany(p => p.EvaluationEvaluateurs)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_eval_evaluateur");

            entity.HasOne(d => d.Evalue).WithMany(p => p.EvaluationEvalues)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_eval_evalue");

            entity.HasOne(d => d.Reservation).WithMany(p => p.Evaluations)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_eval_reservation");

            entity.HasOne(d => d.Trajet).WithMany(p => p.Evaluations)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_eval_trajet");
        });

        modelBuilder.Entity<ExportsDonnee>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("exports_donnees_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.DateDemande).HasDefaultValueSql("now()");
            entity.Property(e => e.Statut).HasDefaultValueSql("'en_cours'::character varying");

            entity.HasOne(d => d.User).WithMany(p => p.ExportsDonnees).HasConstraintName("fk_export_user");
        });

        modelBuilder.Entity<Favori>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("favoris_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.DateAjout).HasDefaultValueSql("now()");
            entity.Property(e => e.NbTrajetsEnsemble).HasDefaultValue(0);
            entity.Property(e => e.Type).HasDefaultValueSql("'manuel'::character varying");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Conducteur).WithMany(p => p.FavoriConducteurs).HasConstraintName("fk_favoris_conducteur");

            entity.HasOne(d => d.Passager).WithMany(p => p.FavoriPassagers).HasConstraintName("fk_favoris_passager");
        });

        modelBuilder.Entity<FavorisConducteur>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("favoris_conducteur_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.DateAjout).HasDefaultValueSql("now()");
            entity.Property(e => e.NbTrajetsEnsemble).HasDefaultValue(0);
            entity.Property(e => e.Type).HasDefaultValueSql("'manuel'::character varying");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Conducteur).WithMany(p => p.FavorisConducteurConducteurs).HasConstraintName("fk_favoris_cond_conducteur");

            entity.HasOne(d => d.Passager).WithMany(p => p.FavorisConducteurPassagers).HasConstraintName("fk_favoris_cond_passager");
        });

        modelBuilder.Entity<GeofenceEvent>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("geofence_events_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.EventTime).HasDefaultValueSql("now()");
            entity.Property(e => e.MetadataJson).HasDefaultValueSql("'{}'::jsonb");

            entity.HasOne(d => d.Geofence).WithMany(p => p.GeofenceEvents).HasConstraintName("fk_geofence_event_fence");

            entity.HasOne(d => d.User).WithMany(p => p.GeofenceEvents).HasConstraintName("fk_geofence_event_user");
        });

        modelBuilder.Entity<GeofencesMobile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("geofences_mobile_pkey");

            entity.HasIndex(e => e.Perimetre, "idx_geofences_perimetre").HasMethod("gist");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.MonitoringActif).HasDefaultValue(true);
            entity.Property(e => e.TriggerEventsJson).HasDefaultValueSql("'[\"enter\", \"exit\"]'::jsonb");

            entity.HasOne(d => d.Zone).WithMany(p => p.GeofencesMobiles).HasConstraintName("fk_geofence_zone");
        });

        modelBuilder.Entity<HistoriqueTrajet>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("historique_trajets_pkey");

            entity.HasIndex(e => e.Polyline, "idx_historique_polyline").HasMethod("gist");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.IncidentsJson).HasDefaultValueSql("'[]'::jsonb");
            entity.Property(e => e.NbArrets).HasDefaultValue(0);

            entity.HasOne(d => d.Trajet).WithOne(p => p.HistoriqueTrajet).HasConstraintName("fk_historique_trajet");
        });

        modelBuilder.Entity<LieuxFavori>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("lieux_favoris_pkey");

            entity.HasIndex(e => e.Position, "idx_lieux_position").HasMethod("gist");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Badge).HasDefaultValueSql("'manuel'::character varying");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.FrequenceUtilisation).HasDefaultValue(1);
            entity.Property(e => e.LieuPrincipal).HasDefaultValue(false);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithMany(p => p.LieuxFavoris).HasConstraintName("fk_lieux_user");
        });

        modelBuilder.Entity<Litige>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("litiges_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DateCreation).HasDefaultValueSql("now()");
            entity.Property(e => e.MontantRembourse).HasDefaultValueSql("0.00");
            entity.Property(e => e.PreuvesJson).HasDefaultValueSql("'[]'::jsonb");
            entity.Property(e => e.Statut).HasDefaultValueSql("'en_attente'::character varying");

            entity.HasOne(d => d.AdminResponsable).WithMany(p => p.LitigeAdminResponsables)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_litige_admin");

            entity.HasOne(d => d.Demandeur).WithMany(p => p.LitigeDemandeurs)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_litige_demandeur");

            entity.HasOne(d => d.MiseEnCause).WithMany(p => p.LitigeMiseEnCauses)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_litige_mis_en_cause");

            entity.HasOne(d => d.Reservation).WithMany(p => p.Litiges)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_litige_reservation");

            entity.HasOne(d => d.Trajet).WithMany(p => p.Litiges)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_litige_trajet");
        });

        modelBuilder.Entity<LogsSecurite>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("logs_securite_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DetailsJson).HasDefaultValueSql("'{}'::jsonb");
            entity.Property(e => e.Severity).HasDefaultValueSql("'info'::character varying");

            entity.HasOne(d => d.User).WithMany(p => p.LogsSecurites)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_log_sec_user");
        });

        modelBuilder.Entity<MobileDeviceInfo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("mobile_device_info_pkey");

            entity.HasIndex(e => e.LastKnownPosition, "idx_device_info_position").HasMethod("gist");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.LowPowerMode).HasDefaultValue(false);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Session).WithOne(p => p.MobileDeviceInfo).HasConstraintName("fk_device_info_session");
        });

        modelBuilder.Entity<MobileSession>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("mobile_sessions_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.LastActivity).HasDefaultValueSql("now()");
            entity.Property(e => e.LocationPermission).HasDefaultValue(false);
            entity.Property(e => e.PushEnabled).HasDefaultValue(true);

            entity.HasOne(d => d.User).WithMany(p => p.MobileSessions).HasConstraintName("fk_mobile_session_user");
        });

        modelBuilder.Entity<PartagesPositionUrgence>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("partages_position_urgence_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Actif).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DateActivation).HasDefaultValueSql("now()");

            entity.HasOne(d => d.ContactUrgence).WithMany(p => p.PartagesPositionUrgences).HasConstraintName("fk_partage_contact");

            entity.HasOne(d => d.Trajet).WithMany(p => p.PartagesPositionUrgences).HasConstraintName("fk_partage_trajet");

            entity.HasOne(d => d.User).WithMany(p => p.PartagesPositionUrgences).HasConstraintName("fk_partage_user");
        });

        modelBuilder.Entity<ParticipationsDefi>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("participations_defis_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Complete).HasDefaultValue(false);
            entity.Property(e => e.DateInscription).HasDefaultValueSql("now()");
            entity.Property(e => e.ProgressionActuelle).HasDefaultValueSql("0.00");

            entity.HasOne(d => d.Defi).WithMany(p => p.ParticipationsDefis).HasConstraintName("fk_participation_defi");

            entity.HasOne(d => d.User).WithMany(p => p.ParticipationsDefis).HasConstraintName("fk_participation_user");
        });

        modelBuilder.Entity<Penalite>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("penalites_pkey");

            entity.ToTable("penalites", tb => tb.HasComment("Pénalités appliquées pour non-respect des règles"));

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.JustificatifFourni).HasDefaultValue(false);
            entity.Property(e => e.MontantRembourse).HasDefaultValueSql("0.00");
            entity.Property(e => e.Statut).HasDefaultValueSql("'active'::character varying");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.AdminEvaluateur).WithMany(p => p.PenaliteAdminEvaluateurs)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_penalite_admin");

            entity.HasOne(d => d.Reservation).WithMany(p => p.Penalites)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_penalite_reservation");

            entity.HasOne(d => d.Trajet).WithMany(p => p.Penalites)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_penalite_trajet");

            entity.HasOne(d => d.User).WithMany(p => p.PenaliteUsers)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_penalite_user");
        });

        modelBuilder.Entity<PointsReputation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("points_reputation_pkey");

            entity.ToTable("points_reputation", tb => tb.HasComment("Système de points GO! Score pour gamification"));

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.DerniereModification).HasDefaultValueSql("now()");
            entity.Property(e => e.HistoriqueJson).HasDefaultValueSql("'[]'::jsonb");
            entity.Property(e => e.PointsActuels).HasDefaultValue(50);
            entity.Property(e => e.PointsMaximum).HasDefaultValue(100);

            entity.HasOne(d => d.User).WithOne(p => p.PointsReputation).HasConstraintName("fk_reputation_user");
        });

        modelBuilder.Entity<PositionsGp>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("positions_gps_pkey");

            entity.HasIndex(e => e.Position, "idx_positions_geo").HasMethod("gist");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.EnDeplacement).HasDefaultValue(true);
            entity.Property(e => e.Position).HasComment("Position GPS temps réel (PostGIS Point)");

            entity.HasOne(d => d.Conducteur).WithMany(p => p.PositionsGps).HasConstraintName("fk_position_conducteur");

            entity.HasOne(d => d.Trajet).WithMany(p => p.PositionsGps).HasConstraintName("fk_position_trajet");
        });

        modelBuilder.Entity<PreferencesUtilisateur>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("preferences_utilisateur_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.AnimauxAcceptes).HasDefaultValue(false);
            entity.Property(e => e.ConversationAcceptee).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.FumeurAccepte).HasDefaultValue(false);
            entity.Property(e => e.MusiqueAcceptee).HasDefaultValue(true);
            entity.Property(e => e.NiveauConversation).HasDefaultValueSql("'modere'::character varying");
            entity.Property(e => e.PartageAutoUrgence).HasDefaultValue(false);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithOne(p => p.PreferencesUtilisateur).HasConstraintName("fk_preferences_user");
        });

        modelBuilder.Entity<ProfilsConducteur>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("profils_conducteur_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Co2EconomiseKg).HasDefaultValueSql("0.00");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.NbAnnulationsTardives).HasDefaultValue(0);
            entity.Property(e => e.NbRetards).HasDefaultValue(0);
            entity.Property(e => e.NoteMoyenne).HasDefaultValueSql("0.00");
            entity.Property(e => e.PointsReputation).HasDefaultValue(50);
            entity.Property(e => e.StatutValidation).HasDefaultValueSql("'en_attente'::character varying");
            entity.Property(e => e.TauxAnnulation).HasDefaultValueSql("0.00");
            entity.Property(e => e.TotalPassagers).HasDefaultValue(0);
            entity.Property(e => e.TotalTrajets).HasDefaultValue(0);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithOne(p => p.ProfilsConducteurUser).HasConstraintName("fk_profil_user");

            entity.HasOne(d => d.Validateur).WithMany(p => p.ProfilsConducteurValidateurs)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_profil_validateur");
        });

        modelBuilder.Entity<RaisonsAnnulation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("raisons_annulation_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.PenaliteAssociee).HasDefaultValueSql("0.00");
        });

        modelBuilder.Entity<RemboursementsPenalite>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("remboursements_penalites_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DateRemboursement).HasDefaultValueSql("now()");

            entity.HasOne(d => d.ApprouveParNavigation).WithMany(p => p.RemboursementsPenalites)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_remb_admin");

            entity.HasOne(d => d.Penalite).WithMany(p => p.RemboursementsPenalites)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_remb_penalite");

            entity.HasOne(d => d.Transaction).WithMany(p => p.RemboursementsPenalites)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_remb_transaction");
        });

        modelBuilder.Entity<RemboursementsTransaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("remboursements_transactions_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.DateDemande).HasDefaultValueSql("now()");
            entity.Property(e => e.Statut).HasDefaultValueSql("'en_cours'::character varying");

            entity.HasOne(d => d.Transaction).WithMany(p => p.RemboursementsTransactions)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_remb_trans_transaction");
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("reservations_pkey");

            entity.ToTable("reservations", tb => tb.HasComment("Réservations de places sur les trajets"));

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DateDemande).HasDefaultValueSql("now()");
            entity.Property(e => e.EmbarquementConfirmeConducteur).HasDefaultValue(false);
            entity.Property(e => e.EmbarquementConfirmePassager).HasDefaultValue(false);
            entity.Property(e => e.MontantRembourse).HasDefaultValueSql("0.00");
            entity.Property(e => e.Statut).HasDefaultValueSql("'demande_envoyee'::character varying");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Passager).WithMany(p => p.Reservations)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_reservation_passager");

            entity.HasOne(d => d.Trajet).WithMany(p => p.Reservations)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_reservation_trajet");
        });

        modelBuilder.Entity<SessionsUtilisateur>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("sessions_utilisateur_pkey");

            entity.HasIndex(e => e.LocalisationConnexion, "idx_sessions_location").HasMethod("gist");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.LastActivity).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithMany(p => p.SessionsUtilisateurs).HasConstraintName("fk_sessions_user");
        });

        modelBuilder.Entity<Signalement>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("signalements_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DateSignalement).HasDefaultValueSql("now()");
            entity.Property(e => e.PenaliteAppliquee).HasDefaultValue(false);
            entity.Property(e => e.Statut).HasDefaultValueSql("'en_attente'::character varying");

            entity.HasOne(d => d.AdminResponsable).WithMany(p => p.SignalementAdminResponsables)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_signal_admin");

            entity.HasOne(d => d.Penalite).WithMany(p => p.Signalements)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_signal_penalite");

            entity.HasOne(d => d.Reservation).WithMany(p => p.Signalements)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_signal_reservation");

            entity.HasOne(d => d.Signale).WithMany(p => p.SignalementSignales)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_signal_signale");

            entity.HasOne(d => d.Signaleur).WithMany(p => p.SignalementSignaleurs)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_signal_signaleur");

            entity.HasOne(d => d.Trajet).WithMany(p => p.Signalements)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_signal_trajet");
        });

        modelBuilder.Entity<StatistiquesGlobale>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("statistiques_globales_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Co2TotalEconomiseKg).HasDefaultValueSql("0.00");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DemandesMultiplesUtilisees).HasDefaultValue(0);
            entity.Property(e => e.NbSignalements).HasDefaultValue(0);
            entity.Property(e => e.NbUrgencesActivees).HasDefaultValue(0);
            entity.Property(e => e.NouveauxUsers).HasDefaultValue(0);
            entity.Property(e => e.RevenusApp).HasDefaultValueSql("0.00");
            entity.Property(e => e.RevenusConducteurs).HasDefaultValueSql("0.00");
            entity.Property(e => e.TrajetsAnnules).HasDefaultValue(0);
            entity.Property(e => e.TrajetsCompletes).HasDefaultValue(0);
            entity.Property(e => e.TrajetsTotal).HasDefaultValue(0);
            entity.Property(e => e.UsersActifs).HasDefaultValue(0);
        });

        modelBuilder.Entity<StatistiquesUtilisateur>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("statistiques_utilisateur_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Co2EconomiseKg).HasDefaultValueSql("0.00");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DepensesPassager).HasDefaultValueSql("0.00");
            entity.Property(e => e.EconomieFinanciereEstimee).HasDefaultValueSql("0.00");
            entity.Property(e => e.EvaluationsRecues).HasDefaultValue(0);
            entity.Property(e => e.KmParcourus).HasDefaultValueSql("0.00");
            entity.Property(e => e.RevenusConducteur).HasDefaultValueSql("0.00");
            entity.Property(e => e.TrajetsConducteur).HasDefaultValue(0);
            entity.Property(e => e.TrajetsPassager).HasDefaultValue(0);

            entity.HasOne(d => d.User).WithMany(p => p.StatistiquesUtilisateurs).HasConstraintName("fk_stats_user");
        });

        modelBuilder.Entity<SuppressionsCompte>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("suppressions_compte_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DateSuppression).HasDefaultValueSql("now()");
            entity.Property(e => e.DonneesAnonymisees).HasDefaultValue(false);
            entity.Property(e => e.DonneesArchivees).HasDefaultValue(false);

            entity.HasOne(d => d.User).WithMany(p => p.SuppressionsComptes)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_suppression_user");
        });

        modelBuilder.Entity<Trajet>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trajets_pkey");

            entity.ToTable("trajets", tb => tb.HasComment("Trajets proposés par les conducteurs"));

            entity.HasIndex(e => e.PointArrivee, "idx_trajets_arrivee_geo").HasMethod("gist");

            entity.HasIndex(e => e.PointDepart, "idx_trajets_depart_geo").HasMethod("gist");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DetourMaxMinutes).HasDefaultValue(0);
            entity.Property(e => e.ItineraireFlexible).HasDefaultValue(false);
            entity.Property(e => e.PointArrivee).HasComment("Géolocalisation PostGIS du point d'arrivée (SRID 4326)");
            entity.Property(e => e.PointDepart).HasComment("Géolocalisation PostGIS du point de départ (SRID 4326)");
            entity.Property(e => e.PreferencesJson).HasDefaultValueSql("'{}'::jsonb");
            entity.Property(e => e.Recurrent).HasDefaultValue(false);
            entity.Property(e => e.ScoreMatchingMin).HasDefaultValueSql("0.00");
            entity.Property(e => e.Statut).HasDefaultValueSql("'publie'::character varying");
            entity.Property(e => e.TypeDepart).HasDefaultValueSql("'planifie'::character varying");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Conducteur).WithMany(p => p.Trajets)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_trajet_conducteur");

            entity.HasOne(d => d.TrajetRecurrent).WithMany(p => p.InverseTrajetRecurrent)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_trajet_recurrent");

            entity.HasOne(d => d.Vehicule).WithMany(p => p.Trajets)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_trajet_vehicule");

            entity.HasOne(d => d.ZoneArrivee).WithMany(p => p.TrajetZoneArrivees)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_trajet_zone_arrivee");

            entity.HasOne(d => d.ZoneDepart).WithMany(p => p.TrajetZoneDeparts)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_trajet_zone_depart");
        });

        modelBuilder.Entity<TrajetsRecurrent>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("trajets_recurrents_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Actif).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.NbInstancesGenerees).HasDefaultValue(0);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Conducteur).WithMany(p => p.TrajetsRecurrents).HasConstraintName("fk_recurrent_conducteur");

            entity.HasOne(d => d.TrajetTemplate).WithMany(p => p.TrajetsRecurrents).HasConstraintName("fk_recurrent_template");
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("transactions_pkey");

            entity.ToTable("transactions", tb => tb.HasComment("Transactions financières entre passagers et conducteurs"));

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.PenalitePrelevee).HasDefaultValueSql("0.00");
            entity.Property(e => e.Statut).HasDefaultValueSql("'pending'::character varying");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Conducteur).WithMany(p => p.TransactionConducteurs)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_transaction_conducteur");

            entity.HasOne(d => d.Passager).WithMany(p => p.TransactionPassagers)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_transaction_passager");

            entity.HasOne(d => d.Reservation).WithMany(p => p.Transactions)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_transaction_reservation");

            entity.HasOne(d => d.Trajet).WithMany(p => p.Transactions)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_transaction_trajet");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users", tb => tb.HasComment("Utilisateurs de la plateforme (passagers, conducteurs, admins)"));

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PreferencesJson).HasDefaultValueSql("'{}'::jsonb");
            entity.Property(e => e.ProfileVerified).HasDefaultValue(false);
            entity.Property(e => e.Role).HasDefaultValueSql("'passager'::character varying");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.VerifiedByNavigation).WithMany(p => p.InverseVerifiedByNavigation)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_verified_by");
        });

        modelBuilder.Entity<UsersBadge>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_badges_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.DateObtention).HasDefaultValueSql("now()");
            entity.Property(e => e.NotificationEnvoyee).HasDefaultValue(false);

            entity.HasOne(d => d.Badge).WithMany(p => p.UsersBadges).HasConstraintName("fk_user_badge_badge");

            entity.HasOne(d => d.User).WithMany(p => p.UsersBadges).HasConstraintName("fk_user_badge_user");
        });

        modelBuilder.Entity<VReservationsDetail>(entity =>
        {
            entity.ToView("v_reservations_details");
        });

        modelBuilder.Entity<VTrajetsDisponible>(entity =>
        {
            entity.ToView("v_trajets_disponibles");
        });

        modelBuilder.Entity<Vehicule>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("vehicules_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Actif).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Valide).HasDefaultValue(false);

            entity.HasOne(d => d.Conducteur).WithMany(p => p.Vehicules).HasConstraintName("fk_vehicule_conducteur");
        });

        modelBuilder.Entity<WaypointsTrajet>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("waypoints_trajet_pkey");

            entity.HasIndex(e => e.Position, "idx_waypoints_position").HasMethod("gist");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Trajet).WithMany(p => p.WaypointsTrajets).HasConstraintName("fk_waypoint_trajet");
        });

        modelBuilder.Entity<ZonesCampus>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("zones_campus_pkey");

            entity.HasIndex(e => e.Perimetre, "idx_zones_perimetre").HasMethod("gist");

            entity.HasIndex(e => e.Position, "idx_zones_position").HasMethod("gist");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Actif).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
