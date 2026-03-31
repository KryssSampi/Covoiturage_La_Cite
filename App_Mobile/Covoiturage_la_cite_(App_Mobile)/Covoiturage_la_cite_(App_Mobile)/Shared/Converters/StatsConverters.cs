using System.Globalization;
using MauiIcons.Material;

namespace Covoiturage_la_cite__App_Mobile_.Shared.Converters
{
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
