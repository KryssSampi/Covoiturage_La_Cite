using System.Globalization;

namespace Covoiturage_la_cite__App_Mobile_.Shared.Converters
{
    public class NotNullToBoolConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is not null;

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }

    public class InverseBoolConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is bool b ? !b : value;

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }

    public class BoolToOpacityConverter : IValueConverter
    {
        public double FalseOpacity { get; set; } = 0.4;

        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is bool b && b ? 1.0 : FalseOpacity;

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }

    public class ListToStringConverter : IValueConverter
    {
        public string Separator { get; set; } = " · ";

        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is not System.Collections.IEnumerable list)
                return string.Empty;

            var items = new List<string>();
            foreach (var item in list)
            {
                if (item is null) continue;
                items.Add(item.ToString() ?? "");
            }

            return string.Join(Separator, items);
        }

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }

    //public class StringNotEmptyToBoolConverter : IValueConverter
    //{
    //    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    //        => value is string s && !string.IsNullOrWhiteSpace(s);

    //    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    //        => throw new NotSupportedException();
    //}

    public class RatioToWidthConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            var ratio = value is double d ? d : 0.0;
            var maxWidth = parameter is string s && double.TryParse(s, out var w) ? w : 200.0;
            return Math.Max(0, ratio * maxWidth);
        }

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }
    public class BoolToVisibilityConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is bool b && b;

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }
}


