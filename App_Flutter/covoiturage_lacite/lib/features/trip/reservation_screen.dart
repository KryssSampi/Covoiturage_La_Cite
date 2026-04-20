import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/services/api_service.dart';
import '../../core/services/trip_service.dart';

class ReservationScreen extends StatefulWidget {
  const ReservationScreen({super.key, required this.tripService, this.isDriver = false});
  final TripService tripService;
  final bool isDriver;
  @override State<ReservationScreen> createState() => _ReservationScreenState();
}

class _ReservationScreenState extends State<ReservationScreen>
    with SingleTickerProviderStateMixin {
  final ApiService _api = ApiService.instance;
  late final TabController _tabCtrl;
  final _searchCtrl = TextEditingController();
  bool _isLoading = true;
  String? _error;
  String _query = '';

  final List<_ResItem> _items = <_ResItem>[];

  List<_ResItem> get _passenger => _items.where((r) => !r.isDriver && _match(r)).toList();
  List<_ResItem> get _driver => _items.where((r) => r.isDriver && _match(r)).toList();
  bool _match(_ResItem r) {
    if (_query.isEmpty) return true;
    final q = _query.toLowerCase();
    return r.departure.toLowerCase().contains(q) || r.destination.toLowerCase().contains(q);
  }

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: widget.isDriver ? 2 : 1, vsync: this);
    _searchCtrl.addListener(() => setState(() => _query = _searchCtrl.text));
    _loadReservations();
  }

  @override
  void dispose() { _tabCtrl.dispose(); _searchCtrl.dispose(); super.dispose(); }

  Future<void> _loadReservations() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final List<_ResItem> loaded = <_ResItem>[];

      final dynamic passengerPayload = await _api.get('/api/reservations');
      final List<dynamic> passengerRows = _extractList(passengerPayload);
      for (final dynamic row in passengerRows) {
        if (row is! Map<String, dynamic>) continue;
        final Map<String, dynamic>? trip =
            row['trip'] is Map<String, dynamic> ? row['trip'] as Map<String, dynamic> : null;
        final Map<String, dynamic>? driver =
            row['driver'] is Map<String, dynamic> ? row['driver'] as Map<String, dynamic> : null;
        final DateTime? departureTime =
            _toDateTime(trip?['departureTime'] ?? trip?['departureDateTime'] ?? trip?['startTime']);
        loaded.add(
          _ResItem(
            id: row['id']?.toString() ?? '',
            tripId: row['tripId']?.toString() ?? trip?['id']?.toString() ?? '',
            departure: _firstNotEmpty(<dynamic>[
              trip?['departureLabel'],
              trip?['fromLabel'],
              trip?['departureCity'],
              trip?['from'],
            ]),
            destination: _firstNotEmpty(<dynamic>[
              trip?['arrivalLabel'],
              trip?['toLabel'],
              trip?['arrivalCity'],
              trip?['to'],
            ]),
            date: _fmtDate(departureTime),
            time: _fmtTime(departureTime),
            personName: _fullName(
              firstName: driver?['firstName']?.toString(),
              lastName: driver?['lastName']?.toString(),
              fallback: 'Conducteur',
            ),
            personRole: 'Conducteur',
            rating: _toDouble(driver?['averageRating'] ?? driver?['rating']),
            statusLabel: row['status']?.toString() ?? 'Inconnu',
            statusColor: _statusColor(row['status']?.toString() ?? ''),
            isDriver: false,
            tripData: _buildTripExtra(
              trip,
              fallbackTripId: row['tripId']?.toString(),
              driver: driver,
              reservationRow: row,
            ),
          ),
        );
      }

      final dynamic driverPayload = await _api.get('/api/trips/mine/driver');
      final List<dynamic> trips = _extractList(driverPayload);
      for (final dynamic tripRow in trips) {
        if (tripRow is! Map<String, dynamic>) continue;
        final List<dynamic> reservations = _extractList(
          tripRow['reservationRequests'] ?? tripRow['reservations'],
        );
        final DateTime? departureTime = _toDateTime(
          tripRow['departureTime'] ?? tripRow['departureDateTime'] ?? tripRow['startTime'],
        );
        for (final dynamic reservationRow in reservations) {
          if (reservationRow is! Map<String, dynamic>) continue;
          final String status = reservationRow['status']?.toString() ?? '';
          if (!status.toLowerCase().contains('pending') &&
              !status.toLowerCase().contains('attente')) {
            continue;
          }
          final Map<String, dynamic>? passenger = reservationRow['passenger'] is Map<String, dynamic>
              ? reservationRow['passenger'] as Map<String, dynamic>
              : null;
          loaded.add(
            _ResItem(
              id: reservationRow['id']?.toString() ?? '',
              tripId: tripRow['id']?.toString() ?? '',
              departure: _firstNotEmpty(<dynamic>[
                tripRow['departureLabel'],
                tripRow['fromLabel'],
                tripRow['departureCity'],
                tripRow['from'],
              ]),
              destination: _firstNotEmpty(<dynamic>[
                tripRow['arrivalLabel'],
                tripRow['toLabel'],
                tripRow['arrivalCity'],
                tripRow['to'],
              ]),
              date: _fmtDate(departureTime),
              time: _fmtTime(departureTime),
              personName: _fullName(
                firstName: passenger?['firstName']?.toString(),
                lastName: passenger?['lastName']?.toString(),
                fallback: 'Passager',
              ),
              personRole: 'Passager',
              rating: _toDouble(passenger?['averageRating'] ?? passenger?['rating']),
              statusLabel: status.isEmpty ? 'En attente' : status,
              statusColor: _statusColor(status),
              isDriver: true,
              tripData: _buildTripExtra(
                tripRow,
                fallbackTripId: tripRow['id']?.toString(),
                driver: null,
                reservationRow: reservationRow,
              ),
            ),
          );
        }
      }

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      body: SafeArea(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Padding(padding: EdgeInsets.fromLTRB(16,16,16,8),
          child: Text('Reservations', style: TextStyle(fontSize:22, fontWeight:FontWeight.w700))),
        Padding(padding: const EdgeInsets.fromLTRB(16,0,16,10),
          child: Container(height:46,
            decoration: BoxDecoration(color:Colors.white, borderRadius:BorderRadius.circular(12),
              border: Border.all(color:const Color(0xFFD8DBE5))),
            child: Row(children: [
              const SizedBox(width:12),
              const Icon(Icons.search, size:18, color:Color(0xFF8A95A8)),
              const SizedBox(width:8),
              Expanded(child: TextField(controller:_searchCtrl,
                decoration: const InputDecoration(
                  hintText:'Rechercher une reservation...',
                  hintStyle: TextStyle(color:Color(0xFF8A95A8), fontSize:14),
                  border:InputBorder.none))),
            ]))),
        if (widget.isDriver)
          TabBar(controller:_tabCtrl, labelColor:const Color(0xFF08316e),
            unselectedLabelColor:const Color(0xFF7A879A),
            indicatorColor:const Color(0xFF08316e),
            tabs:const [Tab(text:'Mes reservations'), Tab(text:'Demandes recues')]),
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.wifi_off_rounded, size: 48, color: Color(0xFF8A95A8)),
                          const SizedBox(height: 12),
                          const Text(
                            'Connexion impossible',
                            style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0D1624)),
                          ),
                          const SizedBox(height: 4),
                          Text(_error!, style: const TextStyle(fontSize: 12, color: Color(0xFF7A879A))),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: _loadReservations,
                            icon: const Icon(Icons.refresh),
                            label: const Text('Réessayer'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1A56CC),
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    )
                  : widget.isDriver
                      ? TabBarView(controller:_tabCtrl, children:[
                          _List(items:_passenger, onTap:(item) => context.push('/trip/${item.tripId}', extra: item.tripData)),
                          _List(
                            items:_driver,
                            onTap:(item) => context.push(
                              item.isDriver ? '/reservation-request/${item.id}' : '/trip/${item.tripId}',
                              extra: item.isDriver ? null : item.tripData,
                            ),
                          ),
                        ])
                      : _List(items:_passenger, onTap:(item) => context.push('/trip/${item.tripId}', extra: item.tripData)),
        ),
      ])),
    );
  }
}

class _List extends StatelessWidget {
  const _List({required this.items, required this.onTap});
  final List<_ResItem> items;
  final void Function(_ResItem) onTap;
  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Center(child: Text('Aucune reservation',
        style: TextStyle(fontSize:16, fontWeight:FontWeight.w700)));
    }
    return ListView.builder(
      padding: const EdgeInsets.only(top:4, bottom:24),
      itemCount: items.length,
      itemBuilder: (_, i) => ListTile(
        title: Text('${items[i].departure} -> ${items[i].destination}',
            style: const TextStyle(fontWeight:FontWeight.w700)),
        subtitle: Text('${items[i].date} ${items[i].time} - ${items[i].personName}'),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal:8, vertical:4),
          decoration: BoxDecoration(color:items[i].statusColor, borderRadius:BorderRadius.circular(8)),
          child: Text(items[i].statusLabel,
              style: const TextStyle(color:Colors.white, fontSize:11, fontWeight:FontWeight.w600))),
        onTap: () => onTap(items[i]),
      ),
    );
  }
}

class _ResItem {
  const _ResItem({required this.id, required this.departure, required this.destination,
    required this.date, required this.time, required this.personName, required this.personRole,
    required this.rating, required this.statusLabel, required this.statusColor,
    required this.tripId, required this.isDriver, required this.tripData});
  final String id, departure, destination, date, time, personName, personRole, tripId, statusLabel;
  final double rating;
  final Color statusColor;
  final bool isDriver;
  final Map<String, dynamic> tripData;
}

Map<String, dynamic> _buildTripExtra(
  Map<String, dynamic>? trip, {
  String? fallbackTripId,
  Map<String, dynamic>? driver,
  Map<String, dynamic>? reservationRow,
}) {
  final Map<String, dynamic> base = <String, dynamic>{...(trip ?? const <String, dynamic>{})};
  if ((base['id']?.toString().isNotEmpty ?? false) == false && (fallbackTripId?.isNotEmpty ?? false)) {
    base['id'] = fallbackTripId;
  }
  if (driver != null && driver.isNotEmpty) {
    base['driver'] = <String, dynamic>{
      ...(base['driver'] is Map<String, dynamic> ? base['driver'] as Map<String, dynamic> : const <String, dynamic>{}),
      ...driver,
    };
    base.putIfAbsent('driverName', () => _fullName(
          firstName: driver['firstName']?.toString(),
          lastName: driver['lastName']?.toString(),
          fallback: 'Conducteur',
        ));
  }
  if (reservationRow != null) {
    if (base['reservationStatus'] == null && reservationRow['status'] != null) {
      base['reservationStatus'] = reservationRow['status'];
    }
    if (base['driverNote'] == null) {
      base['driverNote'] = reservationRow['driverNote'] ?? reservationRow['message'];
    }
  }
  return base;
}

List<dynamic> _extractList(dynamic payload) {
  if (payload is List<dynamic>) return payload;
  if (payload is Map<String, dynamic>) {
    final dynamic data = payload['data'] ?? payload['items'] ?? payload['results'];
    if (data is List<dynamic>) return data;
  }
  return <dynamic>[];
}

DateTime? _toDateTime(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  return DateTime.tryParse(value.toString());
}

double _toDouble(dynamic value) {
  if (value is double) return value;
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? 0;
}

String _firstNotEmpty(List<dynamic> values) {
  for (final dynamic value in values) {
    final String s = value?.toString().trim() ?? '';
    if (s.isNotEmpty) return s;
  }
  return '';
}

String _fullName({
  required String? firstName,
  required String? lastName,
  required String fallback,
}) {
  final String full = '${firstName ?? ''} ${lastName ?? ''}'.trim();
  return full.isEmpty ? fallback : full;
}

String _fmtDate(DateTime? dt) {
  if (dt == null) return '-';
  String two(int v) => v < 10 ? '0$v' : '$v';
  return '${dt.year}-${two(dt.month)}-${two(dt.day)}';
}

String _fmtTime(DateTime? dt) {
  if (dt == null) return '--:--';
  String two(int v) => v < 10 ? '0$v' : '$v';
  return '${two(dt.hour)}:${two(dt.minute)}';
}

Color _statusColor(String status) {
  final String s = status.toLowerCase();
  if (s.contains('confirm')) return const Color(0xFF16a34a);
  if (s.contains('pending') || s.contains('attente')) return const Color(0xFFd97706);
  if (s.contains('refus') || s.contains('cancel')) return const Color(0xFFE24B4A);
  return const Color(0xFF8A95A8);
}
