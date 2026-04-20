import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

enum BadgeVariant { teal, blue, amber, red, green, gray, gold, dark }

class StatusBadge extends StatelessWidget {
  const StatusBadge({
    super.key,
    required this.label,
    required this.variant,
    this.showDot = false,
  });

  final String label;
  final BadgeVariant variant;
  final bool showDot;

  factory StatusBadge.fromStatus(String status) {
    final s = status.toLowerCase();
    if (s == 'confirmed' || s == 'confirmé' || s == 'confirmée') {
      return StatusBadge(label: 'Confirmé', variant: BadgeVariant.teal);
    } else if (s == 'cancelled' || s == 'annulé' || s == 'annulée') {
      return StatusBadge(label: 'Annulé', variant: BadgeVariant.red);
    } else if (s == 'pending' || s == 'en attente') {
      return StatusBadge(label: 'En attente', variant: BadgeVariant.amber);
    } else if (s == 'in_progress' || s == 'en cours') {
      return StatusBadge(label: 'En cours', variant: BadgeVariant.blue);
    } else if (s == 'completed' || s == 'terminé' || s == 'terminée') {
      return StatusBadge(label: 'Terminé', variant: BadgeVariant.gray);
    } else if (s == 'rejected' || s == 'refusé') {
      return StatusBadge(label: 'Refusé', variant: BadgeVariant.red);
    }
    return StatusBadge(label: status, variant: BadgeVariant.gray);
  }

  (Color, Color) get _colors => switch (variant) {
    BadgeVariant.teal => (AppColors.tealLight, AppColors.teal),
    BadgeVariant.blue => (AppColors.blueLight, AppColors.blue),
    BadgeVariant.amber => (AppColors.amberLight, AppColors.amber),
    BadgeVariant.red => (AppColors.redLight, AppColors.red),
    BadgeVariant.green => (const Color(0xFFEAF3DE), const Color(0xFF3B6D11)),
    BadgeVariant.gray => (AppColors.gray100, AppColors.gray600),
    BadgeVariant.gold => (const Color(0xFFFEF3C7), const Color(0xFF92400E)),
    BadgeVariant.dark => (AppColors.blueDeep, Colors.white),
  };

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = _colors;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: AppRadius.full),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showDot) ...[
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(color: fg, shape: BoxShape.circle),
            ),
            const SizedBox(width: 4),
          ],
          Text(label, style: AppText.soraBadge.copyWith(color: fg)),
        ],
      ),
    );
  }
}

// ─── Avatar initiales ──────────────────────────────────────────────────────────
class AppAvatar extends StatelessWidget {
  const AppAvatar({
    super.key,
    required this.initials,
    this.size = 44,
    this.backgroundColor,
    this.foregroundColor,
    this.imageUrl,
  });

  final String initials;
  final double size;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final String? imageUrl;

  @override
  Widget build(BuildContext context) {
    final bg = backgroundColor ?? AppColors.blueLight;
    final fg = foregroundColor ?? AppColors.blue;
    final fontSize = size * 0.36;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: imageUrl != null ? Colors.transparent : bg,
        shape: BoxShape.circle,
        image: imageUrl != null
            ? DecorationImage(
                image: NetworkImage(imageUrl!),
                fit: BoxFit.cover,
              )
            : null,
      ),
      child: imageUrl == null
          ? Center(
              child: Text(
                initials.length > 2 ? initials.substring(0, 2) : initials,
                style: TextStyle(
                  fontFamily: 'Sora',
                  fontWeight: FontWeight.w700,
                  fontSize: fontSize,
                  color: fg,
                ),
              ),
            )
          : null,
    );
  }
}

// ─── Étoiles ───────────────────────────────────────────────────────────────────
class StarRating extends StatelessWidget {
  const StarRating({super.key, required this.rating, this.size = 12});
  final double rating;
  final double size;

  @override
  Widget build(BuildContext context) {
    final full = rating.floor();
    final hasHalf = (rating - full) >= 0.5;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(5, (i) {
          if (i < full) return Icon(Icons.star_rounded, size: size, color: const Color(0xFFF59E0B));
          if (i == full && hasHalf) return Icon(Icons.star_half_rounded, size: size, color: const Color(0xFFF59E0B));
          return Icon(Icons.star_outline_rounded, size: size, color: AppColors.gray200);
        }),
        const SizedBox(width: 4),
        Text(
          rating.toStringAsFixed(1),
          style: TextStyle(fontFamily: 'DM Sans', fontWeight: FontWeight.w600, fontSize: size, color: const Color(0xFFBA7517)),
        ),
      ],
    );
  }
}
