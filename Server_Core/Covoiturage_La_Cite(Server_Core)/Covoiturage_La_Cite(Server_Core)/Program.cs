using Covoiturage_La_Cite_Server_Core_.Api.Configurations;
using Covoiturage_La_Cite_Server_Core_.Api.Hubs;
using Covoiturage_La_Cite_Server_Core_.Api.Middlewares;
using Covoiturage_La_Cite_Server_Core_.Application.Interfaces;
using Covoiturage_La_Cite_Server_Core_.Application.Jobs;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Admin;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Auth;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Campus;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Chat;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Content;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Finance;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Gamification;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Gps;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Matching;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Media;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Notification;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Onboarding;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Pipeda;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Places;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Reservation;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Security;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Social;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Sse;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Stats;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Trip;
using Covoiturage_La_Cite_Server_Core_.Application.Services.User;
using Covoiturage_La_Cite_Server_Core_.Application.Services.Vehicle;
using Covoiturage_La_Cite_Server_Core_.Data.MongoDB;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.AdminRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.CampusRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.FinanceRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.GamificationRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.GpsRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.MediaLogRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.MediaStorageRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.NotificationRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.PipedaRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.ReservationRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.SecurityRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.SocialRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.TrajetRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.UserRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.VehiculeRepository;
using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Seeding;
using FluentValidation;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.EntityFrameworkCore;
using Serilog;

// ── Connection string helper (URI → Npgsql key-value) ────────────────────────
static string ToNpgsqlKeyValue(string? cs)
{
    if (string.IsNullOrWhiteSpace(cs)) return string.Empty;
    cs = cs.Trim();
    if (!cs.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
        !cs.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        return cs;

    var uri = new Uri(cs);
    var parts = uri.UserInfo.Split(':', 2);
    var user = Uri.UnescapeDataString(parts[0]);
    var pass = parts.Length > 1 ? Uri.UnescapeDataString(parts[1]) : string.Empty;
    var db   = uri.AbsolutePath.TrimStart('/');
    var port = uri.IsDefaultPort ? 5432 : uri.Port;
    return $"Host={uri.Host};Port={port};Database={db};Username={user};Password={pass};SSL Mode=Require;Trust Server Certificate=true";
}

// ── Serilog bootstrap ───────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog complet ─────────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console());

    // ── PostgreSQL / EF Core ─────────────────────────────────────────────────
    var connStr = ToNpgsqlKeyValue(builder.Configuration.GetConnectionString("DefaultConnection"));
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connStr, o => o.UseNetTopologySuite())
        .ConfigureWarnings(w => w
            .Ignore(Microsoft.EntityFrameworkCore.Diagnostics.CoreEventId.PossibleIncorrectRequiredNavigationWithQueryFilterInteractionWarning)));

    // ── MongoDB ──────────────────────────────────────────────────────────────
    builder.Services.AddSingleton<MongoDbContext>();

    // ── Authentication JWT ───────────────────────────────────────────────────
    builder.Services.AddJwtAuth(builder.Configuration);

    // ── Hangfire ─────────────────────────────────────────────────────────────
    var hangfireDisabled = builder.Configuration["HANGFIRE_DISABLED"] == "true";
    if (!hangfireDisabled)
    {
        builder.Services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(c => c.UseNpgsqlConnection(connStr)));
        builder.Services.AddHangfireServer();
    }

    // ── Redis (IDistributedCache) ─────────────────────────────────────────────
    builder.Services.AddStackExchangeRedisCache(options =>
        options.Configuration = builder.Configuration["Redis:ConnectionString"]);
    builder.Services.AddDistributedMemoryCache();

    // ── SignalR ───────────────────────────────────────────────────────────────
    builder.Services.AddSignalR();

    // ── FluentValidation ──────────────────────────────────────────────────────
    builder.Services.AddValidatorsFromAssemblyContaining<Program>();

    // ── Controllers + OpenAPI ────────────────────────────────────────────────
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(
                new System.Text.Json.Serialization.JsonStringEnumConverter());
        });
    builder.Services.AddOpenApi();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // ── CORS (dev: AllowAll → prod: whitelist domaine web uniquement) ─────────
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("WebClientOnly", policy =>
        {
            var allowedOrigin = builder.Configuration["Cors:AllowedOrigin"] ?? "http://localhost:3000";
            policy.WithOrigins(allowedOrigin)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    });

    // ── Application Services ─────────────────────────────────────────────────
    // P0 — Auth
    builder.Services.AddScoped<TokenService>();
    builder.Services.AddScoped<MicrosoftSsoService>();
    builder.Services.AddSingleton<SessionCodeService>();
    builder.Services.AddHostedService<SessionCodeCleanupService>();
    builder.Services.AddScoped<IAuthSessionRepository, AuthSessionRepository>();
    builder.Services.AddScoped<IAuthSessionService, AuthSessionService>();
    builder.Services.AddScoped<IEmailService, EmailService>();
    builder.Services.AddHostedService<AuthSessionCleanupService>();

    // P1 — Users & Auth
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IUserProvisioningService, UserProvisioningService>();

    // P2 — Trajets
    builder.Services.AddScoped<ITrajetRepository, TrajetRepository>();
    builder.Services.AddScoped<ITrajetService, TrajetService>();

    // P3 — Réservations
    builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
    builder.Services.AddScoped<IReservationService, ReservationService>();

    // Onboarding
    builder.Services.AddScoped<IOnboardingService, OnboardingService>();

    // P4 — Véhicules
    builder.Services.AddScoped<IVehiculeRepository, VehiculeRepository>();
    builder.Services.AddScoped<IVehiculeService, VehiculeService>();

    // P5 — Finances
    builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
    builder.Services.AddScoped<IPenaltyRepository, PenaltyRepository>();
    builder.Services.AddScoped<IWithdrawalRepository, WithdrawalRepository>();
    builder.Services.AddScoped<IFinanceService, FinanceService>();

    // P6 — Notifications
    builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
    builder.Services.AddScoped<INotificationService, NotificationService>();

    // P7 — Social (Reviews, Favoris, Reports)
    builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
    builder.Services.AddScoped<IAffinityRepository, AffinityRepository>();
    builder.Services.AddScoped<IReportRepository, ReportRepository>();
    builder.Services.AddScoped<IReviewService, ReviewService>();
    builder.Services.AddScoped<IAffinityService, AffinityService>();
    builder.Services.AddScoped<IReportService, ReportService>();

    // P8 — Gamification
    builder.Services.AddScoped<IBadgeRepository, BadgeRepository>();
    builder.Services.AddScoped<IUserBadgeRepository, UserBadgeRepository>();
    builder.Services.AddScoped<IEcoChallengeRepository, EcoChallengeRepository>();
    builder.Services.AddScoped<IChallengeParticipationRepository, ChallengeParticipationRepository>();
    builder.Services.AddScoped<IGamificationService, GamificationService>();
    builder.Services.AddScoped<IGoTaskRepository, GoTaskRepository>();
    builder.Services.AddScoped<IUserGoTaskProgressionRepository, UserGoTaskProgressionRepository>();
    builder.Services.AddScoped<IGoTaskService, GoTaskService>();

    // SSE (singleton — channel per user)
    builder.Services.AddSingleton<SseChannelService>();

    // P9 — GPS / Tracking
    builder.Services.AddScoped<IGpsPositionRepository, GpsPositionRepository>();
    builder.Services.AddScoped<ISosAlertRepository, SosAlertRepository>();
    builder.Services.AddScoped<IGpsTrackingService, GpsTrackingService>();

    // P10 — Campus
    builder.Services.AddScoped<IGeofenceZoneRepository, GeofenceZoneRepository>();
    builder.Services.AddScoped<IWaypointTripRepository, WaypointTripRepository>();
    builder.Services.AddScoped<ICampusService, CampusService>();

    // P11 — Admin
    builder.Services.AddScoped<IPlatformConfigRepository, PlatformConfigRepository>();
    builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
    builder.Services.AddScoped<IPlatformStatsRepository, PlatformStatsRepository>();
    builder.Services.AddScoped<IAdminService, AdminService>();

    // P12 — SignalR
    builder.Services.AddSingleton<SignalREventService>();

    // P13 — Hangfire Jobs
    builder.Services.AddScoped<IHangfireJobRegistrar, HangfireJobRegistrar>();

    // P14 — Matching v4
    builder.Services.AddScoped<IMatchingService, MatchingService>();
    // P15 — Security (Double Lock ECC-P256)
    builder.Services.AddScoped<IClientCertificateRepository, ClientCertificateRepository>();
    builder.Services.AddScoped<IUserSecurityActivityRepository, UserSecurityActivityRepository>();
    builder.Services.AddScoped<ICertificateRotationEventRepository, CertificateRotationEventRepository>();
    builder.Services.AddScoped<IWebSessionKeyRepository, WebSessionKeyRepository>();
    builder.Services.AddScoped<ISecurityService, SecurityService>();

    // P16 — PIPEDA Compliance
    builder.Services.AddScoped<IConsentementRepository, ConsentementRepository>();
    builder.Services.AddScoped<IDataExportRepository, DataExportRepository>();
    builder.Services.AddScoped<IPipedaComplianceService, PipedaComplianceService>();

    // P17 — Chat instantané
    builder.Services.AddScoped<IChatService, ChatService>();

    // P18 — Contenu éditorial (Astuces + Nouveautés)
    builder.Services.AddScoped<IContentService, ContentService>();

    // P19 — FAQ (Foire Aux Questions) — MongoDB
    builder.Services.AddScoped<IFaqService, FaqService>();

    builder.Services.AddScoped<IMediaStorageRepository, MediaStorageRepository>();
    builder.Services.AddScoped<IMediaLogRepository, MediaLogRepository>();
    builder.Services.AddScoped<IMediaStorageService, MediaStorageService>();

    // P20 — Lieux favoris (PlaceFavori) — PostgreSQL
    builder.Services.AddScoped<IPlaceFavoriService, PlaceFavoriService>();

    // P21 — Statistiques utilisateur — PostgreSQL
    builder.Services.AddScoped<IUserStatsService, UserStatsService>();
    // ─────────────────────────────────────────────────────────────────────────
    var app = builder.Build();

    // ── EF Core migrations ───────────────────────────────────────────────────
    {
        using var migScope = app.Services.CreateScope();
        var migDb     = migScope.ServiceProvider.GetRequiredService<AppDbContext>();
        var migLogger = migScope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("EFMigrations");
        try
        {
            migDb.Database.Migrate();
            migLogger.LogInformation("[EF] Migrations appliquées avec succès");
        }
        catch (Exception ex)
        {
            migLogger.LogError(ex, "[EF] Échec des migrations — arrêt du serveur");
            throw;
        }
    }

    // ── MongoDB initialization (indexes + seed) ───────────────────────────────
    {
        var mongoCtx = app.Services.GetRequiredService<MongoDbContext>();
        var mongoLogger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("MongoDbInitializer");
        await MongoDbInitializer.InitializeAsync(mongoCtx, mongoLogger);
    }

    if (app.Environment.IsDevelopment()) // Seed de données de dev (users, trajets, etc.)
    {
        using var seedScope = app.Services.CreateScope();
        var db = seedScope.ServiceProvider.GetRequiredService<AppDbContext>();
        var seedLogger = seedScope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseSeeder");
        await DatabaseSeeder.SeedAsync(db, seedLogger);
    }

    // ── Middleware pipeline ───────────────────────────────────────────────────
    app.UseMiddleware<ExceptionMiddleware>();
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    if (!app.Environment.IsDevelopment())
        app.UseHttpsRedirection();

    app.UseCors("WebClientOnly");
    app.UseAuthentication();
    app.UseMiddleware<WebSessionKeyMiddleware>();
    // app.UseMiddleware<CertificateValidationMiddleware>(); // Activer lors du sprint mobile
    app.UseAuthorization();

    // ── Hangfire Dashboard (dev seulement) ────────────────────────────────────
    if (app.Environment.IsDevelopment())
    {
        app.UseHangfireDashboard("/hangfire");
    }

    app.MapControllers();

    // ── SignalR Hub ────────────────────────────────────────────────────────────
    app.MapHub<CovoiturageHub>("/hubs/covoiturage");

    // ── Hangfire Jobs ─────────────────────────────────────────────────────────
    try
    {
        using var scope = app.Services.CreateScope();
        scope.ServiceProvider.GetRequiredService<IHangfireJobRegistrar>().RegisterAll();
    }
    catch (Exception ex)
    {
        var startupLogger = app.Services.GetRequiredService<ILogger<Program>>();
        startupLogger.LogWarning(ex, "[Hangfire] Enregistrement des jobs échoué — le serveur démarre sans jobs récurrents");
    }

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Démarrage du serveur échoué");
}
finally
{
    Log.CloseAndFlush();
}
