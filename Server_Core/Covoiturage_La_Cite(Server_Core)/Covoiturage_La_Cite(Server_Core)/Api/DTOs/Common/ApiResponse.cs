namespace Covoiturage_La_Cite_Server_Core_.Api.DTOs.Common;

/// <summary>
/// Enveloppe de réponse API standardisée.
/// </summary>
public static class ApiResponse
{
    public static object Ok(string message) => new { Success = true, Message = message };

    public static object Fail(string message) => new { Success = false, Message = message };

    public static object Fail(string message, string[]? errors = null) => new { Success = false, Message = message, Errors = errors };

    public static object NotFound(string message) => new { Success = false, Message = message, Error = "NotFound" };
}

/// <summary>
/// Enveloppe de réponse API générique typée.
/// </summary>
public static class ApiResponse<T>
{
    public static object Ok(T data) => new { Success = true, Data = data };

    public static object Ok(T data, string message) => new { Success = true, Data = data, Message = message };

    public static object Fail(string message) => new { Success = false, Message = message };
}
