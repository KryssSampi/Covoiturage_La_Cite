// ============================================================
// COVOITURAGE LA CITÉ — Feature: Profile
// ProfileConverters.cs — Tous les Value Converters MAUI
// utilisés par les vues Settings et PublicProfile
// ============================================================

using System;
using System.Globalization;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Graphics;

namespace Covoiturage_la_cite__App_Mobile_.Features.profile.Converters;

// ── InverseBoolConverter ─────────────────────────────────────────────────────

public class InverseBoolConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is bool b && !b;
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is bool b && !b;
}

// ── BoolToAmbianceColorConverter ─────────────────────────────────────────────
// true → blue background light, false → gray background

public class BoolToAmbianceColorConverter : IValueConverter
{
    public Color TrueColor { get; set; } = Color.FromArgb("#E8F0FE");
    public Color FalseColor { get; set; } = Color.FromArgb("#F8F9FC");

    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? TrueColor : FalseColor;
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

// ── BoolToTabStyleConverter ───────────────────────────────────────────────────
// Returns BackgroundColor based on active state

public class BoolToTabColorConverter : IValueConverter
{
    public Color ActiveColor { get; set; } = Color.FromArgb("#08316e");
    public Color InactiveColor { get; set; } = Colors.Transparent;

    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? ActiveColor : InactiveColor;
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class BoolToTabTextColorConverter : IValueConverter
{
    public Color ActiveColor { get; set; } = Colors.White;
    public Color InactiveColor { get; set; } = Color.FromArgb("#7A879A");

    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? ActiveColor : InactiveColor;
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

// ── ActiveBadgeColorConverter ─────────────────────────────────────────────────

public class ActiveBadgeColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? Color.FromArgb("#E1F5EE") : Color.FromArgb("#FAEEDA");
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class ActiveBadgeTextColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? Color.FromArgb("#0F6E56") : Color.FromArgb("#854F0B");
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

// ── ValidatedBadgeConverters ─────────────────────────────────────────────────

public class ValidatedBadgeColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? Color.FromArgb("#E8F0FE") : Color.FromArgb("#FAEEDA");
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class ValidatedBadgeTextColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? Color.FromArgb("#1A56CC") : Color.FromArgb("#854F0B");
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class ValidatedOpacityConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? 1.0 : 0.5;
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

// ── DocStatusIconConverter ───────────────────────────────────────────────────

public class DocStatusIconConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? "✅" : "📄";
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

// ── BoolToStrikethroughConverter ─────────────────────────────────────────────

public class BoolToStrikethroughConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? TextDecorations.Strikethrough : TextDecorations.None;
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

// ── SubmittedTextColorConverter ──────────────────────────────────────────────

public class SubmittedTextColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? Color.FromArgb("#1D9E75") : Color.FromArgb("#0D1624");
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

// ── RatingToStarsConverter ───────────────────────────────────────────────────

public class RatingToStarsConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is not double rating) return "☆☆☆☆☆";
        var full = (int)Math.Floor(rating);
        var half = (rating % 1) >= 0.5;
        var empty = 5 - full - (half ? 1 : 0);
        return new string('★', full) + (half ? "½" : "") + new string('☆', empty);
    }
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

// ── BoolToStringConverter ─────────────────────────────────────────────────────

public class BoolToStringConverter : IValueConverter
{
    public string TrueValue { get; }
    public string FalseValue { get; }
    public BoolToStringConverter(string trueValue = "Oui", string falseValue = "Non")
    {
        TrueValue = trueValue;
        FalseValue = falseValue;
    }
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? TrueValue : FalseValue;
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value?.ToString() == TrueValue;
}

// ── SubscribedColorConverter ─────────────────────────────────────────────────

public class SubscribedColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? Color.FromArgb("#E1F5EE") : Color.FromArgb("#1A56CC");
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class SubscribedTextColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? Color.FromArgb("#0F6E56") : Colors.White;
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

// ── NullToPlaceholderConverter ───────────────────────────────────────────────

public class NullToPlaceholderConverter : IValueConverter
{
    public string Placeholder { get; set; } = "placeholder_profile.png";
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => string.IsNullOrWhiteSpace(value?.ToString()) ? Placeholder : value!;
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

// ── BoolToFontSizeConverter ──────────────────────────────────────────────────
// Used in accessibility: apply font scale multiplier

public class FontSizeScaleConverter : IValueConverter
{
    public double BaseSize { get; set; } = 14;

    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return value?.ToString() switch
        {
            "small" => BaseSize * 0.85,
            "large" => BaseSize * 1.2,
            _ => BaseSize
        };
    }
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
