namespace Covoiturage_La_Cite_Server_Core_.Domain.Enums;

public enum PenaltyType
{
    LateCancellationDriver,
    LateCancellationPassenger,
    NoShowDriver,
    NoShowPassenger,
    Delay15To30Min,
    Delay30To60Min,
    DelayOver60Min,
    MisconductValidated
}
