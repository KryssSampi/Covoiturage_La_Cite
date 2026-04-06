using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ── Core ─────────────────────────────────────────────────────────────────
    public DbSet<User> Users => Set<User>();
    public DbSet<DriverProfile> DriverProfiles => Set<DriverProfile>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<DriverDocument> DriverDocuments => Set<DriverDocument>();
    public DbSet<UserPreferences> UserPreferences => Set<UserPreferences>();
    public DbSet<UserStat> UserStats => Set<UserStat>();
    public DbSet<UserBehaviorPattern> UserBehaviorPatterns => Set<UserBehaviorPattern>();

    // ── Trips & Reservations ─────────────────────────────────────────────────
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<WaypointTrip> WaypointTrips => Set<WaypointTrip>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<GpsPosition> GpsPositions => Set<GpsPosition>();

    // ── Finance ───────────────────────────────────────────────────────────────
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Penalty> Penalties => Set<Penalty>();
    public DbSet<Withdrawal> Withdrawals => Set<Withdrawal>();

    // ── Social ────────────────────────────────────────────────────────────────
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Affinity> Affinities => Set<Affinity>();
    public DbSet<Notification> Notifications => Set<Notification>();

    // ── Safety ────────────────────────────────────────────────────────────────
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<SosAlert> SosAlerts => Set<SosAlert>();

    // ── Gamification ─────────────────────────────────────────────────────────
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<UserBadge> UserBadges => Set<UserBadge>();
    public DbSet<EcoChallenge> EcoChallenges => Set<EcoChallenge>();
    public DbSet<ChallengeParticipation> ChallengeParticipations => Set<ChallengeParticipation>();
    public DbSet<GoTask> GoTasks => Set<GoTask>();
    public DbSet<UserGoTaskProgression> UserGoTaskProgressions => Set<UserGoTaskProgression>();
    public DbSet<MatchingScoreCache> MatchingScoreCaches => Set<MatchingScoreCache>();
    public DbSet<SmartSuggestion> SmartSuggestions => Set<SmartSuggestion>();
    public DbSet<UserLike> UserLikes => Set<UserLike>();
    public DbSet<SurveyTripAlert> SurveyTripAlerts => Set<SurveyTripAlert>();

    // ── Campus ────────────────────────────────────────────────────────────────
    public DbSet<GeofenceZone> GeofenceZones => Set<GeofenceZone>();

    // ── Platform ──────────────────────────────────────────────────────────────
    public DbSet<PlatformConfig> PlatformConfigs => Set<PlatformConfig>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<PlatformStats> PlatformStats => Set<PlatformStats>();

    // ── Security ─────────────────────────────────────────────────────────────
    public DbSet<ClientCertificate> ClientCertificates => Set<ClientCertificate>();
    public DbSet<UserSecurityActivity> UserSecurityActivities => Set<UserSecurityActivity>();
    public DbSet<WebSessionKey> WebSessionKeys => Set<WebSessionKey>();
    public DbSet<CertificateRotationEvent> CertificateRotationEvents => Set<CertificateRotationEvent>();
    public DbSet<AuthSession> AuthSessions => Set<AuthSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.MicrosoftSsoId).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
            e.Property(u => u.SchoolRole).HasConversion<string>();
            e.Property(u => u.Status).HasConversion<string>();
            e.Property(u => u.LanguagesSpoken).HasColumnType("text[]");
            e.Property(u => u.IdentityVerificationPhotos).HasColumnType("text[]");
            e.HasOne(u => u.DriverProfile).WithOne(d => d.User)
                .HasForeignKey<DriverProfile>(d => d.UserId);
            e.HasOne(u => u.Preferences).WithOne(p => p.User)
                .HasForeignKey<UserPreferences>(p => p.UserId);
            e.HasOne(u => u.Stats).WithOne(s => s.User)
                .HasForeignKey<UserStat>(s => s.UserId);
            e.HasQueryFilter(u => u.DeletedAt == null);
        });

        // ── DriverProfile ─────────────────────────────────────────────────────
        modelBuilder.Entity<DriverProfile>(e =>
        {
            e.HasKey(d => d.Id);
            e.Property(d => d.ValidationStatus).HasConversion<string>();
            e.HasMany(d => d.Vehicles).WithOne(v => v.DriverProfile)
                .HasForeignKey(v => v.DriverProfileId);
            e.HasMany(d => d.Documents).WithOne(doc => doc.DriverProfile)
                .HasForeignKey(doc => doc.DriverProfileId);
        });

        // ── Trip ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<Trip>(e =>
        {
            e.HasKey(t => t.Id);
            e.HasIndex(t => t.DriverId);
            e.HasIndex(t => t.Status);
            e.HasIndex(t => t.DepartureDate);
            e.Property(t => t.Status).HasConversion<string>();
            e.Property(t => t.TripType).HasConversion<string>();
            e.Property(t => t.PaymentMethod).HasConversion<string>();
            e.Property(t => t.ConversationLevel).HasConversion<string>();
            e.HasOne(t => t.Driver).WithMany(u => u.Trips)
                .HasForeignKey(t => t.DriverId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.Vehicle).WithMany(v => v.Trips)
                .HasForeignKey(t => t.VehicleId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.ParentTrip).WithMany(t => t.RecurringInstances)
                .HasForeignKey(t => t.ParentTripId).OnDelete(DeleteBehavior.SetNull);
            e.Property(t => t.DeparturePoint).HasColumnType("geography (point, 4326)");
            e.Property(t => t.ArrivalPoint).HasColumnType("geography (point, 4326)");
        });

        // ── Reservation ───────────────────────────────────────────────────────
        modelBuilder.Entity<Reservation>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasIndex(r => r.TripId);
            e.HasIndex(r => r.PassengerId);
            e.Property(r => r.Status).HasConversion<string>();
            e.Property(r => r.PaymentStatus).HasConversion<string>();
            e.HasOne(r => r.Trip).WithMany(t => t.Reservations)
                .HasForeignKey(r => r.TripId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Passenger).WithMany(u => u.Reservations)
                .HasForeignKey(r => r.PassengerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Driver).WithMany()
                .HasForeignKey(r => r.DriverId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── GpsPosition ───────────────────────────────────────────────────────
        modelBuilder.Entity<GpsPosition>(e =>
        {
            e.HasKey(g => g.Id);
            e.HasIndex(g => new { g.TripId, g.CapturedAt });
            e.Property(g => g.Location).HasColumnType("geography (point, 4326)");
        });

        // ── Review ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Review>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasIndex(r => r.ReservationId).IsUnique();
            e.Property(r => r.RevieweeRole).HasConversion<string>();
            e.HasOne(r => r.Reviewer).WithMany(u => u.ReviewsGiven)
                .HasForeignKey(r => r.ReviewerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Reviewee).WithMany(u => u.ReviewsReceived)
                .HasForeignKey(r => r.RevieweeId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── Affinity ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Affinity>(e =>
        {
            e.HasKey(a => a.Id);
            e.HasIndex(a => new { a.UserId, a.TargetUserId }).IsUnique();
            e.HasOne(a => a.User).WithMany()
                .HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(a => a.TargetUser).WithMany()
                .HasForeignKey(a => a.TargetUserId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── Penalty ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Penalty>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Type).HasConversion<string>();
            e.Property(p => p.Status).HasConversion<string>();
        });

        // ── PlatformConfig ────────────────────────────────────────────────────
        modelBuilder.Entity<PlatformConfig>(e =>
        {
            e.HasKey(c => c.Key);
        });

        // ── AuditLog ──────────────────────────────────────────────────────────
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasKey(a => a.Id);
            e.HasIndex(a => new { a.EntityType, a.EntityId });
            e.HasIndex(a => a.ActorId);
            e.HasIndex(a => a.CreatedAt);
        });

        // ── UserBadge ─────────────────────────────────────────────────────────
        modelBuilder.Entity<UserBadge>(e =>
        {
            e.HasKey(ub => ub.Id);
            e.HasIndex(ub => new { ub.UserId, ub.BadgeId }).IsUnique();
            e.HasOne(ub => ub.User).WithMany(u => u.Badges)
                .HasForeignKey(ub => ub.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ub => ub.Badge).WithMany(b => b.UserBadges)
                .HasForeignKey(ub => ub.BadgeId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── MatchingScoreCache ─────────────────────────────────────────────────
        modelBuilder.Entity<MatchingScoreCache>(e =>
        {
            e.HasKey(m => m.Id);
            e.HasIndex(m => new { m.TripId, m.PassengerId }).IsUnique();
        });

        // ── GeofenceZone ───────────────────────────────────────────────────────
        modelBuilder.Entity<GeofenceZone>(e =>
        {
            e.HasKey(g => g.Id);
            e.Property(g => g.CenterPoint).HasColumnType("geography (point, 4326)");
            e.Property(g => g.Polygon).HasColumnType("geography (polygon, 4326)");
        });

        // ── Security ──────────────────────────────────────────────────────────
        modelBuilder.Entity<ClientCertificate>(e =>
        {
            e.HasKey(c => c.Id);
            e.HasIndex(c => c.UserId);
            e.HasIndex(c => c.DeviceFingerprint).IsUnique();
        });

        modelBuilder.Entity<UserSecurityActivity>(e =>
        {
            e.HasKey(a => a.Id);
            e.HasIndex(a => new { a.UserId, a.RecordedAt });
        });

        modelBuilder.Entity<WebSessionKey>(e =>
        {
            e.HasKey(w => w.Id);
            e.HasIndex(w => w.UserId);
            e.HasIndex(w => w.KeyHash).IsUnique();
        });

        modelBuilder.Entity<Transaction>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.PaymentMethod).HasConversion<string>();
            e.Property(t => t.Status).HasConversion<string>();
            e.HasOne(t => t.Passenger).WithMany()
                .HasForeignKey(t => t.PassengerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.Driver).WithMany()
                .HasForeignKey(t => t.DriverId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Notification>(e =>
        {
            e.HasKey(n => n.Id);
            e.HasIndex(n => n.UserId);
            e.HasIndex(n => n.CreatedAt);
            e.Property(n => n.Type).HasConversion<string>();
        });

        modelBuilder.Entity<SmartSuggestion>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasIndex(s => s.UserId);
            e.Property(s => s.SuggestionType).HasConversion<string>();
        });

        modelBuilder.Entity<UserBehaviorPattern>(e =>
        {
            e.HasKey(b => b.Id);
            e.HasIndex(b => b.UserId).IsUnique();
            e.Property(b => b.ChurnRisk).HasConversion<string>();
        });

        modelBuilder.Entity<Report>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasIndex(r => r.PublicReference).IsUnique();
            e.Property(r => r.Category).HasConversion<string>();
            e.HasOne(r => r.Reporter).WithMany(u => u.ReportsFiled)
                .HasForeignKey(r => r.ReporterId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.ReportedUser).WithMany()
                .HasForeignKey(r => r.ReportedUserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Trip).WithMany()
                .HasForeignKey(r => r.TripId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DriverDocument>(e =>
        {
            e.HasKey(d => d.Id);
            e.Property(d => d.DocumentType).HasConversion<string>();
        });

        modelBuilder.Entity<ChallengeParticipation>(e =>
        {
            e.HasKey(c => c.Id);
            e.HasIndex(c => new { c.UserId, c.EcoChallengeId }).IsUnique();
        });

        // ── AuthSession ───────────────────────────────────────────────────────
        modelBuilder.Entity<AuthSession>(e =>
        {
            e.HasKey(a => a.Id);
            e.HasIndex(a => a.IdKeyHash).IsUnique();
            e.HasIndex(a => a.PublicId).IsUnique();
            e.HasIndex(a => a.ExpiresAt);
        });

        // ── GoTask ────────────────────────────────────────────────────────────
        modelBuilder.Entity<GoTask>(e =>
        {
            e.HasKey(t => t.Id);
            e.HasIndex(t => t.TaskKey).IsUnique();
            e.HasMany(t => t.Progressions).WithOne(p => p.GoTask)
                .HasForeignKey(p => p.GoTaskId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserGoTaskProgression>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasIndex(p => new { p.UserId, p.GoTaskId }).IsUnique();
            e.HasOne(p => p.User).WithMany()
                .HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── UserLike ──────────────────────────────────────────────────────────
        modelBuilder.Entity<UserLike>(e =>
        {
            e.HasKey(l => l.Id);
            e.HasIndex(l => new { l.LikerId, l.LikedId }).IsUnique(); // un like par paire
            e.HasOne(l => l.Liker).WithMany(u => u.LikesGiven)
                .HasForeignKey(l => l.LikerId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(l => l.Liked).WithMany(u => u.LikesReceived)
                .HasForeignKey(l => l.LikedId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── SurveyTripAlert ────────────────────────────────────────────────────
        modelBuilder.Entity<SurveyTripAlert>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasIndex(s => new { s.UserId, s.DriverId, s.DepartureLabel, s.ArrivalLabel });
            e.HasOne(s => s.User).WithMany(u => u.SurveyAlerts)
                .HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.Driver).WithMany(u => u.SurveyAlertsAsDriver)
                .HasForeignKey(s => s.DriverId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
