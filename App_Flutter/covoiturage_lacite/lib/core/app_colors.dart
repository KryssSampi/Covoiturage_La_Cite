import 'package:flutter/material.dart';

/// Tokens de couleur — miroir exact des CSS vars des wireframes.
abstract final class AppColors {
  // Bleus
  static const blue       = Color(0xFF1A56CC);
  static const blueMid    = Color(0xFF2D7DD2);
  static const blueDark   = Color(0xFF0D3A8C);
  static const blueDeep   = Color(0xFF08316E);
  static const blueLight  = Color(0xFFE8F0FE);

  // Teals
  static const teal       = Color(0xFF0F6E56);
  static const tealMid    = Color(0xFF1D9E75);
  static const tealLight  = Color(0xFFE1F5EE);

  // Greens
  static const green      = Color(0xFF3B6D11);
  static const greenMid   = Color(0xFF639922);
  static const greenLight = Color(0xFFEAF3DE);

  // Ambers
  static const amber      = Color(0xFF854F0B);
  static const amberMid   = Color(0xFFBA7517);
  static const amberLight = Color(0xFFFAEEDA);

  // Reds
  static const red        = Color(0xFFA32D2D);
  static const redMid     = Color(0xFFE24B4A);
  static const redLight   = Color(0xFFFCEBEB);

  // Grays
  static const grayBg     = Color(0xFFF2F5FA);
  static const gray50     = Color(0xFFF8F9FC);
  static const gray100    = Color(0xFFEEF0F5);
  static const gray200    = Color(0xFFD8DBE5);
  static const gray400    = Color(0xFF8A95A8);
  static const gray600    = Color(0xFF545D6E);
  static const gray800    = Color(0xFF2C3345);

  // Surface & text
  static const surface    = Color(0xFFFFFFFF);
  static const text1      = Color(0xFF0D1624);
  static const text2      = Color(0xFF3D4A5C);
  static const text3      = Color(0xFF7A879A);

  // Borders
  static const border     = Color(0x12000000);  // rgba(0,0,0,0.07)
  static const borderMid  = Color(0x1C000000);  // rgba(0,0,0,0.11)

  // Shadows
  static const List<BoxShadow> shSm = [
    BoxShadow(color: Color(0x0F000000), blurRadius: 4,  offset: Offset(0, 1)),
    BoxShadow(color: Color(0x0A000000), blurRadius: 2,  offset: Offset(0, 1)),
  ];
  static const List<BoxShadow> shMd = [
    BoxShadow(color: Color(0x14000000), blurRadius: 14, offset: Offset(0, 4)),
    BoxShadow(color: Color(0x0A000000), blurRadius: 4,  offset: Offset(0, 2)),
  ];
  static const List<BoxShadow> shLg = [
    BoxShadow(color: Color(0x1A000000), blurRadius: 28, offset: Offset(0, 8)),
    BoxShadow(color: Color(0x0D000000), blurRadius: 8,  offset: Offset(0, 4)),
  ];

  // Border radii
  static const rSm   = 10.0;
  static const rMd   = 14.0;
  static const rLg   = 20.0;
  static const rXl   = 26.0;
  static const rFull = 999.0;
}
