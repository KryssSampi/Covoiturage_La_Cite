import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../widgets/common_widgets.dart';

// ─── Modèle ────────────────────────────────────────────────────────────────────
enum TripStatus {
  published,    // Publiée
  withRequests, // Demandes en attente
  inProgress,   // En cours
  completed,    // Terminée
  cancelled,    // Annulée
}

enum TripRole { driver, passenger }

class TripData {
  const TripData({
    required this.id,
    required this.timeLabel,
    required this.departure,
    required this.destination,
    required this.status,
    required this.role,
    required this.price,
    this.passengerLabel,
    this.driverName,
    this.driverInitials,
    this.driverRating,
    this.vehicleLabel,
    this.progressPercent = 0,
    this.pendingRequests = 0,
    this.etaLabel,
    this.canRate = false,
  });

  final String id;
  final String timeLabel;
  final String departure;
  final String destination;
  final TripStatus status;
  final TripRole role;
  final double price;
  final String? passengerLabel;  // driver: "2/3 passagers"
  final String? driverName;      // passenger: nom du conducteur
  final String? driverInitials;
  final double? driverRating;
  final String? vehicleLabel;
  final double progressPercent;
  final int pendingRequests;
  final String? etaLabel;
  final bool canRate;
}

// ─── Widget ────────────────────────────────────────────────────────────────────
class TripCard extends StatelessWidget {
  const TripCard({
    super.key,
    required this.data,
    this.onTap,
    this.onCancel,
    this.onMessage,
    this.onTrack,
    this.onRate,
    this.onViewRequests,
  });

  final TripData data;
  final VoidCallback? onTap;
  final VoidCallback? onCancel;
  final VoidCallback? onMessage;
  final VoidCallback? onTrack;
  final VoidCallback? onRate;
  final VoidCallback? onViewRequests;

  (Color, Color, String) get _statusStyle => switch (data.status) {
    TripStatus.published =>
      (AppColors.gray100, AppColors.gray600, 'Publiée'),
    TripStatus.withRequests =>
      (AppColors.amberLight, AppColors.amber, 'Demandes'),
    TripStatus.inProgress =>
      (AppColors.blueLight, AppColors.blue, 'En cours'),
    TripStatus.completed =>
      (AppColors.tealLight, AppColors.teal, 'Terminée'),
    TripStatus.cancelled =>
      (AppColors.redLight, AppColors.redMid, 'Annulée'),
  };

  @override
  Widget build(BuildContext context) {
    final (statusBg, statusColor, statusLabel) = _statusStyle;
    final isInProgress = data.status == TripStatus.inProgress;
    final isCancelled = data.status == TripStatus.cancelled;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: AppRadius.lg,
          boxShadow: AppShadows.sm,
          border: Border.all(color: AppColors.border, width: 1),
        ),
        clipBehavior: Clip.hardEdge,
        child: Column(
          children: [
            // ── Bandeau "En cours" ─────────────────────────────────
            if (isInProgress)
              Container(
                color: AppColors.blue,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                child: Row(
                  children: [
                    _PulseDot(),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'En cours',
                        style: AppText.soraSemiBold13.copyWith(
                          color: Colors.white,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                    if (data.etaLabel != null)
                      Text(
                        data.etaLabel!,
                        style: AppText.dmSemi14.copyWith(color: Colors.white),
                      ),
                  ],
                ),
              ),

            // ── Corps principal ────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(13, 13, 13, 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icône miniature
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: AppColors.blueLight,
                      borderRadius: AppRadius.sm,
                    ),
                    child: data.role == TripRole.driver
                        ? const Icon(Icons.directions_car_rounded, color: AppColors.blue, size: 26)
                        : (data.driverInitials != null
                            ? AppAvatar(initials: data.driverInitials!, size: 50)
                            : const Icon(Icons.person_rounded, color: AppColors.blue, size: 26)),
                  ),
                  const SizedBox(width: 12),
                  // Infos
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          data.timeLabel,
                          style: AppText.dmSemi14.copyWith(
                            decoration: isCancelled ? TextDecoration.lineThrough : null,
                            color: isCancelled ? AppColors.gray400 : AppColors.text1,
                          ),
                        ),
                        const SizedBox(height: 4),
                        _RouteDisplay(
                          departure: data.departure,
                          destination: data.destination,
                        ),
                        const SizedBox(height: 6),
                        // Passager badge (conducteur) ou conducteur info (passager)
                        if (data.role == TripRole.driver && data.passengerLabel != null)
                          _PillTag(
                            icon: Icons.people_rounded,
                            label: data.passengerLabel!,
                            bg: AppColors.blueLight,
                            fg: AppColors.blue,
                          ),
                        if (data.role == TripRole.passenger && data.driverName != null)
                          Row(
                            children: [
                              Text('Avec : ', style: AppText.dmBody13),
                              Text(
                                data.driverName!,
                                style: AppText.dmSemi13.copyWith(color: AppColors.blue),
                              ),
                              if (data.driverRating != null) ...[
                                const SizedBox(width: 5),
                                Icon(Icons.star_rounded, size: 12, color: const Color(0xFFF59E0B)),
                                Text(
                                  data.driverRating!.toStringAsFixed(1),
                                  style: AppText.dmBody12.copyWith(color: const Color(0xFFBA7517)),
                                ),
                              ],
                            ],
                          ),
                        if (data.vehicleLabel != null) ...[
                          const SizedBox(height: 2),
                          Text(data.vehicleLabel!, style: AppText.dmBody12),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Badge statut + prix
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: statusBg,
                          borderRadius: AppRadius.full,
                        ),
                        child: Text(
                          statusLabel,
                          style: AppText.soraBadge.copyWith(color: statusColor),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${data.price.toStringAsFixed(0)} \$',
                        style: AppText.dmSemi14.copyWith(color: AppColors.blue),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // ── Barre progression (in progress) ───────────────────
            if (isInProgress && data.progressPercent > 0) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
                child: ClipRRect(
                  borderRadius: AppRadius.full,
                  child: LinearProgressIndicator(
                    value: data.progressPercent,
                    backgroundColor: AppColors.gray100,
                    color: AppColors.redMid,
                    minHeight: 6,
                  ),
                ),
              ),
            ],

            // ── Footer actions ─────────────────────────────────────
            if (_hasFooter) ...[
              Container(height: 1, color: AppColors.border),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 9, 12, 11),
                child: _FooterContent(
                  data: data,
                  onCancel: onCancel,
                  onMessage: onMessage,
                  onTrack: onTrack,
                  onRate: onRate,
                  onViewRequests: onViewRequests,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  bool get _hasFooter {
    if (data.status == TripStatus.cancelled || data.status == TripStatus.completed) {
      return data.canRate || data.role == TripRole.passenger;
    }
    return data.pendingRequests > 0 ||
        onCancel != null ||
        onMessage != null ||
        onTrack != null;
  }
}

class _FooterContent extends StatelessWidget {
  const _FooterContent({
    required this.data,
    this.onCancel,
    this.onMessage,
    this.onTrack,
    this.onRate,
    this.onViewRequests,
  });
  final TripData data;
  final VoidCallback? onCancel;
  final VoidCallback? onMessage;
  final VoidCallback? onTrack;
  final VoidCallback? onRate;
  final VoidCallback? onViewRequests;

  @override
  Widget build(BuildContext context) {
    // Cas rate
    if (data.canRate && onRate != null) {
      return GestureDetector(
        onTap: onRate,
        child: Container(
          height: 36,
          decoration: BoxDecoration(color: AppColors.gray100, borderRadius: AppRadius.sm),
          alignment: Alignment.center,
          child: Text('Évaluer', style: AppText.dmSemi12.copyWith(color: AppColors.text2)),
        ),
      );
    }
    // Cas passager en cours
    if (data.role == TripRole.passenger && data.status == TripStatus.inProgress) {
      return Row(
        children: [
          if (onMessage != null)
            Expanded(child: _FooterBtn(label: 'Message', onTap: onMessage, filled: false)),
          if (onMessage != null && onTrack != null) const SizedBox(width: 8),
          if (onTrack != null)
            Expanded(child: _FooterBtn(label: 'Suivre', onTap: onTrack, filled: true)),
        ],
      );
    }
    // Cas conducteur — demandes + annuler
    return Row(
      children: [
        if (data.pendingRequests > 0)
          Expanded(
            child: GestureDetector(
              onTap: onViewRequests,
              child: Row(
                children: [
                  Container(width: 7, height: 7, decoration: const BoxDecoration(color: AppColors.amberMid, shape: BoxShape.circle)),
                  const SizedBox(width: 6),
                  Text(
                    '${data.pendingRequests} demande${data.pendingRequests > 1 ? 's' : ''} en attente',
                    style: AppText.dmSemi12.copyWith(color: AppColors.amber),
                  ),
                ],
              ),
            ),
          ),
        if (onCancel != null)
          GestureDetector(
            onTap: onCancel,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                borderRadius: AppRadius.sm,
                border: Border.all(color: AppColors.redMid, width: 1.5),
              ),
              child: Text('Annuler', style: AppText.dmSemi12.copyWith(color: AppColors.redMid)),
            ),
          ),
      ],
    );
  }
}

class _FooterBtn extends StatelessWidget {
  const _FooterBtn({required this.label, this.onTap, required this.filled});
  final String label;
  final VoidCallback? onTap;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 38,
        decoration: BoxDecoration(
          color: filled ? AppColors.blue : AppColors.gray100,
          borderRadius: AppRadius.sm,
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: AppText.dmSemi12.copyWith(color: filled ? Colors.white : AppColors.text2),
        ),
      ),
    );
  }
}

class _RouteDisplay extends StatelessWidget {
  const _RouteDisplay({required this.departure, required this.destination});
  final String departure;
  final String destination;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 7, height: 7, decoration: const BoxDecoration(color: AppColors.blue, shape: BoxShape.circle)),
        const SizedBox(width: 5),
        Flexible(child: Text(departure, style: AppText.dmBody13, overflow: TextOverflow.ellipsis)),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 4),
          child: Icon(Icons.chevron_right_rounded, size: 14, color: AppColors.gray400),
        ),
        Container(width: 7, height: 7, decoration: const BoxDecoration(color: AppColors.redMid, shape: BoxShape.circle)),
        const SizedBox(width: 5),
        Flexible(child: Text(destination, style: AppText.dmBody13, overflow: TextOverflow.ellipsis)),
      ],
    );
  }
}

class _PillTag extends StatelessWidget {
  const _PillTag({required this.icon, required this.label, required this.bg, required this.fg});
  final IconData icon;
  final String label;
  final Color bg;
  final Color fg;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: AppRadius.full),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: fg),
          const SizedBox(width: 4),
          Text(label, style: AppText.soraBadge.copyWith(color: fg)),
        ],
      ),
    );
  }
}

// Dot animé "live"
class _PulseDot extends StatefulWidget {
  @override
  State<_PulseDot> createState() => _PulseDotState();
}

class _PulseDotState extends State<_PulseDot> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))
      ..repeat(reverse: true);
    _opacity = Tween<double>(begin: 1, end: 0.3).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _opacity,
      builder: (_, __) => Opacity(
        opacity: _opacity.value,
        child: Container(
          width: 8,
          height: 8,
          decoration: const BoxDecoration(
            color: Color(0xFF7EFFD4),
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}
