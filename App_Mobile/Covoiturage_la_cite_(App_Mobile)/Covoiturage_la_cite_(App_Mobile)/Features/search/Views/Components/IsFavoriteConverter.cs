// Features/search/Views/Components/IsFavoriteConverter.cs
// Convertit SuggestionType.Favorite → true (badge ⭐ dans les suggestions)

using System.Globalization;
using Covoiturage_la_cite__App_Mobile_.Features.search.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.search.Views.Components;

public class IsFavoriteConverter : IValueConverter
{
    public object Convert(object? v, Type t, object? p, CultureInfo c)
        => v is SuggestionType type && type == SuggestionType.Favorite;

    public object ConvertBack(object? v, Type t, object? p, CultureInfo c)
        => throw new NotImplementedException();
}
