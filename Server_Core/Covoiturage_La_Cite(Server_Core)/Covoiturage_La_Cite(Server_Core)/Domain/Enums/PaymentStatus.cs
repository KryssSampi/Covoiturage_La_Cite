namespace Covoiturage_La_Cite_Server_Core_.Domain.Enums;

public enum PaymentStatus
{
    Pending,
    PreAuthorized,
    Captured,
    RefundedFull,
    RefundedPartial,
    Failed
}
