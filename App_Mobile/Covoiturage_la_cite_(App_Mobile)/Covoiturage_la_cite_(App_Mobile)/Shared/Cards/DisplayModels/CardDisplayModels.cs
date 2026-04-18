// Shared/Cards/DisplayModels/CardDisplayModels.cs
// DisplayModels de toutes les cartes de l'application (hors admin).
// Records immuables — les controllers les construisent,
// les composants les consomment en lecture seule.

namespace Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

public record RouteDisplayModel(
    string FromLabel,
    string ToLabel,
    string? DepartureTime = null,
    string? ArrivalTime   = null
);

public record AvatarDisplayModel(
    string Initials,
    string BackgroundHex,
    string ForegroundHex,
    string? ImageUrl = null
);

public record RouteItineraryCardDisplayModel(
    string  MapImageSource,
    string  Label,
    string  LabelColorHex,
    string  FromAddress,
    string  ToAddress,
    string  Via,
    int     DurationMinutes,
    double  DistanceKm,
    string  CtaLabel
);

public record TripSearchResultCardDisplayModel(
    AvatarDisplayModel  DriverAvatar,
    string              DriverName,
    bool                IsVerified,
    double              Rating,
    int                 TripCount,
    decimal             PricePerPerson,
    RouteDisplayModel   Route,
    int                 AvailableSeats,
    int                 CompatibilityPercent,
    bool                IsTopMatch,
    IReadOnlyList<string> Badges
);

public enum DriverTripStatus
{
    Published,
    WithRequests,
    InProgress,
    Completed,
    Cancelled
}

public record DriverTripCardDisplayModel(
    string             TripId,
    string             TimeLabel,
    RouteDisplayModel  Route,
    string             PassengerLabel,
    decimal            Price,
    DriverTripStatus   Status,
    int                PendingRequests,
    double             ProgressPercent,
    string?            EtaLabel,
    AvatarDisplayModel? LastPassengerAvatar = null,
    string?            LastPassengerName   = null
);

public enum PassengerReservationStatus
{
    Pending,
    Confirmed,
    InProgress,
    Completed,
    Refused
}

public record PassengerReservationCardDisplayModel(
    AvatarDisplayModel         DriverAvatar,
    string                     DriverName,
    double                     DriverRating,
    int                        DriverTripCount,
    string                     TimeLabel,
    RouteDisplayModel          Route,
    decimal                    Price,
    PassengerReservationStatus Status,
    string?  VehicleLabel   = null,
    string?  EtaLabel       = null,
    bool     CanRate        = false,
    string   TripId         = ""
);

public record IncomingReservationRequestCardDisplayModel(
    AvatarDisplayModel PassengerAvatar,
    string             PassengerName,
    double             PassengerRating,
    int                PassengerTripCount,
    RouteDisplayModel  Route,
    string             TripTimeLabel,
    decimal            Price,
    int                SeatsInfo,
    string             TripId = ""
);

public enum NotificationType
{
    NewRequest,
    Confirmed,
    Reminder,
    Info,
    Cancelled
}

public record NotificationCardDisplayModel(
    AvatarDisplayModel     Avatar,
    string                 SenderName,
    string                 Message,
    string                 TimeLabel,
    NotificationType       Type,
    RouteDisplayModel?     Route    = null,
    bool                   HasAcceptAction = false,
    bool                   HasDeclineAction = false
);

public record ReviewCardDisplayModel(
    AvatarDisplayModel ReviewerAvatar,
    string             ReviewerName,
    string             DateLabel,
    string             Comment,
    int                Stars
);

public record ReviewFormCardDisplayModel(
    AvatarDisplayModel  SubjectAvatar,
    string              SubjectName,
    string              TripLabel,
    int                 CurrentRating,
    IReadOnlyList<string> ActiveTags,
    IReadOnlyList<string> AvailableTags,
    string              Comment
);

public enum PlaceType { Home, Work, Campus, Custom }

public record FavoritePlaceCardDisplayModel(
    string    Name,
    string    Address,
    PlaceType Type
);

public record FavoriteDriverCardDisplayModel(
    AvatarDisplayModel    Avatar,
    string                Name,
    double                Rating,
    bool                  IsActive,
    IReadOnlyList<string> Badges,
    int                   SharedTripsTotal,
    int                   SharedTripsThisMonth
);

public record FavoriteTripAlertCardDisplayModel(
    RouteDisplayModel  Route,
    IReadOnlyList<string> ActiveDays,
    string             TimeRange,
    bool               FavoritesOnly,
    double             MinRating,
    decimal            MaxPrice,
    bool               AlertEnabled
);

public record StatTileCardDisplayModel(
    string MaterialIconName,
    string IconBackgroundHex,
    string IconColorHex,
    string Value,
    string Unit,
    string Label,
    string? BadgeLabel = null,
    string? BadgeColorHex = null
);

public enum TransactionCardType { Credit, Debit, Penalty }

public record TransactionCardDisplayModel(
    string              Label,
    string              SubLabel,
    decimal             Amount,
    TransactionCardType Type,
    bool                CanContest = false
);

public enum HistoryTripRole { Passenger, Driver }

public record HistoryTripCardDisplayModel(
    HistoryTripRole    Role,
    string             DateTimeLabel,
    RouteDisplayModel  Route,
    AvatarDisplayModel? OtherPersonAvatar = null,
    string?            OtherPersonName   = null,
    double?            OtherPersonRating = null,
    int?               OtherPersonTrips  = null,
    int?               SeatsInfo         = null,
    decimal?           Price             = null,
    bool               CanBook           = false,
    string?            PricePerPassenger = null,
    int?               AvailableSeats    = null,
    string?            ModifiedLabel     = null
);

public record DraftTripCardDisplayModel(
    RouteDisplayModel  Route,
    string             ScheduleLabel,
    string             TitleLabel
);

public record RecurringTripCardDisplayModel(
    string             ScheduleLabel,
    RouteDisplayModel  Route,
    bool               IsActive,
    string             ExpiryLabel,
    int                AvailableSeats,
    decimal            Price
);

public record LiveTrackingCardDisplayModel(
    AvatarDisplayModel DriverAvatar,
    string             DriverName,
    double             DriverRating,
    string             VehicleLabel,
    int                EtaMinutes,
    string             MapImageSource
);

public record SosCardDisplayModel(
    string Title,
    string Subtitle
);

public enum LocationSuggestionType { Favorite, Recent, Station }

public record LocationSuggestionItemDisplayModel(
    string                 Name,
    string                 Address,
    LocationSuggestionType Type
);

public record NewFeatureCardDisplayModel(
    string Title,
    string Description,
    string CtaLabel
);
