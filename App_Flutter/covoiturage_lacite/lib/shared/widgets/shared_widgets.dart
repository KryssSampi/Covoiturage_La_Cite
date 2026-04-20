import 'package:flutter/material.dart';
import '../../core/app_colors.dart';
import '../../core/app_text_styles.dart';

// ── Surface card with standard shadow ─────────────────────────────────────────

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double radius;
  final List<BoxShadow> shadows;
  final Color color;
  final Border? border;
  final VoidCallback? onTap;
  final bool clip;

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.radius = AppColors.rMd,
    this.shadows = AppColors.shSm,
    this.color = AppColors.surface,
    this.border,
    this.onTap,
    this.clip = true,
  });

  @override
  Widget build(BuildContext context) {
    Widget card = Container(
      margin: margin,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(radius),
        boxShadow: shadows,
        border: border ??
            Border.all(color: AppColors.border, width: 1),
      ),
      clipBehavior: clip ? Clip.antiAlias : Clip.none,
      child: padding != null ? Padding(padding: padding!, child: child) : child,
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: card,
      );
    }
    return card;
  }
}

// ── Section label (UPPERCASE with letter spacing) ──────────────────────────────

class SectionLabel extends StatelessWidget {
  final String text;
  final EdgeInsetsGeometry padding;
  final Widget? trailing;

  const SectionLabel(
    this.text, {
    super.key,
    this.padding = const EdgeInsets.fromLTRB(20, 18, 20, 10),
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Row(
        children: [
          Expanded(
            child: Text(
              text.toUpperCase(),
              style: AppTextStyles.soraLabel(),
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

// ── Route pill (dot → dot) ────────────────────────────────────────────────────

class RouteMiniRow extends StatelessWidget {
  final String from;
  final String to;
  final double fontSize;

  const RouteMiniRow({
    super.key,
    required this.from,
    required this.to,
    this.fontSize = 12,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _dot(AppColors.blue),
        const SizedBox(width: 6),
        Flexible(
          child: Text(from,
              style: AppTextStyles.captionSemibold(color: AppColors.text2)
                  .copyWith(fontSize: fontSize),
              overflow: TextOverflow.ellipsis),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 6),
          child: Icon(Icons.arrow_forward, size: 12, color: AppColors.gray400),
        ),
        _dot(AppColors.redMid),
        const SizedBox(width: 6),
        Flexible(
          child: Text(to,
              style: AppTextStyles.captionSemibold(color: AppColors.text2)
                  .copyWith(fontSize: fontSize),
              overflow: TextOverflow.ellipsis),
        ),
      ],
    );
  }

  Widget _dot(Color c) => Container(
        width: 7,
        height: 7,
        decoration: BoxDecoration(color: c, shape: BoxShape.circle),
      );
}

// ── Status pill ───────────────────────────────────────────────────────────────

class StatusPill extends StatelessWidget {
  final String label;
  final Color bg;
  final Color fg;
  final double fontSize;

  const StatusPill({
    super.key,
    required this.label,
    required this.bg,
    required this.fg,
    this.fontSize = 11,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppColors.rFull),
      ),
      child: Text(label, style: AppTextStyles.soraBadge(color: fg).copyWith(fontSize: fontSize)),
    );
  }
}

// ── Avatar initials circle ────────────────────────────────────────────────────

class AvatarInitials extends StatelessWidget {
  final String initials;
  final double size;
  final Color bg;
  final Color fg;

  const AvatarInitials({
    super.key,
    required this.initials,
    this.size = 44,
    this.bg = AppColors.blueLight,
    this.fg = AppColors.blue,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
      alignment: Alignment.center,
      child: Text(
        initials,
        style: AppTextStyles.soraSemibold(
            size: size * 0.34, color: fg),
      ),
    );
  }
}

// ── Icon circle ───────────────────────────────────────────────────────────────

class IconCircle extends StatelessWidget {
  final IconData icon;
  final double size;
  final double iconSize;
  final Color bg;
  final Color fg;

  const IconCircle({
    super.key,
    required this.icon,
    this.size = 44,
    this.iconSize = 22,
    this.bg = AppColors.blueLight,
    this.fg = AppColors.blue,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(size / 2),
      ),
      alignment: Alignment.center,
      child: Icon(icon, size: iconSize, color: fg),
    );
  }
}

// ── Horizontal divider ────────────────────────────────────────────────────────

class AppDivider extends StatelessWidget {
  final EdgeInsetsGeometry? margin;

  const AppDivider({super.key, this.margin});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 1,
      margin: margin,
      color: AppColors.border,
    );
  }
}

// ── Gap spacer between sections ───────────────────────────────────────────────

class SectionGap extends StatelessWidget {
  final double height;
  const SectionGap({super.key, this.height = 8});

  @override
  Widget build(BuildContext context) =>
      ColoredBox(color: AppColors.grayBg, child: SizedBox(height: height, width: double.infinity));
}
