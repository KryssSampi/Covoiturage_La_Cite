namespace Covoiturage_La_Cite_Server_Core_.Domain.Enums;

public enum ReservationStatus
{
    Pending,
    Confirmed,
    Refused,
    Cancelled,
    CancelledByPassenger,
    CancelledByDriver,
    InProgress,
    Completed,
    NoShow,
    Expired
}
