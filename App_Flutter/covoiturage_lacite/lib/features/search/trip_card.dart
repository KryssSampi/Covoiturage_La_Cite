import 'package:flutter/material.dart';
import '../../core/models/trip.dart';

class TripCard extends StatelessWidget {
  const TripCard({super.key, required this.trip, this.onTap});

  final Trip trip;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _Avatar(avatarUrl: trip.driverAvatarUrl, name: trip.driverName),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(trip.driverName,
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF0D1624))),
                        Row(children: [
                          const Icon(Icons.star, size: 13, color: Color(0xFFF59E0B)),
                          const SizedBox(width: 2),
                          Text(trip.driverRating.toStringAsFixed(1),
                              style: const TextStyle(fontSize: 12, color: Color(0xFF4b5563))),
                          const SizedBox(width: 6),
                          Text('• ${trip.driverTripCount} trajets',
                              style: const TextStyle(fontSize: 12, color: Color(0xFF9ca3af))),
                        ]),
                        Text(trip.vehicleModel,
                            style: const TextStyle(fontSize: 11, color: Color(0xFF6b7280))),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(color: const Color(0xFF16a34a), borderRadius: BorderRadius.circular(10)),
                    child: Text('${trip.passengerPrice.toStringAsFixed(2)} \$',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(height: 1, color: Color(0xFFf3f4f6)),
              const SizedBox(height: 10),
              Row(children: [
                const Icon(Icons.circle, size: 9, color: Color(0xFF1A56CC)),
                const SizedBox(width: 6),
                Expanded(child: Text(trip.departureLabel,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF374151)),
                    overflow: TextOverflow.ellipsis)),
              ]),
              const SizedBox(height: 4),
              Row(children: [
                const Icon(Icons.circle, size: 9, color: Color(0xFFE24B4A)),
                const SizedBox(width: 6),
                Expanded(child: Text(trip.arrivalLabel,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF374151)),
                    overflow: TextOverflow.ellipsis)),
              ]),
              const SizedBox(height: 10),
              Row(children: [
                _MetaChip(icon: Icons.access_time, label: '${trip.departureDate} ${trip.departureTime}'),
                const SizedBox(width: 8),
                _MetaChip(icon: Icons.person_outline, label: '${trip.availableSeats}/${trip.totalSeats} places'),
                const SizedBox(width: 8),
                _MetaChip(
                  icon: trip.paymentMethod == 'Cash' ? Icons.money : Icons.swap_horiz,
                  label: trip.paymentMethod == 'Cash' ? 'Espèces' : 'Interac',
                ),
              ]),
            ],
          ),
        ),
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.name, this.avatarUrl});
  final String name;
  final String? avatarUrl;

  @override
  Widget build(BuildContext context) {
    if (avatarUrl != null && avatarUrl!.isNotEmpty) {
      return CircleAvatar(radius: 22, backgroundImage: NetworkImage(avatarUrl!));
    }
    return CircleAvatar(
      radius: 22,
      backgroundColor: const Color(0xFFE8F0FE),
      child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : '?',
        style: const TextStyle(color: Color(0xFF1A56CC), fontWeight: FontWeight.w700, fontSize: 16),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: const Color(0xFFEEF0F5), borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: const Color(0xFF545D6E)),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF545D6E))),
        ],
      ),
    );
  }
}
