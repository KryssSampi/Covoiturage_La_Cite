namespace Covoiturage_La_Cite_Server_Core_.Domain.Entities;

public class PlatformConfig
{
    public string Key { get; set; } = null!;            // PK — ex: "matching.departure_radius_km"
    public string Value { get; set; } = null!;          // JSON-serializable
    public string DataType { get; set; } = null!;       // int | decimal | bool | string | json
    public string? Category { get; set; }
    public string? Description { get; set; }
    public Guid? LastModifiedByAdminId { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
