using System.ComponentModel.DataAnnotations;

namespace Covoiturage_La_Cite_Server_Core_.Application.DTOs.User;

/// <summary>
/// DTO pour la mise à jour partielle du profil utilisateur (PATCH /api/users/me).
/// </summary>
public record UpdateUserDto
{
    [MaxLength(100)]
    public string? FirstName { get; init; }

    [MaxLength(100)]
    public string? LastName { get; init; }

    [Phone]
    public string? PhoneNumber { get; init; }

    [Url]
    public string? AvatarUrl { get; init; }

    [MaxLength(5)]
    public string? Language { get; init; }

    public UpdatePreferencesDto? Preferences { get; init; }
}

public record UpdatePreferencesDto
{
    public bool? MusicAccepted { get; init; }
    public bool? PetsAccepted { get; init; }
    public bool? SmokingAccepted { get; init; }
    public string? ConversationLevel { get; init; }
}
