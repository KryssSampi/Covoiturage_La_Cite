import 'package:flutter/material.dart';

// ─── Couleurs ─────────────────────────────────────────────────────────────────
class AppColors {
  // Blues
  static const blue = Color(0xFF1A56CC);
  static const blueDeep = Color(0xFF08316E);
  static const blueMid = Color(0xFF2D7DD2);
  static const blueLight = Color(0xFFE8F0FE);

  // Teals
  static const teal = Color(0xFF0F6E56);
  static const tealMid = Color(0xFF1D9E75);
  static const tealLight = Color(0xFFE1F5EE);

  // Ambers
  static const amber = Color(0xFF854F0B);
  static const amberMid = Color(0xFFBA7517);
  static const amberLight = Color(0xFFFAEEDA);

  // Reds
  static const red = Color(0xFFA32D2D);
  static const redMid = Color(0xFFE24B4A);
  static const redLight = Color(0xFFFCEBEB);

  // Grays
  static const grayBg = Color(0xFFF2F5FA);
  static const gray50 = Color(0xFFF8F9FC);
  static const gray100 = Color(0xFFEEF0F5);
  static const gray200 = Color(0xFFD8DBE5);
  static const gray400 = Color(0xFF8A95A8);
  static const gray600 = Color(0xFF545D6E);

  // Text
  static const text1 = Color(0xFF0D1624);
  static const text2 = Color(0xFF3D4A5C);
  static const text3 = Color(0xFF7A879A);

  // Surface
  static const surface = Colors.white;
  static const border = Color(0x12000000);
  static const borderMid = Color(0x1C000000);
}

// ─── Ombres ────────────────────────────────────────────────────────────────────
class AppShadows {
  static const sm = [
    BoxShadow(color: Color(0x0F000000), blurRadius: 4, offset: Offset(0, 1)),
    BoxShadow(color: Color(0x0A000000), blurRadius: 2, offset: Offset(0, 1)),
  ];
  static const md = [
    BoxShadow(color: Color(0x14000000), blurRadius: 14, offset: Offset(0, 4)),
    BoxShadow(color: Color(0x0A000000), blurRadius: 4, offset: Offset(0, 2)),
  ];
}

// ─── Rayons ────────────────────────────────────────────────────────────────────
class AppRadius {
  static const sm = BorderRadius.all(Radius.circular(10));
  static const md = BorderRadius.all(Radius.circular(14));
  static const lg = BorderRadius.all(Radius.circular(20));
  static const full = BorderRadius.all(Radius.circular(999));
}

// ─── Typographie ───────────────────────────────────────────────────────────────
class AppText {
  // Sora — titres & badges
  static const TextStyle soraH1 = TextStyle(
    fontFamily: 'Sora',
    fontWeight: FontWeight.w800,
    fontSize: 22,
    color: AppColors.blueDeep,
  );
  static const TextStyle soraH2 = TextStyle(
    fontFamily: 'Sora',
    fontWeight: FontWeight.w700,
    fontSize: 15,
    color: AppColors.text1,
  );
  static const TextStyle soraSemiBold13 = TextStyle(
    fontFamily: 'Sora',
    fontWeight: FontWeight.w600,
    fontSize: 13,
    color: AppColors.text1,
  );
  static const TextStyle soraBadge = TextStyle(
    fontFamily: 'Sora',
    fontWeight: FontWeight.w700,
    fontSize: 11,
  );
  static const TextStyle soraLabel = TextStyle(
    fontFamily: 'Sora',
    fontWeight: FontWeight.w600,
    fontSize: 11,
    color: AppColors.text3,
    letterSpacing: 0.8,
  );

  // DM Sans — corps
  static const TextStyle dmBody14 = TextStyle(
    fontFamily: 'DM Sans',
    fontWeight: FontWeight.w400,
    fontSize: 14,
    color: AppColors.text1,
  );
  static const TextStyle dmBody13 = TextStyle(
    fontFamily: 'DM Sans',
    fontWeight: FontWeight.w400,
    fontSize: 13,
    color: AppColors.text2,
  );
  static const TextStyle dmBody12 = TextStyle(
    fontFamily: 'DM Sans',
    fontWeight: FontWeight.w400,
    fontSize: 12,
    color: AppColors.text3,
  );
  static const TextStyle dmSemi14 = TextStyle(
    fontFamily: 'DM Sans',
    fontWeight: FontWeight.w600,
    fontSize: 14,
    color: AppColors.text1,
  );
  static const TextStyle dmSemi13 = TextStyle(
    fontFamily: 'DM Sans',
    fontWeight: FontWeight.w600,
    fontSize: 13,
    color: AppColors.text1,
  );
  static const TextStyle dmSemi12 = TextStyle(
    fontFamily: 'DM Sans',
    fontWeight: FontWeight.w600,
    fontSize: 12,
  );
}
