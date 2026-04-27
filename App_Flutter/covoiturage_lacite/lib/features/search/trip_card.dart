// lib/features/search/trip_card.dart
// Carte de résultat de recherche de trajet (vue passager)
// N'écraser que si ce fichier est absent

import 'package:flutter/material.dart';

import '../../core/models/trip.dart';

class TripCard extends StatelessWidget {
  const TripCard({super.key, required this.trip, required this.onTap});

  final Trip trip;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // En-tête : conducteur + prix
            Row(
              children: [
                // Avatar initiales
                Container(
                  width: 40,
                  height: 40,
                  decoration: const BoxDecoration(
                    color: Color(0xFFE8F0FE),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      trip.driverName.isNotEmpty
                          ? trip.driverName[0].toUpperCase()
                          : 'C',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF1A56CC),
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        trip.driverName,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                          color: Color(0xFF0D1624),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Row(
                        children: [
                          const Icon(Icons.star_rounded,
                              size: 12, color: Color(0xFFF59E0B)),
                          const SizedBox(width: 2),
                          Text(
                            trip.driverRating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFFBA7517),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${trip.driverTripCount} trajets',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF7A879A),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${trip.pricePerSeat.toStringAsFixed(2)} \$',
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 18,
                        color: Color(0xFF1A56CC),
                      ),
                    ),
                    const Text(
                      'par passager',
                      style: TextStyle(
                        fontSize: 10,
                        color: Color(0xFF7A879A),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            // Route
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFF1A56CC),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    trip.departureLabel,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF3D4A5C),
                      fontWeight: FontWeight.w600,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(left: 3),
              child: Container(
                width: 2,
                height: 14,
                color: const Color(0xFFD8DBE5),
                margin: const EdgeInsets.symmetric(vertical: 2),
              ),
            ),
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFFE24B4A),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    trip.arrivalLabel,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF3D4A5C),
                      fontWeight: FontWeight.w600,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            // Méta : date · durée · places
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                _pill(
                  Icons.schedule_rounded,
                  '${trip.departureDate} · ${_formatTime(trip.departureTime)}',
                  const Color(0xFFEEF0F5),
                  const Color(0xFF545D6E),
                ),
                _pill(
                  Icons.timer_outlined,
                  '${trip.estimatedDurationMin} min',
                  const Color(0xFFEEF0F5),
                  const Color(0xFF545D6E),
                ),
                _pill(
                  Icons.people_outlined,
                  '${trip.availableSeats} places',
                  const Color(0xFFE1F5EE),
                  const Color(0xFF0F6E56),
                ),
                if (trip.vehicleModel.isNotEmpty)
                  _pill(
                    Icons.directions_car_rounded,
                    trip.vehicleModel,
                    const Color(0xFFE8F0FE),
                    const Color(0xFF1A56CC),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _pill(IconData icon, String label, Color bg, Color fg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: fg),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(String raw) {
    // raw peut être ISO8601 ou "HH:mm:ss"
    try {
      final DateTime dt = DateTime.parse(raw).toLocal();
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      if (raw.length >= 5) return raw.substring(0, 5);
      return raw;
    }
  }
}
