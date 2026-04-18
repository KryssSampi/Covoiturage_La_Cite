namespace Covoiturage_la_cite__App_Mobile_.Services.language;

public interface ILanguageService
{
    bool IsFrench { get; }
    string CurrentLanguage { get; }
}

public class DefaultLanguageService : ILanguageService
{
    public bool IsFrench => System.Globalization.CultureInfo.CurrentUICulture.TwoLetterISOLanguageName == "fr";
    public string CurrentLanguage => IsFrench ? "fr" : "en";
}
