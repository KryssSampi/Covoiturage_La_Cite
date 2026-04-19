import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/models/trip.dart';
import '../../core/services/trip_service.dart';

enum TripViewerRole { passenger, driverOwner, admin }

class TripDetailScreen extends StatefulWidget {
  const TripDetailScreen({
    super.key,
    required this.tripService,
    this.trip,
    this.tripId,
    this.viewerRole = TripViewerRole.passenger,
  }) : assert(trip != null || tripId != null, 'Provide trip or tripId');

  final TripService tripService;
  final Trip? trip;
  final String? tripId;
  final TripViewerRole viewerRole;

  @override
  State<TripDetailScreen> createState() => _TripDetailScreenState();
}

class _TripDetailScreenState extends State<TripDetailScreen> {
  Trip? _trip;
  bool _isLoading = true;
  bool _isReserving = false;
  bool _showCancelConfirm = false;
  String? _errorMsg;

  @override
  void initState() {
    super.initState();
    if (widget.trip != null) {
      _trip = widget.trip;
      _isLoading = false;
    } else {
      _loadTrip();
    }
  }

  Future<void> _loadTrip() async {
    try {
      final t = await widget.tripService.getTripById(widget.tripId!);
      setState(() { _trip = t; _isLoading = false; });
    } catch (_) {
      setState(() { _errorMsg = 'Impossible de charger le trajet.'; _isLoading = false; });
    }
  }

  Future<void> _reserve() async {
    if (_trip == null || _isReserving) return;
    setState(() => _isReserving = true);
    try {
      final result = await widget.tripService.createReservation(tripId: _trip!.id);
      if (!mounted) return;
      if (result.success) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Réservation envoyée ! Le conducteur vous répondra bientôt.'),
          backgroundColor: Color(0xFF16a34a),
        ));
        context.pop();
      } else {
        _showError('Réservation impossible : ${result.message ?? 'erreur inconnue'}');
      }
    } catch (_) {
      _showError('Erreur réseau. Réessayez.');
    } finally {
      if (mounted) setState(() => _isReserving = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F8),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF08316e)))
          : _errorMsg != null
              ? _ErrorView(message: _errorMsg!, onRetry: _loadTrip)
              : _TripView(
                  trip: _trip!,
                  viewerRole: widget.viewerRole,
                  isReserving: _isReserving,
                  showCancelConfirm: _showCancelConfirm,
                  onReserve: _reserve,
                  onShowCancel: () => setState(() => _showCancelConfirm = true),
                  onDismissCancel: () => setState(() => _showCancelConfirm = false),
                  onConfirmCancel: () { setState(() => _showCancelConfirm = false); context.pop(); },
                ),
    );
  }
}

class _TripView extends StatelessWidget {
  const _TripView({required this.trip, required this.viewerRole, required this.isReserving,
      required this.showCancelConfirm, required this.onReserve, required this.onShowCancel,
      required this.onDismissCancel, required this.onConfirmCancel});
  final Trip trip;
  final TripViewerRole viewerRole;
  final bool isReserving, showCancelConfirm;
  final VoidCallback onReserve, onShowCancel, onDismissCancel, onConfirmCancel;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _MapHero(trip: trip)),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                child: Transform.translate(
                  offset: const Offset(0, -24),
                  child: _SummaryCard(
                    trip: trip, viewerRole: viewerRole, isReserving: isReserving,
                    onReserve: onReserve, onCancel: onShowCancel,
                  ),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  _sectionTitle('Détails du trajet'),
                  const SizedBox(height: 10),
                  Row(children: [
                    Expanded(child: _PointCard(label: 'Départ', trip: trip, isDeparture: true)),
                    const SizedBox(width: 10),
                    Expanded(child: _PointCard(label: 'Arrivée', trip: trip, isDeparture: false)),
                  ]),
                  const SizedBox(height: 10),
                  Row(children: [
                    Expanded(child: _PreferencesCard(trip: trip)),
                    const SizedBox(width: 10),
                    Expanded(child: _StatusCard(trip: trip)),
                  ]),
                  const SizedBox(height: 80),
                ]),
              ),
            ),
          ],
        ),
        if (showCancelConfirm)
          _CancelConfirmDialog(
            isPassenger: viewerRole == TripViewerRole.passenger,
            onConfirm: onConfirmCancel,
            onDismiss: onDismissCancel,
          ),
      ],
    );
  }

  Widget _sectionTitle(String t) => Text(t,
      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF08316e)));
}

class _MapHero extends StatelessWidget {
  const _MapHero({required this.trip});
  final Trip trip;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200, color: const Color(0xFF08316e),
      child: Stack(children: [
        const Center(child: Icon(Icons.map_outlined, size: 60, color: Colors.white30)),
        Positioned(
          top: MediaQuery.of(context).padding.top + 8, left: 8,
          child: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.pop(),
          ),
        ),
        Positioned(
          bottom: 16, left: 0, right: 0,
          child: Column(children: [
            Text('${trip.estimatedDurationMin} min de trajet',
                style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
            Text('${trip.estimatedDistanceKm.toStringAsFixed(1)} km',
                style: const TextStyle(color: Colors.white70, fontSize: 12)),
          ]),
        ),
      ]),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.trip, required this.viewerRole, required this.isReserving,
      required this.onReserve, required this.onCancel});
  final Trip trip;
  final TripViewerRole viewerRole;
  final bool isReserving;
  final VoidCallback onReserve, onCancel;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            _DriverAvatar(name: trip.driverName, url: trip.driverAvatarUrl),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(trip.driverName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              Row(children: [
                const Icon(Icons.star, size: 12, color: Color(0xFFF59E0B)),
                Text(' ${trip.driverRating.toStringAsFixed(1)}',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF4b5563))),
                Text(' • ${trip.driverTripCount} trajets',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF9ca3af))),
              ]),
              Text(trip.vehicleModel, style: const TextStyle(fontSize: 11, color: Color(0xFF6b7280))),
            ])),
          ]),
          const Divider(height: 24),
          Row(children: [
            _MetaTile(label: 'Date', value: trip.departureDate),
            _MetaTile(label: 'Heure', value: trip.departureTime),
            _MetaTile(label: 'Durée', value: '${trip.estimatedDurationMin} min'),
            _MetaTile(label: 'Distance', value: '${trip.estimatedDistanceKm.toStringAsFixed(1)} km'),
          ]),
          const Divider(height: 24),
          Row(children: [
            _MetaTile(
              label: 'Prix',
              value: '${(viewerRole == TripViewerRole.driverOwner ? trip.pricePerSeat : trip.passengerPrice).toStringAsFixed(2)} \$',
              valueColor: const Color(0xFF16a34a), valueFontSize: 16,
            ),
            _MetaTile(label: 'Places', value: '${trip.availableSeats}/${trip.totalSeats}'),
            _MetaTile(label: 'Paiement', value: trip.paymentMethod == 'Cash' ? 'En espèces' : 'Interac'),
          ]),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity, height: 48,
            child: ElevatedButton(
              onPressed: (viewerRole == TripViewerRole.passenger && trip.availableSeats > 0 && !isReserving)
                  ? onReserve : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: trip.availableSeats <= 0 ? const Color(0xFF6b7280) : const Color(0xFF08316e),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: isReserving
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(_reserveLabel(viewerRole, trip),
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            ),
          ),
          if (viewerRole == TripViewerRole.passenger && trip.availableSeats > 0) ...[
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: onCancel,
                child: const Text('Annuler cette réservation',
                    style: TextStyle(color: Color(0xFFdc2626), fontSize: 12)),
              ),
            ),
          ],
        ]),
      ),
    );
  }

  String _reserveLabel(TripViewerRole role, Trip trip) {
    if (role == TripViewerRole.driverOwner) return 'Gérer les demandes';
    if (role == TripViewerRole.admin) return 'Vue administrateur';
    if (trip.availableSeats <= 0) return 'Trajet complet';
    return 'Réserver ce trajet';
  }
}

class _DriverAvatar extends StatelessWidget {
  const _DriverAvatar({required this.name, this.url});
  final String name;
  final String? url;

  @override
  Widget build(BuildContext context) {
    if (url != null && url!.isNotEmpty) {
      return CircleAvatar(radius: 26, backgroundImage: NetworkImage(url!));
    }
    return CircleAvatar(
      radius: 26, backgroundColor: const Color(0xFFE8F0FE),
      child: Text(name.isNotEmpty ? name[0].toUpperCase() : '?',
          style: const TextStyle(color: Color(0xFF1A56CC), fontWeight: FontWeight.w700, fontSize: 18)),
    );
  }
}

class _MetaTile extends StatelessWidget {
  const _MetaTile({required this.label, required this.value,
      this.valueColor = const Color(0xFF1f2937), this.valueFontSize = 12});
  final String label, value;
  final Color valueColor;
  final double valueFontSize;

  @override
  Widget build(BuildContext context) {
    return Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF9ca3af))),
      const SizedBox(height: 2),
      Text(value, style: TextStyle(fontSize: valueFontSize, fontWeight: FontWeight.w700, color: valueColor)),
    ]));
  }
}

class _PointCard extends StatelessWidget {
  const _PointCard({required this.label, required this.trip, required this.isDeparture});
  final String label;
  final Trip trip;
  final bool isDeparture;

  @override
  Widget build(BuildContext context) {
    final dotColor = isDeparture ? const Color(0xFF08316e) : const Color(0xFFe04a2f);
    final address = isDeparture ? trip.departureLabel : trip.arrivalLabel;
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(padding: const EdgeInsets.all(12), child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(width: 8, height: 8, decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle)),
            const SizedBox(width: 6),
            Text(label.toUpperCase(),
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF08316e), letterSpacing: 0.5)),
          ]),
          const SizedBox(height: 6),
          Text(address, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1f2937))),
        ],
      )),
    );
  }
}

class _PreferencesCard extends StatelessWidget {
  const _PreferencesCard({required this.trip});
  final Trip trip;

  @override
  Widget build(BuildContext context) {
    final prefs = [
      _Pref('Bagages', trip.baggageAllowed),
      _Pref('Animaux', trip.petsAllowed),
      _Pref('Fumeurs', trip.smokingAllowed),
      _Pref('Musique', trip.musicAllowed),
      _Pref('Flexible', trip.flexibleItinerary),
    ];
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(padding: const EdgeInsets.all(12), child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Préférences', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF08316e))),
          const SizedBox(height: 8),
          ...prefs.map((p) => Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(children: [
              Icon(p.allowed ? Icons.check_circle : Icons.cancel, size: 14,
                  color: p.allowed ? const Color(0xFF16a34a) : const Color(0xFF6b7280)),
              const SizedBox(width: 6),
              Text(p.label, style: const TextStyle(fontSize: 11, color: Color(0xFF4b5563))),
            ]),
          )),
        ],
      )),
    );
  }
}

class _Pref {
  const _Pref(this.label, this.allowed);
  final String label;
  final bool allowed;
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({required this.trip});
  final Trip trip;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(padding: const EdgeInsets.all(12), child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Informations', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF08316e))),
          const SizedBox(height: 8),
          _InfoRow('Type', trip.tripType),
          if (trip.isRecurrent) const _InfoRow('Récurrence', 'Oui'),
          if (trip.maxDetourMinutes != null) _InfoRow('Détour', '${trip.maxDetourMinutes} min max'),
        ],
      )),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow(this.label, this.value);
  final String label, value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(children: [
        SizedBox(width: 60, child: Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF6b7280)))),
        Text(value, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
      ]),
    );
  }
}

class _CancelConfirmDialog extends StatelessWidget {
  const _CancelConfirmDialog({required this.isPassenger, required this.onConfirm, required this.onDismiss});
  final bool isPassenger;
  final VoidCallback onConfirm, onDismiss;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onDismiss,
      child: Container(
        color: Colors.black54,
        child: Center(child: GestureDetector(
          onTap: () {},
          child: Card(
            margin: const EdgeInsets.symmetric(horizontal: 32),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisSize: MainAxisSize.min, children: [
              Text(isPassenger ? 'Annuler cette réservation' : 'Annuler ce trajet',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF08316e))),
              const SizedBox(height: 12),
              const Text('Êtes-vous sûr de vouloir annuler ?', textAlign: TextAlign.center),
              const SizedBox(height: 20),
              Row(children: [
                Expanded(child: OutlinedButton(onPressed: onDismiss, child: const Text('Non, garder'))),
                const SizedBox(width: 12),
                Expanded(child: ElevatedButton(
                  onPressed: onConfirm,
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFdc2626), foregroundColor: Colors.white),
                  child: const Text('Oui, annuler'),
                )),
              ]),
            ])),
          ),
        )),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
      const Icon(Icons.error_outline, size: 48, color: Color(0xFFdc2626)),
      const SizedBox(height: 12),
      Text(message, textAlign: TextAlign.center),
      const SizedBox(height: 20),
      ElevatedButton(onPressed: onRetry, child: const Text('Réessayer')),
    ]));
  }
}
