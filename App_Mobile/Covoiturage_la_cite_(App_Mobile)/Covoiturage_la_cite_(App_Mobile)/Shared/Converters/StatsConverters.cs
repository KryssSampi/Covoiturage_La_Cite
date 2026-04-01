using System.Globalization;
using MauiIcons.Material;

namespace Covoiturage_la_cite__App_Mobile_.Shared.Converters
{
    /// <summary>
    /// Convertit un ratio (0.0–1.0) en hauteur de barre en dp.
    /// ConverterParameter = hauteur max (défaut 72).
    /// </summary>
    public class RatioToHeightConverter : IValueConverter
    {
        public object Convert(object? value, Type t, object? param, CultureInfo c)
        {
            var ratio     = value is double d ? d : 0.0;
            var maxHeight = param is string s && double.TryParse(s, System.Globalization.NumberStyles.Any, CultureInfo.InvariantCulture, out var h) ? h : 72.0;
            return Math.Max(4, ratio * maxHeight);
        }
        public object ConvertBack(object? v, Type t, object? p, CultureInfo c)
            => throw new NotImplementedException();
    }

    /// <summary>Convertit un entier (1–5) en chaîne d'étoiles "★★★★☆".</summary>
    public class StarRatingConverter : IValueConverter
    {
        public object Convert(object? value, Type t, object? param, CultureInfo c)
        {
            var rating   = value is int i ? i : 0;
            var maxStars = param is string s && int.TryParse(s, out var m) ? m : 5;
            rating = Math.Clamp(rating, 0, maxStars);
            return new string('★', rating) + new string('☆', maxStars - rating);
        }
        public object ConvertBack(object? v, Type t, object? p, CultureInfo c)
            => throw new NotImplementedException();
    }

    public class StringNotEmptyToBoolConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is string s && !string.IsNullOrWhiteSpace(s);

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotImplementedException();
    }

    public class MaterialIconConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is string name && Enum.TryParse<MaterialIcons>(name, true, out var icon))
                return icon;

            return MaterialIcons.Help;
        }

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotImplementedException();
    }
}
