namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class Badge
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string NameEn { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string DescriptionEn { get; set; } = null!;
    public string Category { get; set; } = null!;       // eco | social | driver | passenger | safety
    public string IconUrl { get; set; } = null!;
    public int RewardPoints { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation
    public ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
}
