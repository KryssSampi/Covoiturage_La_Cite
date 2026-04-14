namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities.Security;

public class CertificateRotationEvent
{
    public Guid Id { get; set; }
    public string TriggeredBy { get; set; } = null!;            // scheduled_irregular | anomaly_detected | admin_forced | security_breach
    public int AffectedClientsCount { get; set; }               // clients mis à HasGotNewPublicKey = false
    public DateTimeOffset NewPublicKeyGeneratedAt { get; set; }
    public DateTimeOffset? PropagationCompletedAt { get; set; } // null si en cours
    public string? Note { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
