import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/services/api_service.dart';
import '../../core/services/trip_service.dart';
import '../../core/state/app_state.dart';
import '../../core/utils/parsing.dart' as parsing;
import '../../shared/cards/reservation_card.dart';
import '../../shared/widgets/item_list_view.dart';

class ReservationScreen extends StatefulWidget {
  const ReservationScreen({
    super.key,
    required this.tripService,
    this.isDriver = false,
    this.embedded = false,
  });

  final TripService tripService;
  final bool isDriver;
  final bool embedded;

  @override
  State<ReservationScreen> createState() => _ReservationScreenState();
}

class _ReservationScreenState extends State<ReservationScreen> {
  final ApiService _api = ApiService.instance;

  bool _isLoading = true;
  String? _error;
  String _query = '';
  final List<_ReservationVm> _items = <_ReservationVm>[];

  List<_ReservationVm> get _filteredItems {
    if (_query.trim().isEmpty) return _items;
    final String q = _query.toLowerCase();
    return _items.where((item) {
      return item.departure.toLowerCase().contains(q) ||
          item.destination.toLowerCase().contains(q) ||
          item.personName.toLowerCase().contains(q);
    }).toList();
  }

  @override
  void initState() {
    super.initState();
    AppStateStore.instance.clearPageNews(AppNavPage.reservations);
    _loadReservations();
  }

  Future<void> _loadReservations() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final List<_ReservationVm> loaded = widget.isDriver
          ? await _loadDriverRequests()
          : await _loadPassengerReservations();

      if (!mounted) return;
      setState(() {
        _items
          ..clear()
          ..addAll(loaded);
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

  Future<List<_ReservationVm>> _loadDriverRequests() async {
    final dynamic payload = await _api.get('/api/driver/reservation-requests');
    final Iterable<Map<String, dynamic>> rows =
        parsing.extractList(payload).whereType<Map<String, dynamic>>();

    return rows
        .map((row) => _ReservationVm.fromDriverRequest(row))
        .where((item) => item.id.isNotEmpty)
        .toList();
  }

  Future<List<_ReservationVm>> _loadPassengerReservations() async {
    final dynamic enrichedPayload =
        await _api.get('/api/passenger/reservations-enriched');
    List<_ReservationVm> rows = parsing
        .extractList(enrichedPayload)
        .whereType<Map<String, dynamic>>()
        .map((row) => _ReservationVm.fromPassengerReservation(row))
        .where((item) => item.id.isNotEmpty)
        .toList();

    if (rows.isNotEmpty) {
      return rows;
    }

    final dynamic legacyPayload = await _api.get('/api/reservations');
    rows = parsing
        .extractList(legacyPayload)
        .whereType<Map<String, dynamic>>()
        .map((row) => _ReservationVm.fromLegacyPassengerReservation(row))
        .where((item) => item.id.isNotEmpty)
        .toList();
    return rows;
  }

  Future<void> _cancelReservation(_ReservationVm item) async {
    final bool? confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Annuler la reservation'),
          content: const Text(
            'Voulez-vous vraiment annuler cette reservation ?',
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Non'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Oui'),
            ),
          ],
        );
      },
    );

    if (confirmed != true) return;

    try {
      await _api.post('/api/reservations/${item.id}/cancel', <String, dynamic>{});
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Reservation annulee.')),
      );
      _loadReservations();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Annulation impossible: $e')),
      );
    }
  }

  void _openReservation(_ReservationVm item) {
    if (item.isDriverRequest) {
      context.push('/reservation-request/${item.id}');
      return;
    }
    if (item.tripId.isEmpty) return;
    context.push('/trip/${item.tripId}', extra: item.tripData);
  }

  bool _canCancel(_ReservationVm item) {
    final String s = item.status.toLowerCase();
    return s.contains('pending') ||
        s.contains('attente') ||
        s.contains('confirm') ||
        s.contains('accepted');
  }

  @override
  Widget build(BuildContext context) {
    final Widget content = ColoredBox(
      color: const Color(0xFFF2F5FA),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: widget.embedded
                ? Text(
                    widget.isDriver ? 'Demandes de reservation' : 'Mes reservations',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
                  )
                : Row(
                    children: [
                      IconButton(
                        iconSize: 28,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => context.pop(),
                        icon: const Icon(Icons.arrow_back_ios_new),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          widget.isDriver ? 'Demandes de reservation' : 'Mes reservations',
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ],
                  ),
          ),
          Expanded(
            child: ItemListView<_ReservationVm>(
              items: _items,
              filteredItems: _filteredItems,
              isLoading: _isLoading,
              error: _error,
              onRefresh: _loadReservations,
              onSearch: (String value) {
                setState(() {
                  _query = value;
                });
              },
              searchHint: widget.isDriver
                  ? 'Rechercher une demande...'
                  : 'Rechercher une reservation...',
              emptyTitle: widget.isDriver
                  ? 'Aucune demande de reservation'
                  : 'Aucune reservation',
              emptySubtitle: widget.isDriver
                  ? 'Les nouvelles demandes apparaitront ici.'
                  : 'Vos reservations apparaitront ici.',
              emptyIcon: widget.isDriver
                  ? Icons.assignment_turned_in_outlined
                  : Icons.event_note_rounded,
              itemBuilder: (_ReservationVm item) {
                final ReservationData data = ReservationData(
                  id: item.id,
                  departure: item.departure,
                  destination: item.destination,
                  date: item.date,
                  time: item.time,
                  status: item.status,
                  role: item.isDriverRequest
                      ? ReservationRole.driver
                      : ReservationRole.passenger,
                  personName: item.personName,
                  personInitials: item.personInitials,
                  personRating: item.personRating,
                  price: item.price,
                  seatsInfo: item.seatsInfo,
                  tripId: item.tripId,
                );
                return ReservationCard(
                  data: data,
                  onTap: () => _openReservation(item),
                  onViewDetails: item.isDriverRequest
                      ? null
                      : () => _openReservation(item),
                  onCancel: item.isDriverRequest || !_canCancel(item)
                      ? null
                      : () => _cancelReservation(item),
                );
              },
            ),
          ),
        ],
      ),
    );

    if (widget.embedded) return content;

    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      body: SafeArea(child: content),
    );
  }
}

class _ReservationVm {
  const _ReservationVm({
    required this.id,
    required this.tripId,
    required this.departure,
    required this.destination,
    required this.date,
    required this.time,
    required this.personName,
    required this.personInitials,
    required this.personRating,
    required this.status,
    required this.isDriverRequest,
    required this.tripData,
    this.price,
    this.seatsInfo,
  });

  final String id;
  final String tripId;
  final String departure;
  final String destination;
  final String date;
  final String time;
  final String personName;
  final String personInitials;
  final double? personRating;
  final String status;
  final bool isDriverRequest;
  final Map<String, dynamic> tripData;
  final double? price;
  final String? seatsInfo;

  factory _ReservationVm.fromPassengerReservation(Map<String, dynamic> row) {
    final Map<String, dynamic> reservation = _asMap(row['reservation']);
    final Map<String, dynamic> trip = _asMap(row['trip']);
    final Map<String, dynamic> driver = _asMap(row['driver']);
    final DateTime? departureDt = _parseDepartureDateTime(trip);

    final String driverName = _fullName(
      firstName: driver['firstName']?.toString(),
      lastName: driver['lastName']?.toString(),
      fallback: 'Conducteur',
    );

    final String id =
        reservation['id']?.toString() ?? row['id']?.toString() ?? '';
    final String tripId =
        trip['id']?.toString() ?? reservation['tripId']?.toString() ?? '';

    return _ReservationVm(
      id: id,
      tripId: tripId,
      departure: _firstNotEmpty(<dynamic>[
        trip['departureLabel'],
        row['departureLabel'],
      ]),
      destination: _firstNotEmpty(<dynamic>[
        trip['arrivalLabel'],
        row['arrivalLabel'],
      ]),
      date: _fmtDate(departureDt),
      time: _fmtTime(departureDt),
      personName: driverName,
      personInitials: _initials(driverName),
      personRating: _toDoubleOrNull(driver['averageRating']),
      status: reservation['status']?.toString() ?? row['status']?.toString() ?? 'pending',
      isDriverRequest: false,
      price: _toDoubleOrNull(trip['pricePerPassenger']),
      seatsInfo: _seatsInfo(
        current: _toIntOrNull(trip['currentPassengers']),
        total: _toIntOrNull(trip['maxPassengers']),
      ),
      tripData: _buildTripExtra(
        trip,
        fallbackTripId: tripId,
        driver: driver,
        reservationRow: reservation,
      ),
    );
  }

  factory _ReservationVm.fromDriverRequest(Map<String, dynamic> row) {
    final Map<String, dynamic> reservation = _asMap(row['reservation']);
    final Map<String, dynamic> trip = _asMap(row['trip']);
    final Map<String, dynamic> passenger = _asMap(row['passenger']);
    final DateTime? departureDt = _parseDepartureDateTime(trip);

    final String passengerName = _fullName(
      firstName: passenger['firstName']?.toString(),
      lastName: passenger['lastName']?.toString(),
      fallback: 'Passager',
    );

    final String id =
        reservation['id']?.toString() ?? row['id']?.toString() ?? '';

    return _ReservationVm(
      id: id,
      tripId: trip['id']?.toString() ?? reservation['tripId']?.toString() ?? '',
      departure: _firstNotEmpty(<dynamic>[
        trip['departureLabel'],
        row['departureLabel'],
      ]),
      destination: _firstNotEmpty(<dynamic>[
        trip['arrivalLabel'],
        row['arrivalLabel'],
      ]),
      date: _fmtDate(departureDt),
      time: _fmtTime(departureDt),
      personName: passengerName,
      personInitials: _initials(passengerName),
      personRating: _toDoubleOrNull(passenger['averageRating']),
      status: reservation['status']?.toString() ?? row['status']?.toString() ?? 'pending',
      isDriverRequest: true,
      tripData: _buildTripExtra(
        trip,
        fallbackTripId: trip['id']?.toString(),
        driver: null,
        reservationRow: reservation,
      ),
    );
  }

  factory _ReservationVm.fromLegacyPassengerReservation(Map<String, dynamic> row) {
    final Map<String, dynamic> trip = _asMap(row['trip']);
    final Map<String, dynamic> driver = _asMap(row['driver']);
    final DateTime? departureDt = _parseDepartureDateTime(trip);

    final String driverName = _fullName(
      firstName: driver['firstName']?.toString(),
      lastName: driver['lastName']?.toString(),
      fallback: 'Conducteur',
    );

    return _ReservationVm(
      id: row['id']?.toString() ?? '',
      tripId: row['tripId']?.toString() ?? trip['id']?.toString() ?? '',
      departure: _firstNotEmpty(<dynamic>[
        trip['departureLabel'],
        trip['fromLabel'],
        trip['departureCity'],
      ]),
      destination: _firstNotEmpty(<dynamic>[
        trip['arrivalLabel'],
        trip['toLabel'],
        trip['arrivalCity'],
      ]),
      date: _fmtDate(departureDt),
      time: _fmtTime(departureDt),
      personName: driverName,
      personInitials: _initials(driverName),
      personRating: _toDoubleOrNull(driver['averageRating'] ?? driver['rating']),
      status: row['status']?.toString() ?? 'pending',
      isDriverRequest: false,
      price: _toDoubleOrNull(
        trip['passengerPrice'] ?? trip['pricePerPassenger'] ?? trip['price'],
      ),
      seatsInfo: _seatsInfo(
        current: _toIntOrNull(trip['currentPassengers']),
        total: _toIntOrNull(trip['maxPassengers'] ?? trip['totalSeats']),
      ),
      tripData: _buildTripExtra(
        trip,
        fallbackTripId: row['tripId']?.toString(),
        driver: driver,
        reservationRow: row,
      ),
    );
  }
}

Map<String, dynamic> _asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) {
    return value.map(
      (dynamic key, dynamic val) => MapEntry(key.toString(), val),
    );
  }
  return <String, dynamic>{};
}

DateTime? _parseDepartureDateTime(Map<String, dynamic> trip) {
  final dynamic explicit =
      trip['departureDateTime'] ?? trip['departureTime'] ?? trip['startTime'];
  DateTime? parsed = parsing.toDateTime(explicit);
  if (parsed != null) return parsed;

  final String date = trip['departureDate']?.toString() ?? '';
  final String time = trip['departureTime']?.toString() ?? '';
  if (date.isEmpty || time.isEmpty) return null;
  return parsing.toDateTime('${date}T$time');
}

String _fmtDate(DateTime? dt) {
  if (dt == null) return '-';
  String two(int value) => value < 10 ? '0$value' : '$value';
  return '${dt.year}-${two(dt.month)}-${two(dt.day)}';
}

String _fmtTime(DateTime? dt) {
  if (dt == null) return '--:--';
  String two(int value) => value < 10 ? '0$value' : '$value';
  return '${two(dt.hour)}:${two(dt.minute)}';
}

String _firstNotEmpty(List<dynamic> values) {
  for (final dynamic value in values) {
    final String text = value?.toString().trim() ?? '';
    if (text.isNotEmpty) return text;
  }
  return '';
}

String _fullName({
  required String? firstName,
  required String? lastName,
  required String fallback,
}) {
  final String name = '${firstName ?? ''} ${lastName ?? ''}'.trim();
  return name.isEmpty ? fallback : name;
}

String _initials(String value) {
  final List<String> tokens = value
      .split(' ')
      .where((String token) => token.trim().isNotEmpty)
      .toList();
  if (tokens.isEmpty) return 'U';
  return tokens.take(2).map((String token) => token[0].toUpperCase()).join();
}

double? _toDoubleOrNull(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString());
}

int? _toIntOrNull(dynamic value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value.toString());
}

String? _seatsInfo({required int? current, required int? total}) {
  if (current == null || total == null || total <= 0) return null;
  return '$current/$total places';
}

Map<String, dynamic> _buildTripExtra(
  Map<String, dynamic>? trip, {
  String? fallbackTripId,
  Map<String, dynamic>? driver,
  Map<String, dynamic>? reservationRow,
}) {
  final Map<String, dynamic> base =
      <String, dynamic>{...(trip ?? const <String, dynamic>{})};

  if ((base['id']?.toString().isNotEmpty ?? false) == false &&
      (fallbackTripId?.isNotEmpty ?? false)) {
    base['id'] = fallbackTripId;
  }

  if (driver != null && driver.isNotEmpty) {
    base['driver'] = <String, dynamic>{
      ...(_asMap(base['driver'])),
      ...driver,
    };
    base.putIfAbsent(
      'driverName',
      () => _fullName(
        firstName: driver['firstName']?.toString(),
        lastName: driver['lastName']?.toString(),
        fallback: 'Conducteur',
      ),
    );
  }

  if (reservationRow != null) {
    if (base['reservationStatus'] == null && reservationRow['status'] != null) {
      base['reservationStatus'] = reservationRow['status'];
    }
    if (base['driverNote'] == null) {
      base['driverNote'] =
          reservationRow['driverNote'] ?? reservationRow['message'];
    }
  }

  return base;
}

