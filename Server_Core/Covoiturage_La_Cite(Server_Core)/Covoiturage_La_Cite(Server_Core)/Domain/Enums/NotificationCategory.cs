namespace Covoiturage_La_Cite_Server_Core_.Domain.Enums;

/// <summary>
/// Catégorie de priorité d'une notification.
/// Utilisée pour filtrer les envois email/push selon les préférences utilisateur.
/// </summary>
public enum NotificationCategory
{
    /// <summary>Action requise immédiatement (réservation reçue, trajet annulé, SOS, pénalité).</summary>
    Primordiale,

    /// <summary>Information utile mais non urgente (trajet terminé, avis reçu, badge, défi).</summary>
    Secondaire,

    /// <summary>Contenu informatif / promotionnel (suggestions, nouveautés, GoTasks).</summary>
    Negligeable
}
