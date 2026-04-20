import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../widgets/common_widgets.dart';

// ─── Modèle ────────────────────────────────────────────────────────────────────
enum ReservationRole { passenger, driver }

class ReservationData {
  const ReservationData({
    required this.id,
    required this.departure,
    required this.destination,
    required this.date,
    required this.time,
    required this.status,
    required this.role,
    this.personName,
    this.personRating,
    this.personInitials,
    this.price,
    this.seatsInfo,
    this.requestId,
    this.tripId,
  });

  final String id;
  final String departure;
  final String destination;
  final String date;
  final String time;
  final String status;
  final ReservationRole role;
  final String? personName;
  final double? personRating;
  final String? personInitials;
  final double? price;
  final String? seatsInfo;
  final String? requestId;
  final String? tripId;

  String get personRoleLabel =>
      role == ReservationRole.driver ? 'Passager' : 'Conducteur';
}

// ─── Widget ────────────────────────────────────────────────────────────────────
class ReservationCard extends StatelessWidget {
  const ReservationCard({
    super.key,
    required this.data,
    this.onTap,
    this.onCancel,
    this.onViewDetails,
  });

  final ReservationData data;
  final VoidCallback? onTap;
  final VoidCallback? onCancel;
  final VoidCallback? onViewDetails;

  bool get _showActions {
    final s = data.status.toLowerCase();
    return s == 'confirmed' || s == 'confirmé' || s == 'confirmée' || s == 'pending' || s == 'en attente';
  }

  @override
  Widget build(BuildContext context) {
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
        child: Column(
          children: [
            // ── Corps principal ──────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Route + badge
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _RouteRow(
                              departure: data.departure,
                              destination: data.destination,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      StatusBadge.fromStatus(data.status),
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Date + heure
                  _IconRow(
                    icon: Icons.schedule_rounded,
                    text: '${data.date} à ${data.time}',
                  ),
                  const SizedBox(height: 4),
                  // Personne
                  if (data.personName != null) ...[
                    _PersonRow(
                      initials: data.personInitials ?? data.personName![0],
                      name: data.personName!,
                      roleLabel: data.personRoleLabel,
                      rating: data.personRating,
                    ),
                  ],
                  // Prix + places
                  if (data.price != null || data.seatsInfo != null) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        if (data.price != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.tealLight,
                              borderRadius: AppRadius.full,
                            ),
                            child: Text(
                              '${data.price!.toStringAsFixed(2)} \$',
                              style: AppText.soraBadge.copyWith(color: AppColors.teal),
                            ),
                          ),
                        if (data.price != null && data.seatsInfo != null) const SizedBox(width: 8),
                        if (data.seatsInfo != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.blueLight,
                              borderRadius: AppRadius.full,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.person_rounded, size: 11, color: AppColors.blue),
                                const SizedBox(width: 3),
                                Text(
                                  data.seatsInfo!,
                                  style: AppText.soraBadge.copyWith(color: AppColors.blue),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            // ── Actions ─────────────────────────────────────────────────
            if (_showActions) ...[
              Container(height: 1, color: AppColors.border),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                child: Row(
                  children: [
                    if (onCancel != null)
                      Expanded(
                        child: _OutlineButton(
                          label: 'Annuler',
                          color: AppColors.redMid,
                          onTap: onCancel,
                        ),
                      ),
                    if (onCancel != null && onViewDetails != null)
                      const SizedBox(width: 10),
                    if (onViewDetails != null)
                      Expanded(
                        child: _FilledButton(
                          label: 'Voir les détails',
                          color: AppColors.blue,
                          onTap: onViewDetails,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ── Sub-widgets ─────────────────────────────────────────────────────────────────
class _RouteRow extends StatelessWidget {
  const _RouteRow({required this.departure, required this.destination});
  final String departure;
  final String destination;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(departure, style: AppText.dmSemi14, overflow: TextOverflow.ellipsis),
        const SizedBox(height: 2),
        Row(
          children: [
            Container(width: 1.5, height: 16, color: AppColors.gray200),
          ],
        ),
        const SizedBox(height: 2),
        Text(destination, style: AppText.dmSemi14, overflow: TextOverflow.ellipsis),
      ],
    );
  }
}

class _IconRow extends StatelessWidget {
  const _IconRow({required this.icon, required this.text});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppColors.gray400),
        const SizedBox(width: 5),
        Expanded(child: Text(text, style: AppText.dmBody12)),
      ],
    );
  }
}

class _PersonRow extends StatelessWidget {
  const _PersonRow({
    required this.initials,
    required this.name,
    required this.roleLabel,
    this.rating,
  });
  final String initials;
  final String name;
  final String roleLabel;
  final double? rating;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        AppAvatar(initials: initials, size: 28),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: AppText.dmSemi13),
              Text(roleLabel, style: AppText.dmBody12),
            ],
          ),
        ),
        if (rating != null) StarRating(rating: rating!),
      ],
    );
  }
}

class _FilledButton extends StatelessWidget {
  const _FilledButton({required this.label, required this.color, this.onTap});
  final String label;
  final Color color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 38,
        decoration: BoxDecoration(color: color, borderRadius: AppRadius.sm),
        alignment: Alignment.center,
        child: Text(
          label,
          style: AppText.dmSemi12.copyWith(color: Colors.white),
        ),
      ),
    );
  }
}

class _OutlineButton extends StatelessWidget {
  const _OutlineButton({required this.label, required this.color, this.onTap});
  final String label;
  final Color color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 38,
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: AppRadius.sm,
          border: Border.all(color: color, width: 1.5),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: AppText.dmSemi12.copyWith(color: color),
        ),
      ),
    );
  }
}
