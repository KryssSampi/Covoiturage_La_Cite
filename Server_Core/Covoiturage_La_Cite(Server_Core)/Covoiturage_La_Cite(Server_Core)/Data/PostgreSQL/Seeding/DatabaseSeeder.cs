using Covoiturage_La_Cite_Server_Core_.Domain.Entities;
using Covoiturage_La_Cite_Server_Core_.Domain.Entities.Security;
using Covoiturage_La_Cite_Server_Core_.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Seeding;

public static class DatabaseSeeder
{
    // ── Mot de passe commun à tous les utilisateurs de test ───────────────────
    // Mot de passe clair : Test@2026!
    // Hash BCrypt (cost=11) généré une fois et réutilisé pour perf au démarrage
    private static readonly string TestPasswordHash = BCrypt.Net.BCrypt.HashPassword("Test@2026!");

    // ──────────────────────────────────────────────────────────────────────────
    // CREDENTIALS DE TEST
    // ──────────────────────────────────────────────────────────────────────────
    // Tous les comptes : mot de passe = Test@2026!   OTP = bypassé (DisabledOtp = true)
    //
    // Admin     : 1234567@collegelacite.ca
    // Driver 1  : 2345671@collegelacite.ca   (Marc Tremblay)
    // Driver 2  : 3456712@collegelacite.ca   (Sarah Nguyen)
    // Driver 3  : 6712345@collegelacite.ca   (Karim Boudier)
    // Driver 4  : 7123456@collegelacite.ca   (Priya Sharma)
    // Driver 5  : 8234567@collegelacite.ca   (Jordan Leblanc)
    // Passenger1: 4567123@collegelacite.ca   (Alice Roy)
    // Passenger2: 5671234@collegelacite.ca   (Leo Martin)
    // Passenger3: 9345678@collegelacite.ca   (Fatou Diallo)
    // Passenger4: 0456789@collegelacite.ca   (Yan Chen)
    // ──────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Injecte un jeu de données cohérent couvrant toutes les tables PostgreSQL principales.
    /// </summary>
    public static async Task SeedAsync(AppDbContext db, ILogger logger, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(db);
        ArgumentNullException.ThrowIfNull(logger);

        await db.Database.MigrateAsync(ct);

        var seedKey = "seed.version";
        var seedVersion = "v1";

        var alreadySeeded = await db.PlatformConfigs
            .AsNoTracking()
            .AnyAsync(c => c.Key == seedKey && c.Value == seedVersion, ct);

        if (alreadySeeded)
        {
            logger.LogInformation("DatabaseSeeder: données déjà injectées ({SeedVersion})", seedVersion);
            // Patch toujours appliqué même si seed déjà fait — met à jour les comptes de test
            await PatchTestUsersAsync(db, logger, ct);
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var gf = new GeometryFactory(new PrecisionModel(), 4326);

        // Users
        var adminId = Guid.Parse("10000000-0000-0000-0000-000000000001");
        var driver1Id = Guid.Parse("10000000-0000-0000-0000-000000000002");
        var driver2Id = Guid.Parse("10000000-0000-0000-0000-000000000003");
        var passenger1Id = Guid.Parse("10000000-0000-0000-0000-000000000004");
        var passenger2Id = Guid.Parse("10000000-0000-0000-0000-000000000005");

        var users = new[]
        {
            new User
            {
                Id = adminId,
                Email = "1234567@collegelacite.ca",
                MicrosoftSsoId = "aad-admin-001",
                PasswordHash = TestPasswordHash,
                FirstName = "Admin",
                LastName = "LaCite",
                Role = UserRole.Admin,
                SchoolRole = SchoolRole.Administrateur,
                Status = UserStatus.Active,
                IsProfileVerified = true,
                CanBeDriver = false,
                GoScore = 95,
                ReputationPoints = 500,
                Language = "fr",
                PhoneNumber = "+1-514-000-0001",
                DisabledOtp = true,
                DisabledOtpAt = now,
                AlreadySignPolitics = true,
                AlreadySetAProfilePicture = true,
                AlreadySubmittedAllVehiculeDocument = true,
                OnboardingCompleted = true,
                CreatedAt = now.AddMonths(-6),
                UpdatedAt = now.AddDays(-1),
                LastLoginAt = now.AddMinutes(-30)
            },
            new User
            {
                Id = driver1Id,
                Email = "2345671@collegelacite.ca",
                MicrosoftSsoId = "aad-driver-001",
                PasswordHash = TestPasswordHash,
                FirstName = "Marc",
                LastName = "Tremblay",
                Role = UserRole.Driver,
                SchoolRole = SchoolRole.MembreDuPersonnel,
                Status = UserStatus.Active,
                IsProfileVerified = true,
                CanBeDriver = true,
                GoScore = 87,
                ReputationPoints = 340,
                Language = "fr",
                PhoneNumber = "+1-514-000-0002",
                Bio = "Conducteur ponctuel et calme.",
                DisabledOtp = true,
                DisabledOtpAt = now,
                AlreadySignPolitics = true,
                AlreadySetAProfilePicture = true,
                AlreadySubmittedAllVehiculeDocument = true,
                OnboardingCompleted = true,
                CreatedAt = now.AddMonths(-5),
                UpdatedAt = now.AddDays(-1),
                LastLoginAt = now.AddHours(-2)
            },
            new User
            {
                Id = driver2Id,
                Email = "3456712@collegelacite.ca",
                MicrosoftSsoId = "aad-driver-002",
                PasswordHash = TestPasswordHash,
                FirstName = "Sarah",
                LastName = "Nguyen",
                Role = UserRole.Driver,
                SchoolRole = SchoolRole.Professeur,
                Status = UserStatus.Active,
                IsProfileVerified = true,
                CanBeDriver = true,
                GoScore = 82,
                ReputationPoints = 290,
                Language = "en",
                PhoneNumber = "+1-514-000-0003",
                Bio = "Friendly rides around campus.",
                DisabledOtp = true,
                DisabledOtpAt = now,
                AlreadySignPolitics = true,
                AlreadySetAProfilePicture = true,
                AlreadySubmittedAllVehiculeDocument = true,
                OnboardingCompleted = true,
                CreatedAt = now.AddMonths(-4),
                UpdatedAt = now.AddDays(-1),
                LastLoginAt = now.AddHours(-6)
            },
            new User
            {
                Id = passenger1Id,
                Email = "4567123@collegelacite.ca",
                MicrosoftSsoId = "aad-passenger-001",
                PasswordHash = TestPasswordHash,
                FirstName = "Alice",
                LastName = "Roy",
                Role = UserRole.Passenger,
                SchoolRole = SchoolRole.Etudiant,
                Status = UserStatus.Active,
                IsProfileVerified = true,
                CanBeDriver = false,
                GoScore = 78,
                ReputationPoints = 180,
                Language = "fr",
                PhoneNumber = "+1-514-000-0004",
                DisabledOtp = true,
                DisabledOtpAt = now,
                AlreadySignPolitics = true,
                AlreadySetAProfilePicture = true,
                AlreadySubmittedAllVehiculeDocument = true,
                OnboardingCompleted = true,
                CreatedAt = now.AddMonths(-3),
                UpdatedAt = now.AddDays(-2),
                LastLoginAt = now.AddHours(-4)
            },
            new User
            {
                Id = passenger2Id,
                Email = "5671234@collegelacite.ca",
                MicrosoftSsoId = "aad-passenger-002",
                PasswordHash = TestPasswordHash,
                FirstName = "Leo",
                LastName = "Martin",
                Role = UserRole.Passenger,
                SchoolRole = SchoolRole.Etudiant,
                Status = UserStatus.Active,
                IsProfileVerified = false,
                CanBeDriver = false,
                GoScore = 71,
                ReputationPoints = 120,
                Language = "fr",
                PhoneNumber = "+1-514-000-0005",
                DisabledOtp = true,
                DisabledOtpAt = now,
                AlreadySignPolitics = true,
                AlreadySetAProfilePicture = true,
                AlreadySubmittedAllVehiculeDocument = true,
                OnboardingCompleted = true,
                CreatedAt = now.AddMonths(-2),
                UpdatedAt = now.AddDays(-3),
                LastLoginAt = now.AddDays(-1)
            }
        };

        await db.Users.AddRangeAsync(users, ct);

        // Profiles / preferences / stats / behavior
        var driverProfile1Id = Guid.Parse("20000000-0000-0000-0000-000000000001");
        var driverProfile2Id = Guid.Parse("20000000-0000-0000-0000-000000000002");

        await db.DriverProfiles.AddRangeAsync(
            new DriverProfile
            {
                Id = driverProfile1Id,
                UserId = driver1Id,
                ValidationStatus = DriverValidationStatus.Approved,
                ValidatedAt = now.AddMonths(-5),
                ValidatedByAdminId = adminId,
                AverageRating = 4.8m,
                TotalTripsAsDriver = 42,
                CancellationRate = 0.03m,
                PunctualityScore = 94,
                NoShowCount = 0,
                Co2SavedKg = 120.5m,
                BalanceAvailable = 380.25m,
                BalancePending = 62.50m,
                BalancePenalties = 10m,
                WithholdingRate = 0.15m
            },
            new DriverProfile
            {
                Id = driverProfile2Id,
                UserId = driver2Id,
                ValidationStatus = DriverValidationStatus.Approved,
                ValidatedAt = now.AddMonths(-4),
                ValidatedByAdminId = adminId,
                AverageRating = 4.6m,
                TotalTripsAsDriver = 28,
                CancellationRate = 0.04m,
                PunctualityScore = 90,
                NoShowCount = 1,
                Co2SavedKg = 88.2m,
                BalanceAvailable = 240.10m,
                BalancePending = 33.75m,
                BalancePenalties = 0m,
                WithholdingRate = 0.15m
            });

        await db.UserPreferences.AddRangeAsync(
            users.Select(u => new UserPreferences
            {
                Id = Guid.NewGuid(),
                UserId = u.Id,
                MusicAccepted = true,
                HasPets = false,
                SmokesRegularly = false,
                TypicalBaggage = true,
                ConversationLevel = ConversationLevel.Moderate,
                EmailNotifications = true,
                PushNotifications = true,
                Language = u.Language
            }),
            ct);

        await db.UserStats.AddRangeAsync(
            new UserStat
            {
                Id = Guid.NewGuid(),
                UserId = driver1Id,
                TotalTripsAsDriver = 42,
                TotalTripsAsPassenger = 5,
                TotalCo2SavedKg = 120.5m,
                TotalDistanceKm = 1150,
                AverageRatingAsDriver = 4.8m,
                AverageRatingAsPassenger = 4.7m,
                TotalReviewsGiven = 18,
                TotalReviewsReceived = 20,
                TotalPenalties = 1,
                TotalEarningsDriver = 2450,
                TotalSpentPassenger = 95,
                BadgesCount = 2,
                ChallengesCompleted = 1,
                LastTripDate = now.AddDays(-2),
                RecomputedAt = now
            },
            new UserStat
            {
                Id = Guid.NewGuid(),
                UserId = passenger1Id,
                TotalTripsAsDriver = 0,
                TotalTripsAsPassenger = 16,
                TotalCo2SavedKg = 54.3m,
                TotalDistanceKm = 380,
                AverageRatingAsDriver = 0,
                AverageRatingAsPassenger = 4.9m,
                TotalReviewsGiven = 8,
                TotalReviewsReceived = 7,
                TotalPenalties = 0,
                TotalEarningsDriver = 0,
                TotalSpentPassenger = 220,
                BadgesCount = 1,
                ChallengesCompleted = 1,
                LastTripDate = now.AddDays(-3),
                RecomputedAt = now
            });

        await db.UserBehaviorPatterns.AddRangeAsync(
            new UserBehaviorPattern
            {
                Id = Guid.NewGuid(),
                UserId = passenger1Id,
                MostFrequentDeparture = "Campus La Cité",
                MostFrequentArrival = "Station Laurier",
                TypicalDepartureDays = new[] { 1, 2, 3, 4, 5 },
                TypicalDepartureTimeStart = new TimeOnly(7, 30),
                TypicalDepartureTimeEnd = new TimeOnly(8, 30),
                AvgSessionsPerWeek = 4.2m,
                ChurnRisk = ChurnRisk.Low,
                LastTripDate = now.AddDays(-3),
                PatternConfidence = 0.88m,
                RecomputedAt = now
            },
            new UserBehaviorPattern
            {
                Id = Guid.NewGuid(),
                UserId = passenger2Id,
                MostFrequentDeparture = "Campus La Cité",
                MostFrequentArrival = "Downtown",
                TypicalDepartureDays = new[] { 2, 4 },
                TypicalDepartureTimeStart = new TimeOnly(16, 0),
                TypicalDepartureTimeEnd = new TimeOnly(18, 0),
                AvgSessionsPerWeek = 1.6m,
                ChurnRisk = ChurnRisk.Medium,
                LastTripDate = now.AddDays(-7),
                PatternConfidence = 0.67m,
                RecomputedAt = now
            });

        // Vehicles & documents
        var vehicle1Id = Guid.Parse("30000000-0000-0000-0000-000000000001");
        var vehicle2Id = Guid.Parse("30000000-0000-0000-0000-000000000002");

        await db.Vehicles.AddRangeAsync(
            new Vehicle
            {
                Id = vehicle1Id,
                DriverProfileId = driverProfile1Id,
                Make = "Toyota",
                Model = "Corolla",
                Year = 2021,
                LicensePlate = "ABC-123",
                Color = "Bleu",
                Capacity = 4,
                IsActive = true,
                IsDefault = true,
                CreatedAt = now.AddMonths(-5),
                UpdatedAt = now.AddDays(-1)
            },
            new Vehicle
            {
                Id = vehicle2Id,
                DriverProfileId = driverProfile2Id,
                Make = "Honda",
                Model = "Civic",
                Year = 2020,
                LicensePlate = "XYZ-987",
                Color = "Noir",
                Capacity = 4,
                IsActive = true,
                IsDefault = true,
                CreatedAt = now.AddMonths(-4),
                UpdatedAt = now.AddDays(-1)
            });

        await db.DriverDocuments.AddRangeAsync(
            new DriverDocument
            {
                Id = Guid.NewGuid(),
                DriverProfileId = driverProfile1Id,
                DocumentType = DocumentType.DriversLicense,
                FileUrl = "https://cdn.local/docs/license-marc.pdf",
                ExpiryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(2)),
                Status = "approved",
                SubmittedAt = now.AddMonths(-5),
                ReviewedAt = now.AddMonths(-5).AddDays(2)
            },
            new DriverDocument
            {
                Id = Guid.NewGuid(),
                DriverProfileId = driverProfile2Id,
                DocumentType = DocumentType.Insurance,
                FileUrl = "https://cdn.local/docs/insurance-sarah.pdf",
                ExpiryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1)),
                Status = "approved",
                SubmittedAt = now.AddMonths(-4),
                ReviewedAt = now.AddMonths(-4).AddDays(1)
            });

        // Trips
        var trip1Id = Guid.Parse("40000000-0000-0000-0000-000000000001");
        var trip2Id = Guid.Parse("40000000-0000-0000-0000-000000000002");

        await db.Trips.AddRangeAsync(
            new Trip
            {
                Id = trip1Id,
                DriverId = driver1Id,
                VehicleId = vehicle1Id,
                DepartureLabel = "Campus La Cité",
                DepartureAddress = "801 Aviation Pkwy, Ottawa",
                DeparturePoint = gf.CreatePoint(new Coordinate(-75.6408, 45.4362)),
                ArrivalLabel = "Station Laurier",
                ArrivalAddress = "Laurier Ave W, Ottawa",
                ArrivalPoint = gf.CreatePoint(new Coordinate(-75.6926, 45.4215)),
                DepartureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
                DepartureTime = new TimeOnly(8, 0),
                EstimatedArrivalTime = new TimeOnly(8, 28),
                EstimatedDurationMinutes = 28,
                EstimatedDistanceKm = 11.3m,
                MaxPassengers = 3,
                CurrentPassengers = 1,
                PricePerPassenger = 7.50m,
                PassengerPrice = 7.50m,
                PaymentMethod = PaymentMethod.Interac,
                Status = TripStatus.Published,
                TripType = TripType.Unique,
                BaggageAllowed = true,
                PetsAllowed = false,
                SmokingAllowed = false,
                MusicAllowed = true,
                ConversationLevel = ConversationLevel.Moderate,
                DriverNote = "Départ à l'heure, point de rencontre entrée principale.",
                CreatedAt = now.AddDays(-7),
                UpdatedAt = now.AddHours(-6)
            },
            new Trip
            {
                Id = trip2Id,
                DriverId = driver2Id,
                VehicleId = vehicle2Id,
                DepartureLabel = "Campus La Cité",
                DepartureAddress = "801 Aviation Pkwy, Ottawa",
                DeparturePoint = gf.CreatePoint(new Coordinate(-75.6408, 45.4362)),
                ArrivalLabel = "ByWard Market",
                ArrivalAddress = "55 ByWard Market Sq, Ottawa",
                ArrivalPoint = gf.CreatePoint(new Coordinate(-75.6900, 45.4289)),
                DepartureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
                DepartureTime = new TimeOnly(17, 15),
                EstimatedArrivalTime = new TimeOnly(17, 45),
                EstimatedDurationMinutes = 30,
                EstimatedDistanceKm = 10.4m,
                MaxPassengers = 4,
                CurrentPassengers = 1,
                PricePerPassenger = 8.00m,
                PassengerPrice = 8.00m,
                PaymentMethod = PaymentMethod.Cash,
                Status = TripStatus.Published,
                TripType = TripType.Recurrent,
                RecurrenceDays = new[] { 1, 3, 5 },
                RecurrenceEndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(2)),
                BaggageAllowed = true,
                PetsAllowed = true,
                SmokingAllowed = false,
                MusicAllowed = true,
                ConversationLevel = ConversationLevel.Chatty,
                DriverNote = "Possible petit détour selon trafic.",
                CreatedAt = now.AddDays(-10),
                UpdatedAt = now.AddHours(-12)
            });

        await db.WaypointTrips.AddRangeAsync(
            new WaypointTrip
            {
                Id = Guid.NewGuid(),
                TripId = trip1Id,
                OrderIndex = 1,
                Label = "St-Laurent",
                Address = "St-Laurent Blvd, Ottawa",
                Location = gf.CreatePoint(new Coordinate(-75.6385, 45.4218))
            },
            new WaypointTrip
            {
                Id = Guid.NewGuid(),
                TripId = trip2Id,
                OrderIndex = 1,
                Label = "Rideau",
                Address = "Rideau St, Ottawa",
                Location = gf.CreatePoint(new Coordinate(-75.6892, 45.4265))
            });

        // Reservations / transactions / penalties / withdrawals / reviews
        var reservation1Id = Guid.Parse("50000000-0000-0000-0000-000000000001");
        var reservation2Id = Guid.Parse("50000000-0000-0000-0000-000000000002");

        await db.Reservations.AddRangeAsync(
            new Reservation
            {
                Id = reservation1Id,
                TripId = trip1Id,
                PassengerId = passenger1Id,
                DriverId = driver1Id,
                Status = ReservationStatus.Confirmed,
                CreatedAt = now.AddDays(-2),
                RequestedAt = now.AddDays(-2),
                UpdatedAt = now.AddDays(-1),
                ConfirmedAt = now.AddDays(-1),
                PricePerSeat = 7.50m,
                TotalAmount = 7.50m,
                PaymentStatus = PaymentStatus.Captured,
                CompatibilityScore = 89,
                PassengerMessage = "Je serai au point 5 minutes avant."
            },
            new Reservation
            {
                Id = reservation2Id,
                TripId = trip2Id,
                PassengerId = passenger2Id,
                DriverId = driver2Id,
                Status = ReservationStatus.Pending,
                CreatedAt = now.AddHours(-8),
                RequestedAt = now.AddHours(-8),
                UpdatedAt = now.AddHours(-8),
                ExpiresAt = now.AddHours(16),
                PricePerSeat = 8.00m,
                TotalAmount = 8.00m,
                PaymentStatus = PaymentStatus.Pending,
                CompatibilityScore = 74
            });

        await db.Transactions.AddAsync(
            new Transaction
            {
                Id = Guid.NewGuid(),
                ReservationId = reservation1Id,
                PassengerId = passenger1Id,
                DriverId = driver1Id,
                Amount = 7.50m,
                DriverShare = 6.38m,
                PlatformShare = 1.12m,
                PlatformFee = 1.12m,
                PenaltyDeducted = 0,
                PaymentMethod = PaymentMethod.Interac,
                Status = PaymentStatus.Captured,
                ExternalReference = "INTERAC-TX-0001",
                PreAuthorizedAt = now.AddDays(-2),
                CapturedAt = now.AddDays(-1),
                CreatedAt = now.AddDays(-2)
            });

        await db.Penalties.AddAsync(
            new Penalty
            {
                Id = Guid.NewGuid(),
                UserId = driver1Id,
                TripId = trip1Id,
                ReservationId = reservation1Id,
                Type = PenaltyType.Delay15To30Min,
                Amount = 5.00m,
                Status = PenaltyStatus.Active,
                ContestDeadline = now.AddDays(5),
                TriggerReason = "Retard confirmé par passager",
                GoScoreImpact = -4,
                CreatedAt = now.AddDays(-1)
            });

        await db.Withdrawals.AddAsync(
            new Withdrawal
            {
                Id = Guid.NewGuid(),
                DriverProfileId = driverProfile1Id,
                Amount = 120.00m,
                Status = "Completed",
                ExternalReference = "WDR-2026-0001",
                RequestedAt = now.AddDays(-10),
                ProcessedAt = now.AddDays(-9),
                CompletedAt = now.AddDays(-9)
            });

        await db.Reviews.AddAsync(
            new Review
            {
                Id = Guid.NewGuid(),
                TripId = trip1Id,
                ReservationId = reservation1Id,
                ReviewerId = passenger1Id,
                RevieweeId = driver1Id,
                RevieweeRole = UserRole.Driver,
                Rating = 5,
                Comment = "Trajet parfait et conducteur très respectueux.",
                Tags = new[] { "ponctuel", "propre", "sécuritaire" },
                IsPublished = true,
                CreatedAt = now.AddHours(-20)
            });

        // Social/safety
        await db.Affinities.AddRangeAsync(
            new Affinity
            {
                Id = Guid.NewGuid(),
                UserId = passenger1Id,
                TargetUserId = driver1Id,
                AffinityScore = 9,
                IsActuallyFavorite = true,
                FavoriteSince = now.AddMonths(-1),
                TotalTripsTogether = 6,
                AvgRatingGiven = 4.9m,
                AvgRatingReceived = 4.8m,
                LastTripDate = now.AddDays(-2),
                IsBlocked = false,
                HadIncident = false,
                IncidentCount = 0,
                CreatedAt = now.AddMonths(-2),
                UpdatedAt = now.AddDays(-2)
            },
            new Affinity
            {
                Id = Guid.NewGuid(),
                UserId = passenger2Id,
                TargetUserId = driver2Id,
                AffinityScore = 6,
                IsActuallyFavorite = false,
                TotalTripsTogether = 1,
                LastTripDate = now.AddDays(-12),
                IsBlocked = false,
                HadIncident = false,
                IncidentCount = 0,
                CreatedAt = now.AddMonths(-1),
                UpdatedAt = now.AddDays(-12)
            });

        await db.Notifications.AddRangeAsync(
            new Notification
            {
                Id = Guid.NewGuid(),
                UserId = passenger1Id,
                Type = NotificationType.ReservationAccepted,
                Title = "Réservation confirmée",
                Body = "Votre place est confirmée pour demain matin.",
                IsRead = false,
                IsImportant = true,
                RelatedTripId = trip1Id,
                RelatedReservationId = reservation1Id,
                CreatedAt = now.AddHours(-12)
            },
            new Notification
            {
                Id = Guid.NewGuid(),
                UserId = driver1Id,
                Type = NotificationType.NewReview,
                Title = "Nouvelle évaluation",
                Body = "Vous avez reçu une note de 5/5.",
                IsRead = false,
                IsImportant = false,
                RelatedTripId = trip1Id,
                RelatedReservationId = reservation1Id,
                CreatedAt = now.AddHours(-10)
            });

        await db.Reports.AddAsync(
            new Report
            {
                Id = Guid.NewGuid(),
                PublicReference = "RPT-2026-0001",
                TripId = trip2Id,
                ReporterId = passenger2Id,
                ReportedUserId = driver2Id,
                Category = ReportCategory.RouteDeviation,
                SeverityLevel = "medium",
                Description = "L'itinéraire a été modifié sans notification.",
                EvidenceUrls = new[] { "https://cdn.local/evidence/route-1.png" },
                Status = "in_review",
                AssignedAdminId = adminId,
                AutoPrevBlockUser = false,
                CreatedAt = now.AddDays(-1)
            });

        await db.SosAlerts.AddAsync(
            new SosAlert
            {
                Id = Guid.NewGuid(),
                UserId = passenger1Id,
                TripId = trip1Id,
                EmergencyType = "medical",
                TriggerLocation = gf.CreatePoint(new Coordinate(-75.6700, 45.4275)),
                Status = "resolved",
                AdminContactedAt = now.AddDays(-1).AddMinutes(5),
                EmergencyContactsNotified = true,
                GpsSnapshotJson = "{\"lat\":45.4275,\"lng\":-75.67}",
                TriggeredAt = now.AddDays(-1),
                ResolvedAt = now.AddDays(-1).AddMinutes(25)
            });

        // Gamification
        var badge1Id = Guid.Parse("60000000-0000-0000-0000-000000000001");
        var badge2Id = Guid.Parse("60000000-0000-0000-0000-000000000002");
        var ecoChallenge1Id = Guid.Parse("70000000-0000-0000-0000-000000000001");

        await db.Badges.AddRangeAsync(
            new Badge
            {
                Id = badge1Id,
                Name = "Premier Trajet",
                NameEn = "First Ride",
                Description = "A complété son premier trajet.",
                DescriptionEn = "Completed the first ride.",
                Category = "passenger",
                IconUrl = "https://cdn.local/badges/first-ride.svg",
                RewardPoints = 25,
                IsActive = true,
                CreatedAt = now.AddMonths(-3)
            },
            new Badge
            {
                Id = badge2Id,
                Name = "Éco Conducteur",
                NameEn = "Eco Driver",
                Description = "A dépassé 100kg de CO2 économisés.",
                DescriptionEn = "Saved more than 100kg of CO2.",
                Category = "eco",
                IconUrl = "https://cdn.local/badges/eco-driver.svg",
                RewardPoints = 60,
                IsActive = true,
                CreatedAt = now.AddMonths(-3)
            });

        await db.UserBadges.AddRangeAsync(
            new UserBadge
            {
                Id = Guid.NewGuid(),
                UserId = passenger1Id,
                BadgeId = badge1Id,
                AwardedAt = now.AddMonths(-1)
            },
            new UserBadge
            {
                Id = Guid.NewGuid(),
                UserId = driver1Id,
                BadgeId = badge2Id,
                AwardedAt = now.AddDays(-20)
            });

        await db.EcoChallenges.AddAsync(
            new EcoChallenge
            {
                Id = ecoChallenge1Id,
                Title = "Campus Sans Auto Solo",
                TitleEn = "Campus Carpool Sprint",
                MetricType = "trips_count",
                TargetValue = 10,
                RewardPoints = 80,
                RewardBadgeId = badge2Id,
                Period = "monthly",
                ActiveFrom = now.AddDays(-10),
                ActiveUntil = now.AddDays(20),
                TargetRole = "all"
            });

        await db.ChallengeParticipations.AddAsync(
            new ChallengeParticipation
            {
                Id = Guid.NewGuid(),
                UserId = passenger1Id,
                EcoChallengeId = ecoChallenge1Id,
                CurrentValue = 6,
                IsCompleted = false,
                RewardClaimed = false,
                JoinedAt = now.AddDays(-8),
                UpdatedAt = now.AddDays(-1)
            });

        await db.MatchingScoreCaches.AddAsync(
            new MatchingScoreCache
            {
                Id = Guid.NewGuid(),
                TripId = trip1Id,
                PassengerId = passenger1Id,
                GlobalScore = 92,
                DepartureProximityScore = 18,
                ArrivalProximityScore = 17,
                ScheduleScore = 20,
                PreferenceScore = 20,
                AffinityScore = 15,
                Bonuses = 2,
                ComputedAt = now.AddMinutes(-45)
            });

        await db.SmartSuggestions.AddAsync(
            new SmartSuggestion
            {
                Id = Guid.NewGuid(),
                UserId = passenger1Id,
                SuggestionType = SuggestionType.RecurringTripAlert,
                ConfidenceScore = 0.91m,
                SuggestedDeparture = "Campus La Cité",
                SuggestedArrival = "Station Laurier",
                SuggestedTimeWindow = "07:45-08:15",
                SuggestedDays = new[] { 1, 2, 3, 4, 5 },
                ReasonLabel = "Habitude détectée semaine",
                RelatedTripId = trip1Id,
                Status = "new",
                ExpiresAt = now.AddDays(5),
                CreatedAt = now
            });

        // Campus
        await db.GeofenceZones.AddRangeAsync(
            new GeofenceZone
            {
                Id = Guid.NewGuid(),
                Name = "La Cité - Entrée Principale",
                ZoneType = "meeting_point",
                CenterPoint = gf.CreatePoint(new Coordinate(-75.6408, 45.4362)),
                RadiusMeters = 80,
                Instructions = "Attendre près du pavillon principal.",
                Capacity = 20,
                IsActive = true
            },
            new GeofenceZone
            {
                Id = Guid.NewGuid(),
                Name = "La Cité - Parking Nord",
                ZoneType = "parking",
                CenterPoint = gf.CreatePoint(new Coordinate(-75.6432, 45.4371)),
                RadiusMeters = 120,
                Capacity = 40,
                IsActive = true
            });

        // Platform
        await db.PlatformConfigs.AddRangeAsync(
            new PlatformConfig
            {
                Key = "matching.departure_radius_meters",
                Value = "800",
                DataType = "int",
                Category = "matching",
                Description = "Rayon par défaut pour le départ",
                LastModifiedByAdminId = adminId,
                UpdatedAt = now
            },
            new PlatformConfig
            {
                Key = "finance.platform_fee_percent",
                Value = "15",
                DataType = "int",
                Category = "finance",
                Description = "Commission plateforme en pourcentage",
                LastModifiedByAdminId = adminId,
                UpdatedAt = now
            },
            new PlatformConfig
            {
                Key = seedKey,
                Value = seedVersion,
                DataType = "string",
                Category = "system",
                Description = "Version du seed appliqué",
                LastModifiedByAdminId = adminId,
                UpdatedAt = now
            });

        await db.PlatformStats.AddAsync(
            new PlatformStats
            {
                Id = Guid.NewGuid(),
                TotalUsers = 5,
                ActiveUsersLast30Days = 5,
                TotalTrips = 2,
                TripsToday = 0,
                TripsThisMonth = 2,
                TotalCo2SavedKg = 208.7m,
                TotalRevenuePlatform = 1.12m,
                PendingReports = 1,
                PendingDriverApplications = 0,
                ComputedAt = now
            });

        await db.AuditLogs.AddRangeAsync(
            new AuditLog
            {
                ActorId = adminId,
                ActorRole = "admin",
                Action = "seed.initialized",
                EntityType = "system",
                EntityId = null,
                NewValueJson = "{\"seed\":\"v1\"}",
                IpAddress = "127.0.0.1",
                UserAgent = "Seeder",
                CreatedAt = now
            },
            new AuditLog
            {
                ActorId = driver1Id,
                ActorRole = "user",
                Action = "trip.created",
                EntityType = "Trip",
                EntityId = trip1Id,
                CreatedAt = now.AddDays(-7)
            });

        // Security
        var certificateId = Guid.Parse("80000000-0000-0000-0000-000000000001");

        await db.ClientCertificates.AddAsync(
            new ClientCertificate
            {
                Id = certificateId,
                UserId = driver1Id,
                DeviceFingerprint = "devicefp-driver1-sha512",
                CurrentPublicKeyPem = "-----BEGIN PUBLIC KEY-----driver1-current-----END PUBLIC KEY-----",
                PreviousPublicKeyPem = null,
                CurrentKeyIssuedAt = now.AddDays(-30),
                HasGotNewPublicKey = true,
                LastHeartbeatAt = now.AddMinutes(-10),
                LastSuccessfulRequestAt = now.AddMinutes(-10),
                Status = "active",
                RequiresServiceDesk = false,
                FailedValidationCount = 0,
                EnrolledAt = now.AddMonths(-4),
                UpdatedAt = now
            });

        await db.UserSecurityActivities.AddAsync(
            new UserSecurityActivity
            {
                UserId = driver1Id,
                CertificateId = certificateId,
                RequestOrigin = "mobile_vpn",
                IpAddress = "10.0.0.22",
                GeoLocation = "Ottawa, CA",
                UserAgent = "LaCiteMobile/1.0",
                RecordedAt = now.AddMinutes(-10),
                ValidationResult = "success",
                UsedKeyVersion = "current",
                WasAnomaly = false,
                ActionTaken = "none"
            });

        await db.WebSessionKeys.AddAsync(
            new WebSessionKey
            {
                Id = Guid.NewGuid(),
                UserId = adminId,
                KeyHash = "websession-admin-sha512",
                Status = "active",
                IssuedAt = now.AddHours(-1),
                ExpiresAt = now.AddHours(1),
                LastUsedAt = now.AddMinutes(-5),
                ServerSignature = "server-signature-001"
            });

        await db.CertificateRotationEvents.AddAsync(
            new CertificateRotationEvent
            {
                Id = Guid.NewGuid(),
                TriggeredBy = "scheduled_irregular",
                AffectedClientsCount = 1,
                NewPublicKeyGeneratedAt = now.AddDays(-15),
                PropagationCompletedAt = now.AddDays(-14),
                Note = "Rotation mensuelle planifiée",
                CreatedAt = now.AddDays(-15)
            });

        // Tracking positions (after trips/users)
        await db.GpsPositions.AddRangeAsync(
            new GpsPosition
            {
                TripId = trip1Id,
                UserId = driver1Id,
                Location = gf.CreatePoint(new Coordinate(-75.6550, 45.4300)),
                SpeedKmh = 42,
                HeadingDegrees = 120,
                AccuracyMeters = 6,
                CapturedAt = now.AddMinutes(-35)
            },
            new GpsPosition
            {
                TripId = trip1Id,
                UserId = passenger1Id,
                Location = gf.CreatePoint(new Coordinate(-75.6540, 45.4298)),
                SpeedKmh = 39,
                HeadingDegrees = 118,
                AccuracyMeters = 8,
                CapturedAt = now.AddMinutes(-34)
            });

        await db.SaveChangesAsync(ct);

        logger.LogInformation("DatabaseSeeder: injection complète terminée ({SeedVersion})", seedVersion);

        // Extensions idempotentes
        await SeedGoTasksAsync(db, logger, adminId, ct);
        await SeedSimulationDataAsync(db, logger, driver1Id, driver2Id, passenger1Id, passenger2Id, vehicle1Id, vehicle2Id, gf, now, ct);
        await PatchTestUsersAsync(db, logger, ct);
    }

    // ── GoTasks GT-000 → GT-013 + Badge "Nouveau membre" ─────────────────────

    private static async Task SeedGoTasksAsync(AppDbContext db, ILogger logger, Guid adminId, CancellationToken ct)
    {
        var alreadySeeded = await db.PlatformConfigs.AsNoTracking()
            .AnyAsync(c => c.Key == "seed.gotasks.v1", ct);
        if (alreadySeeded) return;

        // Badge "Nouveau membre" — attribué automatiquement à la création de compte
        await db.Badges.AddAsync(new Badge
        {
            Id            = Guid.Parse("60000000-0000-0000-0000-000000000003"),
            Name          = "Nouveau membre",
            NameEn        = "New Member",
            Description   = "A rejoint la communauté Covoiturage La Cité.",
            DescriptionEn = "Joined the Covoiturage La Cité community.",
            Category      = "social",
            IconUrl       = "/badges/new-member.svg",
            RewardPoints  = 0,
            IsActive      = true,
            CreatedAt     = DateTimeOffset.UtcNow,
        }, ct);

        var goTasks = new[]
        {
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000000"), TaskKey = "GT-000", TitleFr = "Bienvenue !", TitleEn = "Welcome!", DescriptionFr = "Rejoignez la communauté Covoiturage La Cité.", DescriptionEn = "Join the Covoiturage La Cité community.", Category = "mixte", Points = 250, Link = "/driver/{id}/goboard", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000001"), TaskKey = "GT-001", TitleFr = "Premier trajet", TitleEn = "First ride", DescriptionFr = "Effectuez votre premier trajet en tant que passager.", DescriptionEn = "Complete your first ride as passenger.", Category = "passengerOnly", Points = 50, Link = "/passenger/{id}", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000002"), TaskKey = "GT-002", TitleFr = "Conducteur débutant", TitleEn = "New Driver", DescriptionFr = "Publiez votre premier trajet en tant que conducteur.", DescriptionEn = "Publish your first trip as driver.", Category = "driverOnly", Points = 75, Link = "/driver/{id}/create-trip", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000003"), TaskKey = "GT-003", TitleFr = "Profil complet", TitleEn = "Complete Profile", DescriptionFr = "Complétez votre profil (photo, bio, langues).", DescriptionEn = "Complete your profile with photo, bio and languages.", Category = "mixte", Points = 30, Link = "/profile/settings", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000004"), TaskKey = "GT-004", TitleFr = "5 trajets complétés", TitleEn = "5 trips completed", DescriptionFr = "Complétez 5 trajets en tant que passager.", DescriptionEn = "Complete 5 trips as passenger.", Category = "passengerOnly", Points = 100, Link = "/passenger/{id}/historique", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000005"), TaskKey = "GT-005", TitleFr = "Éco Conducteur", TitleEn = "Eco Driver", DescriptionFr = "Économisez 50kg de CO₂ grâce au covoiturage.", DescriptionEn = "Save 50kg of CO2 through carpooling.", Category = "driverOnly", Points = 120, Link = "/driver/{id}/statistiques", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000006"), TaskKey = "GT-006", TitleFr = "Super Conducteur", TitleEn = "Super Driver", DescriptionFr = "Maintenez une note moyenne de 4.8+ pendant 1 mois.", DescriptionEn = "Maintain 4.8+ average rating for 1 month.", Category = "driverOnly", Points = 150, Link = "/driver/{id}/statistiques", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000007"), TaskKey = "GT-007", TitleFr = "Avis partagé", TitleEn = "Review shared", DescriptionFr = "Donnez votre premier avis après un trajet.", DescriptionEn = "Leave your first review after a trip.", Category = "mixte", Points = 25, Link = "/passenger/{id}", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000008"), TaskKey = "GT-008", TitleFr = "Lieu favori ajouté", TitleEn = "Favorite place added", DescriptionFr = "Ajoutez un lieu favori à votre compte.", DescriptionEn = "Add a favorite place to your account.", Category = "mixte", Points = 20, Link = "/driver/{id}/favoris", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000009"), TaskKey = "GT-009", TitleFr = "Premier brouillon", TitleEn = "First draft", DescriptionFr = "Sauvegardez votre premier brouillon de trajet.", DescriptionEn = "Save your first trip draft.", Category = "driverOnly", Points = 15, Link = "/driver/{id}/brouillons", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000010"), TaskKey = "GT-010", TitleFr = "Favori humain", TitleEn = "Human favorite", DescriptionFr = "Ajoutez un autre membre en favori.", DescriptionEn = "Add another member as favorite.", Category = "mixte", Points = 30, Link = "/passenger/{id}/favoris", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000011"), TaskKey = "GT-011", TitleFr = "Ambassadeur Vert", TitleEn = "Green Ambassador", DescriptionFr = "Économisez 200kg de CO₂ cumulatif.", DescriptionEn = "Save 200kg of CO2 cumulatively.", Category = "driverOnly", Points = 200, Link = "/driver/{id}/statistiques", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000012"), TaskKey = "GT-012", TitleFr = "Communauté active", TitleEn = "Active community", DescriptionFr = "Participez à 3 défis écologiques.", DescriptionEn = "Participate in 3 eco challenges.", Category = "mixte", Points = 80, Link = "/driver/{id}/goboard", IsActive = true },
            new GoTask { Id = Guid.Parse("A0000000-0000-0000-0000-000000000013"), TaskKey = "GT-013", TitleFr = "Identité vérifiée", TitleEn = "Verified identity", DescriptionFr = "Faites vérifier votre identité par la plateforme.", DescriptionEn = "Get your identity verified by the platform.", Category = "mixte", Points = 100, Link = "/profile/settings", IsActive = true },
        };

        await db.GoTasks.AddRangeAsync(goTasks, ct);

        db.PlatformConfigs.Add(new PlatformConfig
        {
            Key = "seed.gotasks.v1",
            Value = "seeded",
            DataType = "string",
            Category = "system",
            Description = "GoTasks GT-000 à GT-013 + badge Nouveau membre injectés",
            LastModifiedByAdminId = adminId,
            UpdatedAt = DateTimeOffset.UtcNow
        });

        await db.SaveChangesAsync(ct);
        logger.LogInformation("DatabaseSeeder: GoTasks GT-000→GT-013 + badge 'Nouveau membre' injectés");
    }

    // ── Patch idempotent : password + DisabledOtp sur tous les comptes de test ─
    // Tourne à chaque démarrage — safe car c'est un simple UPDATE par email.
    // Nécessaire quand le seed principal a déjà tourné (v1) sans ces champs.

    private static readonly string[] TestEmails =
    [
        "1234567@collegelacite.ca",
        "2345671@collegelacite.ca",
        "3456712@collegelacite.ca",
        "4567123@collegelacite.ca",
        "5671234@collegelacite.ca",
        "6712345@collegelacite.ca",
        "7123456@collegelacite.ca",
        "8234567@collegelacite.ca",
        "9345678@collegelacite.ca",
        "0456789@collegelacite.ca",
    ];

    private static async Task PatchTestUsersAsync(AppDbContext db, ILogger logger, CancellationToken ct)
    {
        var users = await db.Users
            .Where(u => TestEmails.Contains(u.Email))
            .ToListAsync(ct);

        if (users.Count == 0) return;

        var changed = 0;
        var now = DateTimeOffset.UtcNow;

        foreach (var user in users)
        {
            var dirty = false;

            if (string.IsNullOrEmpty(user.PasswordHash))
            {
                user.PasswordHash = TestPasswordHash;
                dirty = true;
            }

            if (!user.DisabledOtp)
            {
                user.DisabledOtp   = true;
                user.DisabledOtpAt = now;
                dirty = true;
            }

            // Onboarding — tous les comptes de test passent directement
            if (!user.OnboardingCompleted)
            {
                user.AlreadySignPolitics                    = true;
                user.AlreadySetAProfilePicture              = true;
                user.AlreadySubmittedAllVehiculeDocument    = true;
                user.OnboardingCompleted                    = true;
                dirty = true;
            }

            if (dirty)
            {
                user.UpdatedAt = now;
                changed++;
            }
        }

        if (changed > 0)
        {
            await db.SaveChangesAsync(ct);
            logger.LogInformation("PatchTestUsers: {Count} comptes de test mis à jour (mot de passe + DisabledOtp)", changed);
        }
    }

    // ── Simulation 1 mois d'utilisation ──────────────────────────────────────

    private static async Task SeedSimulationDataAsync(
        AppDbContext db, ILogger logger,
        Guid driver1Id, Guid driver2Id, Guid passenger1Id, Guid passenger2Id,
        Guid vehicle1Id, Guid vehicle2Id,
        GeometryFactory gf, DateTimeOffset now, CancellationToken ct)
    {
        var alreadySeeded = await db.PlatformConfigs.AsNoTracking()
            .AnyAsync(c => c.Key == "seed.simulation.v1", ct);
        if (alreadySeeded) return;

        // 3 conducteurs supplémentaires
        var driver3Id = Guid.Parse("B0000000-0000-0000-0000-000000000001");
        var driver4Id = Guid.Parse("B0000000-0000-0000-0000-000000000002");
        var driver5Id = Guid.Parse("B0000000-0000-0000-0000-000000000003");
        var passenger3Id = Guid.Parse("B0000000-0000-0000-0000-000000000004");
        var passenger4Id = Guid.Parse("B0000000-0000-0000-0000-000000000005");

        var newUsers = new[]
        {
            new User { Id = driver3Id, Email = "6712345@collegelacite.ca", MicrosoftSsoId = "aad-driver-003", PasswordHash = TestPasswordHash, FirstName = "Karim", LastName = "Boudier", Role = UserRole.Driver, SchoolRole = SchoolRole.MembreDuPersonnel, Status = UserStatus.Active, IsProfileVerified = true, CanBeDriver = true, GoScore = 310, ReputationPoints = 190, Language = "fr", PhoneNumber = "+1-514-000-0006", Bio = "Je vise toujours la ponctualité.", DisabledOtp = true, DisabledOtpAt = now, AlreadySignPolitics = true, AlreadySetAProfilePicture = true, AlreadySubmittedAllVehiculeDocument = true, OnboardingCompleted = true, CreatedAt = now.AddMonths(-3), UpdatedAt = now.AddDays(-1) },
            new User { Id = driver4Id, Email = "7123456@collegelacite.ca", MicrosoftSsoId = "aad-driver-004", PasswordHash = TestPasswordHash, FirstName = "Priya", LastName = "Sharma", Role = UserRole.Driver, SchoolRole = SchoolRole.Etudiant, Status = UserStatus.Active, IsProfileVerified = true, CanBeDriver = true, GoScore = 280, ReputationPoints = 160, Language = "en", PhoneNumber = "+1-514-000-0007", Bio = "Music-friendly rides.", DisabledOtp = true, DisabledOtpAt = now, AlreadySignPolitics = true, AlreadySetAProfilePicture = true, AlreadySubmittedAllVehiculeDocument = true, OnboardingCompleted = true, CreatedAt = now.AddMonths(-2), UpdatedAt = now.AddDays(-2) },
            new User { Id = driver5Id, Email = "8234567@collegelacite.ca", MicrosoftSsoId = "aad-driver-005", PasswordHash = TestPasswordHash, FirstName = "Jordan", LastName = "Leblanc", Role = UserRole.Driver, SchoolRole = SchoolRole.Professeur, Status = UserStatus.Active, IsProfileVerified = true, CanBeDriver = true, GoScore = 260, ReputationPoints = 130, Language = "fr", PhoneNumber = "+1-514-000-0008", DisabledOtp = true, DisabledOtpAt = now, AlreadySignPolitics = true, AlreadySetAProfilePicture = true, AlreadySubmittedAllVehiculeDocument = true, OnboardingCompleted = true, CreatedAt = now.AddMonths(-2), UpdatedAt = now.AddDays(-3) },
            new User { Id = passenger3Id, Email = "9345678@collegelacite.ca", MicrosoftSsoId = "aad-passenger-003", PasswordHash = TestPasswordHash, FirstName = "Fatou", LastName = "Diallo", Role = UserRole.Passenger, SchoolRole = SchoolRole.Etudiant, Status = UserStatus.Active, IsProfileVerified = true, CanBeDriver = false, GoScore = 195, ReputationPoints = 90, Language = "fr", PhoneNumber = "+1-514-000-0009", DisabledOtp = true, DisabledOtpAt = now, AlreadySignPolitics = true, AlreadySetAProfilePicture = true, AlreadySubmittedAllVehiculeDocument = true, OnboardingCompleted = true, CreatedAt = now.AddMonths(-2), UpdatedAt = now.AddDays(-1) },
            new User { Id = passenger4Id, Email = "0456789@collegelacite.ca", MicrosoftSsoId = "aad-passenger-004", PasswordHash = TestPasswordHash, FirstName = "Yan", LastName = "Chen", Role = UserRole.Passenger, SchoolRole = SchoolRole.Etudiant, Status = UserStatus.Active, IsProfileVerified = false, CanBeDriver = false, GoScore = 150, ReputationPoints = 60, Language = "en", PhoneNumber = "+1-514-000-0010", DisabledOtp = true, DisabledOtpAt = now, AlreadySignPolitics = true, AlreadySetAProfilePicture = true, AlreadySubmittedAllVehiculeDocument = true, OnboardingCompleted = true, CreatedAt = now.AddMonths(-1), UpdatedAt = now.AddDays(-2) },
        };
        await db.Users.AddRangeAsync(newUsers, ct);

        // Véhicules pour les nouveaux conducteurs
        var vehicle3Id = Guid.Parse("C0000000-0000-0000-0000-000000000001");
        var vehicle4Id = Guid.Parse("C0000000-0000-0000-0000-000000000002");
        var vehicle5Id = Guid.Parse("C0000000-0000-0000-0000-000000000003");

        var dp3Id = Guid.Parse("D0000000-0000-0000-0000-000000000001");
        var dp4Id = Guid.Parse("D0000000-0000-0000-0000-000000000002");
        var dp5Id = Guid.Parse("D0000000-0000-0000-0000-000000000003");

        await db.DriverProfiles.AddRangeAsync(
            new DriverProfile { Id = dp3Id, UserId = driver3Id, ValidationStatus = DriverValidationStatus.Approved, AverageRating = 4.7m, TotalTripsAsDriver = 18, CancellationRate = 0.05m, PunctualityScore = 88, Co2SavedKg = 62m, BalanceAvailable = 180m, WithholdingRate = 0.15m },
            new DriverProfile { Id = dp4Id, UserId = driver4Id, ValidationStatus = DriverValidationStatus.Approved, AverageRating = 4.5m, TotalTripsAsDriver = 12, CancellationRate = 0.06m, PunctualityScore = 85, Co2SavedKg = 44m, BalanceAvailable = 120m, WithholdingRate = 0.15m },
            new DriverProfile { Id = dp5Id, UserId = driver5Id, ValidationStatus = DriverValidationStatus.Approved, AverageRating = 4.3m, TotalTripsAsDriver = 8, CancellationRate = 0.08m, PunctualityScore = 80, Co2SavedKg = 28m, BalanceAvailable = 75m, WithholdingRate = 0.15m });

        await db.Vehicles.AddRangeAsync(
            new Vehicle { Id = vehicle3Id, DriverProfileId = dp3Id, Make = "Mazda", Model = "3", Year = 2022, LicensePlate = "DEF-456", Color = "Gris", Capacity = 4, IsActive = true, IsDefault = true, CreatedAt = now.AddMonths(-3), UpdatedAt = now.AddDays(-1) },
            new Vehicle { Id = vehicle4Id, DriverProfileId = dp4Id, Make = "Hyundai", Model = "Elantra", Year = 2021, LicensePlate = "GHI-789", Color = "Blanc", Capacity = 4, IsActive = true, IsDefault = true, CreatedAt = now.AddMonths(-2), UpdatedAt = now.AddDays(-2) },
            new Vehicle { Id = vehicle5Id, DriverProfileId = dp5Id, Make = "Ford", Model = "Fusion", Year = 2019, LicensePlate = "JKL-012", Color = "Rouge", Capacity = 4, IsActive = true, IsDefault = true, CreatedAt = now.AddMonths(-2), UpdatedAt = now.AddDays(-3) });

        await db.UserPreferences.AddRangeAsync(newUsers.Select(u => new UserPreferences { Id = Guid.NewGuid(), UserId = u.Id, MusicAccepted = true, HasPets = false, SmokesRegularly = false, TypicalBaggage = false, ConversationLevel = ConversationLevel.Moderate, EmailNotifications = true, PushNotifications = true, Language = u.Language }), ct);

        await db.UserStats.AddRangeAsync(
            new UserStat { Id = Guid.NewGuid(), UserId = driver3Id, TotalTripsAsDriver = 18, TotalCo2SavedKg = 62m, TotalDistanceKm = 490m, AverageRatingAsDriver = 4.7m, TotalReviewsReceived = 14, TotalEarningsDriver = 850m, RecomputedAt = now },
            new UserStat { Id = Guid.NewGuid(), UserId = driver4Id, TotalTripsAsDriver = 12, TotalCo2SavedKg = 44m, TotalDistanceKm = 310m, AverageRatingAsDriver = 4.5m, TotalReviewsReceived = 10, TotalEarningsDriver = 540m, RecomputedAt = now },
            new UserStat { Id = Guid.NewGuid(), UserId = driver5Id, TotalTripsAsDriver = 8, TotalCo2SavedKg = 28m, TotalDistanceKm = 200m, AverageRatingAsDriver = 4.3m, TotalReviewsReceived = 6, TotalEarningsDriver = 320m, RecomputedAt = now },
            new UserStat { Id = Guid.NewGuid(), UserId = passenger3Id, TotalTripsAsPassenger = 10, TotalCo2SavedKg = 34m, AverageRatingAsPassenger = 4.8m, TotalReviewsGiven = 8, TotalSpentPassenger = 110m, RecomputedAt = now },
            new UserStat { Id = Guid.NewGuid(), UserId = passenger4Id, TotalTripsAsPassenger = 6, TotalCo2SavedKg = 18m, AverageRatingAsPassenger = 4.6m, TotalReviewsGiven = 5, TotalSpentPassenger = 64m, RecomputedAt = now });

        // ── 20 trajets passés (1 mois, statut Completed) ──────────────────────
        var tripIds = new Guid[20];
        for (var i = 0; i < 20; i++) tripIds[i] = Guid.NewGuid();

        var drivers = new[] { driver1Id, driver2Id, driver3Id, driver4Id, driver5Id };
        var vehicles = new[] { vehicle1Id, vehicle2Id, vehicle3Id, vehicle4Id, vehicle5Id };
        var routes = new[]
        {
            ("Campus La Cité", "Station Laurier", -75.6408m, 45.4362m, -75.6926m, 45.4215m, 11.3m, 28),
            ("Campus La Cité", "ByWard Market", -75.6408m, 45.4362m, -75.6900m, 45.4289m, 10.4m, 30),
            ("Campus La Cité", "Glebe", -75.6408m, 45.4362m, -75.6930m, 45.4000m, 14.2m, 35),
            ("Campus La Cité", "Barrhaven", -75.6408m, 45.4362m, -75.7600m, 45.2930m, 22.5m, 45),
            ("Station Laurier", "Campus La Cité", -75.6926m, 45.4215m, -75.6408m, 45.4362m, 11.3m, 28),
        };

        var tripList = new List<Trip>();
        for (var i = 0; i < 20; i++)
        {
            var dIdx = i % 5;
            var rIdx = i % routes.Length;
            var r = routes[rIdx];
            var daysAgo = 30 - (i * 1);
            var depDate = DateOnly.FromDateTime(now.AddDays(-daysAgo).DateTime);

            tripList.Add(new Trip
            {
                Id = tripIds[i],
                DriverId = drivers[dIdx],
                VehicleId = vehicles[dIdx],
                DepartureLabel = r.Item1,
                DepartureAddress = r.Item1 + ", Ottawa",
                DeparturePoint = gf.CreatePoint(new Coordinate((double)r.Item3, (double)r.Item4)),
                ArrivalLabel = r.Item2,
                ArrivalAddress = r.Item2 + ", Ottawa",
                ArrivalPoint = gf.CreatePoint(new Coordinate((double)r.Item5, (double)r.Item6)),
                DepartureDate = depDate,
                DepartureTime = new TimeOnly(8 + (i % 3) * 2, 0),
                EstimatedDurationMinutes = r.Item8,
                EstimatedDistanceKm = r.Item7,
                MaxPassengers = 3,
                CurrentPassengers = 1 + (i % 2),
                PricePerPassenger = 7.00m + (i % 4),
                PassengerPrice = 7.00m + (i % 4),
                PaymentMethod = i % 2 == 0 ? PaymentMethod.Interac : PaymentMethod.Cash,
                Status = TripStatus.Completed,
                TripType = TripType.Unique,
                Co2SavedKg = r.Item7 * 0.12m,
                AverageRating = 4.0m + ((i % 5) * 0.2m),
                ActualStartedAt = now.AddDays(-daysAgo),
                ActualCompletedAt = now.AddDays(-daysAgo).AddMinutes(r.Item8),
                BaggageAllowed = true, PetsAllowed = false, SmokingAllowed = false, MusicAllowed = true,
                ConversationLevel = ConversationLevel.Moderate,
                CreatedAt = now.AddDays(-daysAgo - 3),
                UpdatedAt = now.AddDays(-daysAgo)
            });
        }
        await db.Trips.AddRangeAsync(tripList, ct);

        // ── 20 réservations pour ces trajets ─────────────────────────────────
        var passengers = new[] { passenger1Id, passenger2Id, passenger3Id, passenger4Id };
        var reservations = new List<Reservation>();
        for (var i = 0; i < 20; i++)
        {
            var daysAgo = 30 - (i * 1);
            var dIdx = i % 5;
            reservations.Add(new Reservation
            {
                Id = Guid.NewGuid(),
                TripId = tripIds[i],
                PassengerId = passengers[i % 4],
                DriverId = drivers[dIdx],
                Status = ReservationStatus.Confirmed,
                PricePerSeat = 7.00m + (i % 4),
                TotalAmount = 7.00m + (i % 4),
                PaymentStatus = PaymentStatus.Captured,
                CompatibilityScore = 75 + (i % 20),
                CreatedAt = now.AddDays(-daysAgo - 2),
                RequestedAt = now.AddDays(-daysAgo - 2),
                ConfirmedAt = now.AddDays(-daysAgo - 1),
                UpdatedAt = now.AddDays(-daysAgo)
            });
        }
        await db.Reservations.AddRangeAsync(reservations, ct);

        // ── 15 avis sur ces trajets ───────────────────────────────────────────
        var ratings = new[] { 5, 5, 4, 5, 4, 5, 3, 5, 4, 5, 5, 4, 5, 4, 5 };
        var reviewTags = new[] { new[] { "ponctuel", "propre" }, new[] { "sympathique" }, new[] { "confort" } };
        var reviews = new List<Review>();
        for (var i = 0; i < 15; i++)
        {
            var daysAgo = 29 - i;
            var res = reservations[i];
            reviews.Add(new Review
            {
                Id = Guid.NewGuid(),
                TripId = res.TripId,
                ReservationId = res.Id,
                ReviewerId = res.PassengerId,
                RevieweeId = res.DriverId,
                RevieweeRole = UserRole.Driver,
                Rating = ratings[i],
                Comment = $"Trajet #{i + 1} — note {ratings[i]}/5.",
                Tags = reviewTags[i % reviewTags.Length],
                IsPublished = true,
                CreatedAt = now.AddDays(-daysAgo)
            });
        }
        await db.Reviews.AddRangeAsync(reviews, ct);

        // ── Lieux favoris simulés ─────────────────────────────────────────────
        var allUserIds = new[] { driver1Id, driver2Id, driver3Id, passenger1Id, passenger2Id };
        var lieuLabels = new[] { ("Domicile", "domicile", 45.4180m, -75.7020m), ("Travail", "travail", 45.4260m, -75.7100m) };
        var placesList = new List<PlaceFavori>();
        foreach (var uid in allUserIds)
        {
            foreach (var (label, icon, lat, lng) in lieuLabels)
            {
                placesList.Add(new PlaceFavori
                {
                    Id = Guid.NewGuid(), UserId = uid,
                    Pseudonyme = label, Adresse = label + ", Ottawa",
                    Lat = lat + (uid.GetHashCode() % 100) * 0.0001m,
                    Lng = lng + (uid.GetHashCode() % 100) * 0.0001m,
                    IconTag = icon, IsAnchored = false,
                    CreatedAt = now.AddDays(-20)
                });
            }
        }
        await db.PlacesFavoris.AddRangeAsync(placesList, ct);

        // ── GoTask progressions (driver1 proche complétion de plusieurs) ──────
        var goTaskIds = new[]
        {
            Guid.Parse("A0000000-0000-0000-0000-000000000001"),
            Guid.Parse("A0000000-0000-0000-0000-000000000002"),
            Guid.Parse("A0000000-0000-0000-0000-000000000003"),
            Guid.Parse("A0000000-0000-0000-0000-000000000005"),
            Guid.Parse("A0000000-0000-0000-0000-000000000007"),
        };
        // Only add if GoTasks were seeded (idempotent check already done above)
        var existingKeys = await db.GoTasks.AsNoTracking().Select(t => t.Id).ToListAsync(ct);
        var progressions = new List<UserGoTaskProgression>();
        foreach (var taskId in goTaskIds)
        {
            if (!existingKeys.Contains(taskId)) continue;
            progressions.Add(new UserGoTaskProgression { Id = Guid.NewGuid(), UserId = driver1Id, GoTaskId = taskId, IsDone = true, CompletedAt = now.AddDays(-15) });
            progressions.Add(new UserGoTaskProgression { Id = Guid.NewGuid(), UserId = passenger1Id, GoTaskId = taskId, IsDone = true, CompletedAt = now.AddDays(-10) });
        }
        if (progressions.Count > 0)
            await db.UserGoTaskProgressions.AddRangeAsync(progressions, ct);

        // ── Notifications supplémentaires ─────────────────────────────────────
        var notifList = new List<Notification>();
        for (var i = 0; i < 10; i++)
        {
            notifList.Add(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = passengers[i % 4],
                Type = i % 3 == 0 ? NotificationType.ReservationAccepted : i % 3 == 1 ? NotificationType.TripReminder : NotificationType.NewReview,
                Title = $"Notification #{i + 1}",
                Body = $"Message de test #{i + 1}",
                IsRead = i % 2 == 0,
                IsImportant = i < 3,
                RelatedTripId = tripIds[i],
                CreatedAt = now.AddDays(-(i + 1))
            });
        }
        await db.Notifications.AddRangeAsync(notifList, ct);

        db.PlatformConfigs.Add(new PlatformConfig
        {
            Key = "seed.simulation.v1",
            Value = "seeded",
            DataType = "string",
            Category = "system",
            Description = "Simulation 1 mois — 5 users, 20 trips, 20 réservations, 15 avis",
            LastModifiedByAdminId = Guid.Parse("10000000-0000-0000-0000-000000000001"),
            UpdatedAt = DateTimeOffset.UtcNow
        });

        await db.SaveChangesAsync(ct);
        logger.LogInformation("DatabaseSeeder: simulation 1 mois injectée (5 users, 20 trips, 20 réservations, 15 avis, lieux favoris, GoTask progressions)");
    }
}

