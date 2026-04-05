namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

/// <summary>
/// Like utilisateur — un utilisateur peut liker un autre une seule fois.
/// Idempotent : un second appel retire le like (toggle).
/// </summary>
public class UserLike
{
    public Guid Id { get; set; }

    /// <summary>L'utilisateur qui a liké.</summary>
    public Guid LikerId { get; set; }

    /// <summary>L'utilisateur qui a été liké.</summary>
    public Guid LikedId { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public User Liker { get; set; } = null!;
    public User Liked { get; set; } = null!;
}
