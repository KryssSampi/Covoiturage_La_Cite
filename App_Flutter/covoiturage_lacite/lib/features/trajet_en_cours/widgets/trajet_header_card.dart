// ============================================================
// lib/features/trajet_en_cours/widgets/trajet_header_card.dart
// En-tête du trajet — miroir de TrajetHeader.tsx
// ============================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/trajet_en_cours_models.dart';

class TrajetHeaderCard extends StatelessWidget {
  const TrajetHeaderCard({
    super.key,
    required this.trip,
    required this.isDriver,
    required this.onCompleteTrip,
    required this.onCancelTrip,
    required this.onCallDriver,
  });

  final TrajetResponseDto trip;
  final bool isDriver;
  final VoidCallback onCompleteTrip;
  final VoidCallback onCancelTrip;
  final VoidCallback onCallDriver;

  @override
  Widget build(BuildContext context) {
    final TripDriverDto? driver = trip.driver;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF051f4a), Color(0xFF0d4490)],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Barre du haut : retour + titre
            Padding(
              padding: const EdgeInsets.fromLTRB(4, 8, 16, 0),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${trip.displayDepartureLabel} → ${trip.displayArrivalLabel}',
                          style: const TextStyle(
                            fontFamily: 'Sora', fontWeight: FontWeight.w700,
                            fontSize: 14, color: Colors.white,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          '#${trip.id}',
                          style: const TextStyle(fontSize: 11, color: Color(0x99FFFFFF)),
                        ),
                      ],
                    ),
                  ),
                  // Badge statut
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: const Color(0x200aad6a),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0x400aad6a)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(color: Color(0xFF0aad6a), shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 4),
                        const Text('En cours', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF0aad6a))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Info conducteur + prix
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              child: Row(
                children: [
                  // Avatar
                  CircleAvatar(
                    radius: 22,
                    backgroundColor: Colors.white.withOpacity(0.2),
                    child: driver?.avatarUrl != null
                        ? ClipOval(child: Image.network(driver!.avatarUrl!, fit: BoxFit.cover, width: 44, height: 44))
                        : Text(
                            driver?.initials ?? '?',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Colors.white),
                          ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          driver?.fullName ?? 'Conducteur',
                          style: const TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.star, size: 12, color: Color(0xFFF59E0B)),
                            const SizedBox(width: 3),
                            Text(
                              '${driver?.averageRating.toStringAsFixed(1) ?? '-'}',
                              style: const TextStyle(fontSize: 12, color: Color(0x99FFFFFF)),
                            ),
                            if (driver?.isProfileVerified == true) ...[
                              const SizedBox(width: 6),
                              const Icon(Icons.verified, size: 13, color: Color(0xFF0aad6a)),
                            ],
                          ],
                        ),
                        if (trip.vehicle != null)
                          Text(
                            '${trip.vehicle!.make} ${trip.vehicle!.model} · ${trip.vehicle!.color}',
                            style: const TextStyle(fontSize: 10, color: Color(0x66FFFFFF)),
                          ),
                      ],
                    ),
                  ),
                  // Prix
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${(isDriver ? trip.pricePerPassenger : trip.passengerPrice).toStringAsFixed(2)} \$',
                        style: const TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w800, fontSize: 20, color: Colors.white),
                      ),
                      const Text('/ passager', style: TextStyle(fontSize: 10, color: Color(0x66FFFFFF))),
                    ],
                  ),
                ],
              ),
            ),
            // Boutons d'action
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: isDriver
                  ? Row(
                      children: [
                        Expanded(
                          child: _ActionButton(
                            label: 'Terminer',
                            icon: Icons.flag_rounded,
                            color: const Color(0xFF0aad6a),
                            onTap: onCompleteTrip,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _ActionButton(
                            label: 'Annuler',
                            icon: Icons.close_rounded,
                            color: const Color(0xFFe03050),
                            onTap: onCancelTrip,
                          ),
                        ),
                      ],
                    )
                  : Row(
                      children: [
                        Expanded(
                          child: _ActionButton(
                            label: 'Appeler le conducteur',
                            icon: Icons.phone,
                            color: const Color(0xFF0aad6a),
                            onTap: onCallDriver,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _ActionButton(
                            label: 'Annuler',
                            icon: Icons.close_rounded,
                            color: const Color(0xFFe03050),
                            onTap: onCancelTrip,
                          ),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 11),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 15, color: Colors.white),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                label,
                style: const TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w700, fontSize: 12, color: Colors.white),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
