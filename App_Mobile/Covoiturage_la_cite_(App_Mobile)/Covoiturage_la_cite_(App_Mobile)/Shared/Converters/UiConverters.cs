using System.Globalization;

namespace Covoiturage_la_cite__App_Mobile_.Shared.Converters
{
    // ── NullToColor ──────────────────────────────────────────────────────────
    // ConverterParameter = "colorIfNull|colorIfNotNull"
    public class NullToColorConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            var parts = (parameter as string ?? "#d1d5db|#ef4444").Split('|');
            var hex = value is null ? parts[0] : (parts.Length > 1 ? parts[1] : parts[0]);
            return Color.FromArgb(hex);
        }
        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }

    // ── StringToDate ─────────────────────────────────────────────────────────
    // Two-way : string "yyyy-MM-dd" ↔ DateTime
    public class StringToDateConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is string s && DateTime.TryParseExact(s, "yyyy-MM-dd",
                    CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
                return dt;
            return DateTime.Today;
        }
        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is DateTime dt ? dt.ToString("yyyy-MM-dd") : "";
    }

    // ── StringToTime ─────────────────────────────────────────────────────────
    // Two-way : string "HH:mm" ↔ TimeSpan
    public class StringToTimeConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is string s && TimeSpan.TryParseExact(s, "hh\\:mm",
                    CultureInfo.InvariantCulture, out var ts))
                return ts;
            return TimeSpan.Zero;
        }
        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is TimeSpan ts ? ts.ToString("hh\\:mm") : "";
    }

    // ── BoolToPublishLabel ───────────────────────────────────────────────────
    public class BoolToPublishLabelConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is bool b && b ? "Publication en cours…" : "Publier le trajet";
        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }

    // ── BoolToSuccessEmoji ───────────────────────────────────────────────────
    public class BoolToSuccessEmojiConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is bool b && b ? "✅" : "❌";
        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }

    // ── BoolToBlue / InvertBoolToBlue ─────────────────────────────────────────
    // true  → #08316e (selected),  false → #f3f4f6 (unselected)
    public class BoolToBlueConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is bool b && b ? Color.FromArgb("#08316e") : Color.FromArgb("#f3f4f6");
        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }

    // false → #08316e,  true → #f3f4f6
    public class InvertBoolToBlueConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is bool b && !b ? Color.FromArgb("#08316e") : Color.FromArgb("#f3f4f6");
        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }

    // ── BoolToWhiteGray / BoolToGrayWhite ─────────────────────────────────────
    // BoolToWhiteGray : true → White, false → #6b7280
    public class BoolToWhiteGrayConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is bool b && b ? Colors.White : Color.FromArgb("#6b7280");
        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }

    // BoolToGrayWhite : true → #6b7280, false → White
    public class BoolToGrayWhiteConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            => value is bool b && b ? Color.FromArgb("#6b7280") : Colors.White;
        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotSupportedException();
    }


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


