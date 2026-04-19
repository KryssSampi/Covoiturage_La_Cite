import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/services/api_service.dart';
import '../../core/utils/parsing.dart' as parsing;

class PlannerScreen extends StatefulWidget {
  const PlannerScreen({super.key});

  @override
  State<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends State<PlannerScreen> {
  final ApiService _api = ApiService.instance;
  bool _isLoading = true;
  String? _error;
  List<_DriverTrip> _trips = <_DriverTrip>[];
  final Set<String> _busyReservationIds = <String>{};

  @override
  void initState() {
    super.initState();
    _loadTrips();
  }

  Future<void> _loadTrips() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final dynamic payload = await _api.get('/api/trips/mine/driver');
      final List<dynamic> rows = _extractList(payload);
      final List<_DriverTrip> trips = rows
          .whereType<Map<String, dynamic>>()
          .map(_DriverTrip.fromJson)
          .toList();
      if (!mounted) return;
      setState(() {
        _trips = trips;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _handleReservationAction({
    required String reservationId,
    required bool accept,
  }) async {
    setState(() {
      _busyReservationIds.add(reservationId);
    });
    try {
      await _api.post(
        '/api/reservations/$reservationId/${accept ? 'accept' : 'refuse'}',
        <String, dynamic>{},
      );
      if (!mounted) return;
      await _loadTrips();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(accept ? 'Passager accepte.' : 'Demande refusee.'),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Action impossible: $e')),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _busyReservationIds.remove(reservationId);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Planner'),
        actions: <Widget>[
          IconButton(
            onPressed: _isLoading ? null : _loadTrips,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadTrips,
        child: _buildBody(context),
      ),
    );
  }

  Widget _buildBody(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          Text('Erreur de chargement: $_error'),
          const SizedBox(height: 8),
          FilledButton(onPressed: _loadTrips, child: const Text('Reessayer')),
        ],
      );
    }
    if (_trips.isEmpty) {
      return ListView(
        children: const <Widget>[
          SizedBox(height: 120),
          Center(child: Text('Aucun trajet conducteur.')),
        ],
      );
    }

    return ListView.separated(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(12),
      itemCount: _trips.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (BuildContext context, int index) {
        final _DriverTrip trip = _trips[index];
        final bool chatEnabled = DateTime.now().isAfter(
          trip.departureTime.subtract(const Duration(hours: 2)),
        );
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Expanded(
                      child: Text(
                        '${trip.departureLabel} -> ${trip.arrivalLabel}',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                    Chip(label: Text(trip.status)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${_fmtDateTime(trip.departureTime)} - ${trip.availableSeats} places - ${trip.pricePerSeat.toStringAsFixed(2)}',
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: <Widget>[
                    OutlinedButton.icon(
                      onPressed: chatEnabled ? () => context.push('/chat/${trip.id}') : null,
                      icon: const Icon(Icons.chat_bubble_outline),
                      label: const Text('Chat'),
                    ),
                    if (!chatEnabled)
                      const Text('Chat dispo 2h avant le depart', style: TextStyle(fontSize: 12)),
                  ],
                ),
                const Divider(height: 24),
                Text(
                  'Demandes de reservation',
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                const SizedBox(height: 8),
                if (trip.pendingReservations.isEmpty)
                  const Text('Aucune demande en attente.')
                else
                  Column(
                    children: trip.pendingReservations.map((reservation) {
                      final bool busy = _busyReservationIds.contains(reservation.id);
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              reservation.passengerName,
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 4),
                            Text('Places: ${reservation.seats}'),
                            const SizedBox(height: 8),
                            Row(
                              children: <Widget>[
                                Expanded(
                                  child: FilledButton(
                                    onPressed: busy
                                        ? null
                                        : () => _handleReservationAction(
                                              reservationId: reservation.id,
                                              accept: true,
                                            ),
                                    child: const Text('Accepter'),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: busy
                                        ? null
                                        : () => _handleReservationAction(
                                              reservationId: reservation.id,
                                              accept: false,
                                            ),
                                    child: const Text('Refuser'),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _DriverTrip {
  _DriverTrip({
    required this.id,
    required this.departureLabel,
    required this.arrivalLabel,
    required this.departureTime,
    required this.availableSeats,
    required this.pricePerSeat,
    required this.status,
    required this.pendingReservations,
  });

  final String id;
  final String departureLabel;
  final String arrivalLabel;
  final DateTime departureTime;
  final int availableSeats;
  final double pricePerSeat;
  final String status;
  final List<_ReservationRequest> pendingReservations;

  factory _DriverTrip.fromJson(Map<String, dynamic> json) {
    final List<dynamic> rawReservations = _extractList(
      json['reservationRequests'] ?? json['reservations'],
    );
    final List<_ReservationRequest> reservations = rawReservations
        .whereType<Map<String, dynamic>>()
        .map(_ReservationRequest.fromJson)
        .where((r) => r.status.toLowerCase().contains('pending'))
        .toList();
    return _DriverTrip(
      id: json['id']?.toString() ?? '',
      departureLabel: _stringFromMany(
        json,
        <String>['departureLabel', 'fromLabel', 'departureCity', 'from'],
      ),
      arrivalLabel: _stringFromMany(
        json,
        <String>['arrivalLabel', 'toLabel', 'arrivalCity', 'to'],
      ),
      departureTime: _toDateTime(
            json['departureTime'] ?? json['departureDateTime'] ?? json['startTime'],
          ) ??
          DateTime.now(),
      availableSeats: _toInt(json['availableSeats'] ?? json['seatsAvailable']),
      pricePerSeat: _toDouble(json['pricePerSeat'] ?? json['price']),
      status: json['status']?.toString() ?? 'unknown',
      pendingReservations: reservations,
    );
  }
}

class _ReservationRequest {
  _ReservationRequest({
    required this.id,
    required this.passengerName,
    required this.seats,
    required this.status,
  });

  final String id;
  final String passengerName;
  final int seats;
  final String status;

  factory _ReservationRequest.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic>? passenger =
        json['passenger'] is Map<String, dynamic> ? json['passenger'] as Map<String, dynamic> : null;
    final String firstName = passenger?['firstName']?.toString() ?? '';
    final String lastName = passenger?['lastName']?.toString() ?? '';
    final String fullName = '$firstName $lastName'.trim();
    return _ReservationRequest(
      id: json['id']?.toString() ?? '',
      passengerName: fullName.isEmpty ? (json['passengerName']?.toString() ?? 'Passager') : fullName,
      seats: _toInt(json['seats'] ?? json['requestedSeats'] ?? 1),
      status: json['status']?.toString() ?? '',
    );
  }
}

List<dynamic> _extractList(dynamic payload) => parsing.extractList(payload);

String _fmtDateTime(DateTime dt) {
  String two(int v) => v < 10 ? '0$v' : '$v';
  return '${dt.year}-${two(dt.month)}-${two(dt.day)} ${two(dt.hour)}:${two(dt.minute)}';
}

DateTime? _toDateTime(dynamic value) => parsing.toDateTime(value);

int _toInt(dynamic value) => parsing.toInt(value);

double _toDouble(dynamic value) => parsing.toDouble(value);

String _stringFromMany(Map<String, dynamic> json, List<String> keys) {
  for (final String key in keys) {
    final dynamic v = json[key];
    if (v != null && v.toString().trim().isNotEmpty) {
      return v.toString().trim();
    }
  }
  return '';
}

