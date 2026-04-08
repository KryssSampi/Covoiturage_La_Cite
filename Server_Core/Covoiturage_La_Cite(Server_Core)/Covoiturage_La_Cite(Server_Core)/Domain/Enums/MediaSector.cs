namespace Covoiturage_La_Cite_Server_Core_.Domain.Enums;

/// <summary>
/// Sectors/categories where media can be used
/// </summary>
public enum MediaSector
{
    /// <summary>
    /// User profile pictures and related media
    /// </summary>
    Profile,

    /// <summary>
    /// Trip-related media (photos, documents, etc.)
    /// </summary>
    Trip,

    /// <summary>
    /// Vehicle documents and images
    /// </summary>
    Vehicle,

    /// <summary>
    /// Driver/Passenger identity documents
    /// </summary>
    Document,

    /// <summary>
    /// Chat messages attachments
    /// </summary>
    Chat,

    /// <summary>
    /// Content management (FAQ, articles, etc.)
    /// </summary>
    Content,

    /// <summary>
    /// Notification attachments
    /// </summary>
    Notification,

    /// <summary>
    /// System media (logos, icons, etc.)
    /// </summary>
    System,

    /// <summary>
    /// Emergency/SOS alerts media
    /// </summary>
    SosAlert,

    /// <summary>
    /// Review and rating media
    /// </summary>
    Review,

    /// <summary>
    /// Gamification media (badges, challenges, etc.)
    /// </summary>
    Gamification,

    /// <summary>
    /// Campus/geofence related media
    /// </summary>
    Campus,

    /// <summary>
    /// Finance and payment media
    /// </summary>
    Finance,

    /// <summary>
    /// General purpose media
    /// </summary>
    General,

}