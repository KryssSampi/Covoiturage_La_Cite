// ============================================================
// lib/features/trajet_en_cours/widgets/trip_info_panel.dart
// Panneau d'information du trajet — miroir de TripInfoPanel.tsx
// Points de route, préférences, statut, véhicule, tarification
// ============================================================

import 'package:flutter/material.dart';
import '../models/trajet_en_cours_models.dart';

class TripInfoPanel extends StatelessWidget {
  const TripInfoPanel({
    super.key,
    required this.trip,
    required this.isDriver,
    required this.passengers,
  });

  final TrajetResponseDto trip;
  final bool isDriver;
  final List<TrajetPassengerDto> passengers;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // ── Points du trajet + Préférences ──────────────────────────────
        _InfoCard(
          children: [
            _SectionTitle(
              icon: Icons.circle,
              iconColor: const Color(0xFF08316E),
              title: 'Points du trajet',
            ),
            const SizedBox(height: 10),
            _RoutePoint(
              label: 'Départ',
              name: trip.displayDepartureLabel,
              address: trip.departureAddress,
              color: const Color(0xFF0aad6a),
              hasLine: true,
            ),
            const SizedBox(height: 6),
            _RoutePoint(
              label: 'Arrivée',
              name: trip.displayArrivalLabel,
              address: trip.arrivalAddress,
              color: const Color(0xFFe03050),
              hasLine: false,
            ),
            if (trip.driverNote != null && trip.driverNote!.isNotEmpty) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0F4FB),
                  borderRadius: BorderRadius.circular(8),
                  border: Border(left: BorderSide(color: const Color(0xFF08316E), width: 3)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.chat_bubble_outline, size: 14, color: Color(0xFF08316E)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        trip.driverNote!,
                        style: const TextStyle(fontSize: 12, color: Color(0xFF08316E), fontStyle: FontStyle.italic),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const Divider(height: 20, color: Color(0x12000000)),
            _SectionTitle(
              icon: Icons.tune,
              iconColor: const Color(0xFF0098c8),
              title: 'Préférences',
            ),
            const SizedBox(height: 8),
            _PreferencesGrid(trip: trip),
          ],
        ),
        const SizedBox(height: 12),
        // ── Statut + Véhicule + Tarification ────────────────────────────
        _InfoCard(
          children: [
            _SectionTitle(icon: Icons.circle, iconColor: const Color(0xFF0aad6a), title: 'Statut du trajet'),
            const SizedBox(height: 8),
            _StatusBadge(status: trip.status),
            const SizedBox(height: 8),
            _DataRow(label: 'Type de départ', value: trip.tripType == 'recurrent' ? 'Récurrent' : 'Unique'),
            _DataRow(label: 'Paiement', value: trip.paymentMethod == 'cash' ? 'Argent comptant' : 'Virement Interac'),
            _DataRow(label: 'Places', value: '${trip.maxPassengers - trip.currentPassengers} / ${trip.maxPassengers} dispo.'),
            const Divider(height: 20, color: Color(0x12000000)),
            _SectionTitle(icon: Icons.directions_car, iconColor: const Color(0xFFBA7517), title: 'Véhicule'),
            const SizedBox(height: 8),
            if (trip.vehicle != null) ...[
              _DataRow(label: 'Modèle', value: trip.vehicle!.displayLabel),
              _DataRow(label: 'Couleur', value: trip.vehicle!.color),
              _DataRow(label: 'Plaque', value: trip.vehicle!.licensePlate, isMono: true),
            ] else
              const Text('Véhicule non disponible', style: TextStyle(fontSize: 12, color: Color(0xFF7A879A))),
            const Divider(height: 20, color: Color(0x12000000)),
            _SectionTitle(icon: Icons.attach_money, iconColor: const Color(0xFF08316E), title: 'Tarification'),
            const SizedBox(height: 8),
            _DataRow(
              label: isDriver ? 'Prix par passager' : 'Votre prix',
              value: '${(isDriver ? trip.pricePerPassenger : trip.passengerPrice).toStringAsFixed(2)} \$',
              valueColor: const Color(0xFF0aad6a),
              isBold: true,
            ),
            if (trip.co2SavedKg != null)
              _DataRow(
                label: 'CO₂ économisé',
                value: '~${trip.co2SavedKg!.toStringAsFixed(1)} kg',
                valueColor: const Color(0xFF0aad6a),
              ),
          ],
        ),
        // ── Passagers (conducteur seulement) ────────────────────────────
        if (isDriver && passengers.isNotEmpty) ...[
          const SizedBox(height: 12),
          _PassengersCard(passengers: passengers),
        ],
      ],
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.children});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x12000000)),
        boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 8, offset: Offset(0, 2))],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.icon, required this.iconColor, required this.title});
  final IconData icon;
  final Color iconColor;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: iconColor, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          title.toUpperCase(),
          style: const TextStyle(
            fontFamily: 'Sora', fontWeight: FontWeight.w700, fontSize: 10,
            color: Color(0xFF08316E), letterSpacing: 0.6,
          ),
        ),
      ],
    );
  }
}

class _RoutePoint extends StatelessWidget {
  const _RoutePoint({
    required this.label,
    required this.name,
    required this.address,
    required this.color,
    required this.hasLine,
  });

  final String label;
  final String name;
  final String address;
  final Color color;
  final bool hasLine;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 10,
              height: 10,
              margin: const EdgeInsets.only(top: 4),
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            if (hasLine)
              Container(width: 1.5, height: 20, color: const Color(0x20000000)),
          ],
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$label — $name',
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF0D1624)),
              ),
              Text(
                address,
                style: const TextStyle(fontSize: 11, color: Color(0xFF7A879A)),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PreferencesGrid extends StatelessWidget {
  const _PreferencesGrid({required this.trip});
  final TrajetResponseDto trip;

  @override
  Widget build(BuildContext context) {
    final prefs = [
      (trip.baggageAllowed, Icons.luggage_outlined, 'Bagages'),
      (!trip.smokingAllowed, Icons.smoke_free, 'Non-fumeur'),
      (trip.petsAllowed, Icons.pets_outlined, 'Animaux'),
      (trip.musicAllowed, Icons.music_note_outlined, 'Musique'),
    ];
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: prefs.map((p) {
        final bool ok = p.$1;
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: ok ? const Color(0xFFE1F5EE) : const Color(0xFFFCEBEB),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: ok ? const Color(0x400F6E56) : const Color(0x40E24B4A),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(ok ? Icons.check_circle : Icons.cancel, size: 13, color: ok ? const Color(0xFF0F6E56) : const Color(0xFFE24B4A)),
              const SizedBox(width: 5),
              Text(p.$3, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: ok ? const Color(0xFF0F6E56) : const Color(0xFFE24B4A))),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) {
    final bool inProgress = status.toLowerCase().contains('progress') || status.toLowerCase().contains('cours');
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFFE1F5EE),
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
          const SizedBox(width: 5),
          Text(
            inProgress ? 'En cours…' : status,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF0aad6a)),
          ),
        ],
      ),
    );
  }
}

class _DataRow extends StatelessWidget {
  const _DataRow({
    required this.label,
    required this.value,
    this.valueColor,
    this.isBold = false,
    this.isMono = false,
  });

  final String label;
  final String value;
  final Color? valueColor;
  final bool isBold;
  final bool isMono;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF7A879A))),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isBold ? FontWeight.w700 : FontWeight.w600,
                color: valueColor ?? const Color(0xFF0D1624),
                fontFamily: isMono ? 'monospace' : null,
              ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}

class _PassengersCard extends StatelessWidget {
  const _PassengersCard({required this.passengers});
  final List<TrajetPassengerDto> passengers;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x12000000)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFF0098c8), shape: BoxShape.circle)),
              const SizedBox(width: 6),
              Text(
                'PASSAGERS À BORD (${passengers.length})'.toUpperCase(),
                style: const TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w700, fontSize: 10, color: Color(0xFF08316E), letterSpacing: 0.6),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...passengers.map((p) => _PassengerTile(passenger: p)),
        ],
      ),
    );
  }
}

class _PassengerTile extends StatelessWidget {
  const _PassengerTile({required this.passenger});
  final TrajetPassengerDto passenger;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: const Color(0xFFE8F0FE),
            child: Text(
              passenger.initials,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: Color(0xFF08316E)),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(passenger.fullName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                Text(
                  'Réservation ${passenger.reservationStatus}',
                  style: const TextStyle(fontSize: 10, color: Color(0xFF7A879A)),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFFE1F5EE),
              borderRadius: BorderRadius.circular(5),
            ),
            child: const Text('À bord', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF0aad6a))),
          ),
        ],
      ),
    );
  }
}
