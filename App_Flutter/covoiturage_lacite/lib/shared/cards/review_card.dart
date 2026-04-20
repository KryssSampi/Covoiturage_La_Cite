import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../widgets/common_widgets.dart';

// ─── Modèle ────────────────────────────────────────────────────────────────────
enum ReviewDirection { received, given }

class ReviewData {
  const ReviewData({
    required this.id,
    required this.direction,
    required this.personName,
    required this.personInitials,
    required this.rating,
    required this.comment,
    required this.dateLabel,
    required this.tripRoute,
    this.personAvatarUrl,
  });

  final String id;
  final ReviewDirection direction;
  final String personName;
  final String personInitials;
  final double rating;
  final String comment;
  final String dateLabel;
  final String tripRoute;
  final String? personAvatarUrl;
}

// ─── Widget ────────────────────────────────────────────────────────────────────
class ReviewCard extends StatelessWidget {
  const ReviewCard({
    super.key,
    required this.data,
    this.onTap,
  });

  final ReviewData data;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isReceived = data.direction == ReviewDirection.received;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: AppRadius.md,
          boxShadow: AppShadows.sm,
          border: Border.all(color: AppColors.border, width: 1),
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── En-tête : avatar + nom + étoiles ───────────────────
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AppAvatar(
                    initials: data.personInitials,
                    size: 44,
                    imageUrl: data.personAvatarUrl,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                data.personName,
                                style: AppText.soraSemiBold13,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            StarRating(rating: data.rating, size: 13),
                          ],
                        ),
                        const SizedBox(height: 3),
                        // Trajet + date
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                data.tripRoute,
                                style: AppText.dmBody12,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const Text(' · ', style: TextStyle(color: AppColors.gray200)),
                            Text(data.dateLabel, style: AppText.dmBody12),
                          ],
                        ),
                        const SizedBox(height: 6),
                        // Badge direction
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isReceived ? AppColors.tealLight : AppColors.gray100,
                            borderRadius: AppRadius.full,
                          ),
                          child: Text(
                            isReceived ? 'Reçu' : 'Laissé',
                            style: AppText.soraBadge.copyWith(
                              color: isReceived ? AppColors.teal : AppColors.gray600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              // ── Commentaire ────────────────────────────────────────
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.gray50,
                  borderRadius: AppRadius.sm,
                  border: Border.all(color: AppColors.border, width: 1),
                ),
                child: Text(
                  '"${data.comment}"',
                  style: AppText.dmBody13.copyWith(
                    color: AppColors.text2,
                    height: 1.5,
                    fontStyle: FontStyle.italic,
                  ),
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
