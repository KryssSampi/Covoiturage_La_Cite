import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// Styles typographiques — Sora pour les titres/labels, DM Sans pour le corps.
abstract final class AppTextStyles {
  // ── Sora (headings, labels, numbers) ─────────────────────────────
  static TextStyle soraH1({Color color = AppColors.text1}) =>
      GoogleFonts.sora(fontWeight: FontWeight.w800, fontSize: 22, color: color, height: 1.2);

  static TextStyle soraH2({Color color = AppColors.text1}) =>
      GoogleFonts.sora(fontWeight: FontWeight.w700, fontSize: 18, color: color, height: 1.25);

  static TextStyle soraH3({Color color = AppColors.text1}) =>
      GoogleFonts.sora(fontWeight: FontWeight.w700, fontSize: 16, color: color, height: 1.3);

  static TextStyle soraTitle({Color color = AppColors.text1}) =>
      GoogleFonts.sora(fontWeight: FontWeight.w700, fontSize: 15, color: color);

  static TextStyle soraSubtitle({Color color = AppColors.text1}) =>
      GoogleFonts.sora(fontWeight: FontWeight.w700, fontSize: 14, color: color);

  static TextStyle soraSemibold({double size = 13, Color color = AppColors.text1}) =>
      GoogleFonts.sora(fontWeight: FontWeight.w600, fontSize: size, color: color);

  static TextStyle soraNumber({double size = 19, Color color = AppColors.text1}) =>
      GoogleFonts.sora(fontWeight: FontWeight.w800, fontSize: size, color: color, height: 1.1);

  static TextStyle soraLabel({double size = 11, Color color = AppColors.text3, double spacing = 0.9}) =>
      GoogleFonts.sora(
        fontWeight: FontWeight.w700,
        fontSize: size,
        color: color,
        letterSpacing: spacing,
      );

  static TextStyle soraBadge({Color color = AppColors.blue}) =>
      GoogleFonts.sora(fontWeight: FontWeight.w700, fontSize: 11, color: color);

  // ── DM Sans (body, descriptions, captions) ───────────────────────
  static TextStyle body({double size = 13, Color color = AppColors.text2}) =>
      GoogleFonts.dmSans(fontWeight: FontWeight.w400, fontSize: size, color: color, height: 1.45);

  static TextStyle bodySemibold({double size = 13, Color color = AppColors.text1}) =>
      GoogleFonts.dmSans(fontWeight: FontWeight.w600, fontSize: size, color: color);

  static TextStyle caption({Color color = AppColors.text3}) =>
      GoogleFonts.dmSans(fontWeight: FontWeight.w500, fontSize: 11.5, color: color);

  static TextStyle captionSemibold({Color color = AppColors.text3}) =>
      GoogleFonts.dmSans(fontWeight: FontWeight.w600, fontSize: 11.5, color: color);

  static TextStyle button({Color color = AppColors.surface}) =>
      GoogleFonts.dmSans(fontWeight: FontWeight.w600, fontSize: 13, color: color);

  static TextStyle navLabel({bool active = false}) => GoogleFonts.dmSans(
        fontWeight: active ? FontWeight.w700 : FontWeight.w500,
        fontSize: 10,
        color: active ? AppColors.blue : AppColors.gray400,
      );

  static TextStyle searchPlaceholder() =>
      GoogleFonts.dmSans(fontWeight: FontWeight.w400, fontSize: 15, color: AppColors.text3);

  static TextStyle searchText() =>
      GoogleFonts.dmSans(fontWeight: FontWeight.w400, fontSize: 15, color: AppColors.text1);
}
