import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../widgets/common_widgets.dart';

// ─── Modèle ────────────────────────────────────────────────────────────────────
enum NotificationType {
  reservationReceived,
  reservationAccepted,
  reservationRefused,
  tripCreated,
  tripStartingSoon,
  tripCompleted,
  tripCancelled,
  newReview,
  securityAlert,
  system,
}

class NotificationData {
  const NotificationData({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.timeAgo,
    this.isRead = false,
  });

  final String id;
  final String title;
  final String body;
  final NotificationType type;
  final String timeAgo;
  final bool isRead;
}

// ─── Widget ────────────────────────────────────────────────────────────────────
class NotificationCard extends StatelessWidget {
  const NotificationCard({
    super.key,
    required this.data,
    this.onTap,
    this.onDismiss,
  });

  final NotificationData data;
  final VoidCallback? onTap;
  final VoidCallback? onDismiss;

  // Couleur + icône selon le type
  (Color, Color, IconData) get _typeStyle => switch (data.type) {
    NotificationType.reservationReceived =>
      (AppColors.blueLight, AppColors.blue, Icons.assignment_turned_in_rounded),
    NotificationType.reservationAccepted =>
      (AppColors.tealLight, AppColors.teal, Icons.check_circle_rounded),
    NotificationType.reservationRefused =>
      (AppColors.redLight, AppColors.redMid, Icons.cancel_rounded),
    NotificationType.tripCreated =>
      (AppColors.tealLight, AppColors.tealMid, Icons.directions_car_rounded),
    NotificationType.tripStartingSoon =>
      (AppColors.amberLight, AppColors.amberMid, Icons.schedule_rounded),
    NotificationType.tripCompleted =>
      (AppColors.gray100, AppColors.gray600, Icons.done_all_rounded),
    NotificationType.tripCancelled =>
      (AppColors.redLight, AppColors.redMid, Icons.remove_circle_rounded),
    NotificationType.newReview =>
      (const Color(0xFFFEF3C7), const Color(0xFF92400E), Icons.star_rounded),
    NotificationType.securityAlert =>
      (AppColors.redLight, AppColors.redMid, Icons.security_rounded),
    NotificationType.system =>
      (AppColors.gray100, AppColors.gray600, Icons.info_outline_rounded),
  };

  @override
  Widget build(BuildContext context) {
    final (iconBg, iconColor, icon) = _typeStyle;

    return Dismissible(
      key: Key(data.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: AppColors.redLight,
        child: const Icon(Icons.delete_outline_rounded, color: AppColors.redMid),
      ),
      onDismissed: (_) => onDismiss?.call(),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppRadius.md,
            boxShadow: AppShadows.sm,
            border: Border.all(
              color: data.isRead ? AppColors.border : AppColors.blue.withOpacity(0.2),
              width: data.isRead ? 1 : 1.5,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icône type
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: iconBg,
                    borderRadius: AppRadius.sm,
                  ),
                  child: Icon(icon, color: iconColor, size: 22),
                ),
                const SizedBox(width: 12),
                // Contenu
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              data.title,
                              style: AppText.soraSemiBold13,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(data.timeAgo, style: AppText.dmBody12),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        data.body,
                        style: AppText.dmBody12.copyWith(
                          color: AppColors.text2,
                          height: 1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                // Dot non lu
                if (!data.isRead) ...[
                  const SizedBox(width: 8),
                  Container(
                    width: 8,
                    height: 8,
                    margin: const EdgeInsets.only(top: 4),
                    decoration: const BoxDecoration(
                      color: AppColors.blue,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
