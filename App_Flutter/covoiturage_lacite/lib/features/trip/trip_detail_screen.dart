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
    this.initialData,
    this.viewerRole = TripViewerRole.passenger,
  }) : assert(trip != null || tripId != null || initialData != null, 'Provide trip, tripId or initialData');

  final TripService tripService;
  final Trip? trip;
  final String? tripId;
  final Map<String, dynamic>? initialData;
  final TripViewerRole viewerRole;

  @override
  State<TripDetailScreen> createState() => _TripDetailScreenState();
}

class _TripDetailScreenState extends State<TripDetailScreen> {
  Trip? _trip;
  Map<String, dynamic>? _tripRaw;
  bool _isLoading = true;
  bool _isReserving = false;
  bool _showCancelConfirm = false;
  String? _errorMsg;

  @override
  void initState() {
    super.initState();
    if (widget.initialData != null) {
      _tripRaw = Map<String, dynamic>.from(widget.initialData!);
      try {
        _trip = Trip.fromJson(_tripRaw!);
        _isLoading = false;
      } catch (_) {
        _trip = null;
      }
    }
    if (widget.trip != null) {
      _trip = widget.trip;
      _isLoading = false;
    }
    if (widget.tripId != null && widget.tripId!.isNotEmpty) {
      _loadTrip(showLoader: _trip == null);
    }
  }

  Future<void> _loadTrip({bool showLoader = true}) async {
    if (widget.tripId == null || widget.tripId!.isEmpty) return;
    if (showLoader) {
      setState(() {
        _isLoading = true;
        _errorMsg = null;
      });
    }
    try {
      final raw = await widget.tripService.getTripPayloadById(widget.tripId!);
      final t = Trip.fromJson(raw);
      if (!mounted) return;
      setState(() {
        _tripRaw = raw;
        _trip = t;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _errorMsg = 'Impossible de charger le trajet.';
        _isLoading = false;
      });
    }
  }

  Future<void> _reserve() async {
    if (_trip == null || _isReserving) return;
    setState(() => _isReserving = true);
    try {
      await widget.tripService.createReservation(tripId: _trip!.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Reservation envoyee !'),
        backgroundColor: Color(0xFF0F6E56),
      ));
      context.push('/reservations');
    } catch (e) {
      _showError('Erreur : $e');
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
              ? _ErrorView(message: _errorMsg!, onRetry: () => _loadTrip())
              : _TripView(
                  trip: _trip!,
                  tripRaw: _tripRaw,
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
  const _TripView({required this.trip, required this.tripRaw, required this.viewerRole, required this.isReserving,
      required this.showCancelConfirm, required this.onReserve, required this.onShowCancel,
      required this.onDismissCancel, required this.onConfirmCancel});
  final Trip trip;
  final Map<String, dynamic>? tripRaw;
  final TripViewerRole viewerRole;
  final bool isReserving, showCancelConfirm;
  final VoidCallback onReserve, onShowCancel, onDismissCancel, onConfirmCancel;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _MapHero(trip: trip, tripRaw: tripRaw)),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                child: Transform.translate(
                  offset: const Offset(0, -24),
                  child: _SummaryCard(
                    trip: trip, viewerRole: viewerRole, isReserving: isReserving,
                    onReserve: onReserve, onCancel: onShowCancel,
                    tripId: trip.id,
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
                    Expanded(child: _PointCard(label: 'Départ', trip: trip, tripRaw: tripRaw, isDeparture: true)),
                    const SizedBox(width: 10),
                    Expanded(child: _PointCard(label: 'Arrivée', trip: trip, tripRaw: tripRaw, isDeparture: false)),
                  ]),
                  const SizedBox(height: 10),
                  Row(children: [
                    Expanded(child: _PreferencesCard(trip: trip)),
                    const SizedBox(width: 10),
                    Expanded(child: _StatusCard(trip: trip, tripRaw: tripRaw)),
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
  const _MapHero({required this.trip, required this.tripRaw});
  final Trip trip;
  final Map<String, dynamic>? tripRaw;

  @override
  Widget build(BuildContext context) {
    final List<Offset> points = _extractPolylinePoints(tripRaw);
    final String eta = _etaLabel(trip, tripRaw);
    final String distance = _distanceLabel(trip, tripRaw);
    return Container(
      height: 200, color: const Color(0xFF08316e),
      child: Stack(children: [
        if (points.isNotEmpty)
          Positioned.fill(
            child: CustomPaint(
              painter: _PolylineBackgroundPainter(points),
            ),
          )
        else
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
            Text(eta,
                style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
            Text(distance,
                style: const TextStyle(color: Colors.white70, fontSize: 12)),
          ]),
        ),
      ]),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.trip, required this.viewerRole, required this.isReserving,
      required this.onReserve, required this.onCancel, required this.tripId});
  final Trip trip;
  final TripViewerRole viewerRole;
  final bool isReserving;
  final String tripId;
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
            if (viewerRole == TripViewerRole.passenger)
              TextButton.icon(
                onPressed: () => context.push('/chat/$tripId'),
                icon: const Icon(Icons.chat_bubble_outline, size: 16),
                label: const Text('Message'),
                style: TextButton.styleFrom(foregroundColor: const Color(0xFF0F6E56)),
              ),
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
  const _PointCard({required this.label, required this.trip, required this.tripRaw, required this.isDeparture});
  final String label;
  final Trip trip;
  final Map<String, dynamic>? tripRaw;
  final bool isDeparture;

  @override
  Widget build(BuildContext context) {
    final dotColor = isDeparture ? const Color(0xFF08316e) : const Color(0xFFe04a2f);
    final address = isDeparture
        ? _departureLabel(trip, tripRaw)
        : _arrivalLabel(trip, tripRaw);
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
  const _StatusCard({required this.trip, required this.tripRaw});
  final Trip trip;
  final Map<String, dynamic>? tripRaw;

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
          _InfoRow('ETA', _etaLabel(trip, tripRaw)),
          if (_driverNote(trip, tripRaw).isNotEmpty) _InfoRow('Mot', _driverNote(trip, tripRaw)),
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
        Expanded(
          child: Text(value, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
        ),
      ]),
    );
  }
}

String _departureLabel(Trip trip, Map<String, dynamic>? raw) {
  final departure = _asMap(raw?['departure']);
  return _firstText(<dynamic>[
    raw?['departureLabel'],
    departure?['label'],
    departure?['address'],
    raw?['fromLabel'],
    raw?['from'],
    trip.departureLabel,
  ], fallback: '—');
}

String _arrivalLabel(Trip trip, Map<String, dynamic>? raw) {
  final arrival = _asMap(raw?['arrival']);
  return _firstText(<dynamic>[
    raw?['arrivalLabel'],
    arrival?['label'],
    arrival?['address'],
    raw?['toLabel'],
    raw?['to'],
    trip.arrivalLabel,
  ], fallback: '—');
}

String _driverNote(Trip trip, Map<String, dynamic>? raw) {
  final prefs = _asMap(raw?['preferences']);
  return _firstText(<dynamic>[
    raw?['driverNote'],
    prefs?['driverNote'],
    raw?['message'],
    raw?['note'],
    trip.driverNote,
  ], fallback: '');
}

String _etaLabel(Trip trip, Map<String, dynamic>? raw) {
  final eta = _asMap(raw?['eta']);
  final int minutes = _firstInt(<dynamic>[
    raw?['etaMinutes'],
    raw?['estimatedDurationMin'],
    raw?['estimatedDuration'],
    eta?['minutes'],
    trip.estimatedDurationMin,
  ]);
  if (minutes > 0) return '$minutes min';
  final String etaTime = _firstText(<dynamic>[
    raw?['eta'],
    raw?['arrivalTime'],
    trip.arrivalTime,
  ]);
  return etaTime.isNotEmpty ? etaTime : '—';
}

String _distanceLabel(Trip trip, Map<String, dynamic>? raw) {
  final distance = _asMap(raw?['distance']);
  final double km = _firstDouble(<dynamic>[
    raw?['estimatedDistanceKm'],
    raw?['estimatedDistance'],
    distance?['km'],
    trip.estimatedDistanceKm,
  ]);
  if (km > 0) return '${km.toStringAsFixed(1)} km';
  return '—';
}

String _firstText(List<dynamic> values, {String fallback = ''}) {
  for (final dynamic v in values) {
    final String s = v?.toString().trim() ?? '';
    if (s.isNotEmpty) return s;
  }
  return fallback;
}

int _firstInt(List<dynamic> values) {
  for (final dynamic v in values) {
    if (v is int) return v;
    if (v is num) return v.toInt();
    final parsed = int.tryParse(v?.toString() ?? '');
    if (parsed != null) return parsed;
  }
  return 0;
}

double _firstDouble(List<dynamic> values) {
  for (final dynamic v in values) {
    if (v is double) return v;
    if (v is num) return v.toDouble();
    final parsed = double.tryParse(v?.toString() ?? '');
    if (parsed != null) return parsed;
  }
  return 0;
}

List<Offset> _extractPolylinePoints(Map<String, dynamic>? raw) {
  final route = _asMap(raw?['route']);
  final dynamic source = raw?['polyline'] ??
      raw?['routePolyline'] ??
      raw?['overviewPolyline'] ??
      raw?['geometry'] ??
      route?['polyline'] ??
      route?['coordinates'];
  final List<dynamic> rows = source is List<dynamic>
      ? source
      : source is Map<String, dynamic>
          ? (source['coordinates'] as List<dynamic>? ?? <dynamic>[])
          : <dynamic>[];
  final List<Offset> points = <Offset>[];
  for (final dynamic row in rows) {
    if (row is List && row.length >= 2) {
      final lat = _firstDouble(<dynamic>[row[0]]);
      final lng = _firstDouble(<dynamic>[row[1]]);
      points.add(Offset(lng, lat));
    } else if (row is Map<String, dynamic>) {
      final lat = _firstDouble(<dynamic>[row['lat'], row['latitude']]);
      final lng = _firstDouble(<dynamic>[row['lng'], row['lon'], row['longitude']]);
      points.add(Offset(lng, lat));
    }
  }
  return points.length >= 2 ? points : <Offset>[];
}

Map<String, dynamic>? _asMap(dynamic v) {
  return v is Map<String, dynamic> ? v : null;
}

class _PolylineBackgroundPainter extends CustomPainter {
  const _PolylineBackgroundPainter(this.points);
  final List<Offset> points;

  @override
  void paint(Canvas canvas, Size size) {
    final bg = Paint()..color = const Color(0xFF0D3E87);
    canvas.drawRect(Offset.zero & size, bg);
    if (points.length < 2) return;
    final minX = points.map((p) => p.dx).reduce((a, b) => a < b ? a : b);
    final maxX = points.map((p) => p.dx).reduce((a, b) => a > b ? a : b);
    final minY = points.map((p) => p.dy).reduce((a, b) => a < b ? a : b);
    final maxY = points.map((p) => p.dy).reduce((a, b) => a > b ? a : b);
    final spanX = (maxX - minX).abs() < 0.000001 ? 1.0 : (maxX - minX);
    final spanY = (maxY - minY).abs() < 0.000001 ? 1.0 : (maxY - minY);

    Offset normalize(Offset p) {
      final x = ((p.dx - minX) / spanX) * (size.width - 40) + 20;
      final y = ((p.dy - minY) / spanY) * (size.height - 70) + 35;
      return Offset(x, y);
    }

    final Path path = Path()..moveTo(normalize(points.first).dx, normalize(points.first).dy);
    for (int i = 1; i < points.length; i++) {
      final p = normalize(points[i]);
      path.lineTo(p.dx, p.dy);
    }
    canvas.drawPath(
      path,
      Paint()
        ..color = Colors.white70
        ..strokeWidth = 4
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(covariant _PolylineBackgroundPainter oldDelegate) {
    return oldDelegate.points != points;
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

