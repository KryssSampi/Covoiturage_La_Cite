import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/services/api_service.dart';
import '../../core/state/app_state.dart';
import '../../core/utils/parsing.dart' as parsing;
import '../../shared/cards/trip_card.dart';
import '../../shared/widgets/item_list_view.dart';

class HistoriqueScreen extends StatefulWidget {
  const HistoriqueScreen({super.key});

  @override
  State<HistoriqueScreen> createState() => _HistoriqueScreenState();
}

class _HistoriqueScreenState extends State<HistoriqueScreen> {
  bool _isLoading = true;
  String? _error;
  String _searchQuery = '';
  String _activeFilter = 'all';
  List<TripData> _items = <TripData>[];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final String path = AppStateStore.instance.isDriver
          ? '/api/driver/historique'
          : '/api/passenger/historique';
      final dynamic payload = await ApiService.instance.get(path);
      final List<dynamic> rows = parsing.extractList(payload);
      if (!mounted) return;
      setState(() {
        _items = rows.whereType<Map<String, dynamic>>().map(_mapTrip).toList();
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = e.toString();
      });
    }
  }

  DateTime? _parseDate(dynamic v) {
    if (v == null) return null;
    try {
      return DateTime.parse(v.toString()).toLocal();
    } catch (_) {
      return null;
    }
  }

  TripStatus _parseStatus(String raw) {
    final String s = raw.toLowerCase();
    if (s.contains('cancel')) return TripStatus.cancelled;
    if (s.contains('progress') || s.contains('started'))
      return TripStatus.inProgress;
    if (s.contains('request') || s.contains('pending'))
      return TripStatus.withRequests;
    if (s.contains('complete') || s.contains('done'))
      return TripStatus.completed;
    return TripStatus.published;
  }

  TripData _mapTrip(Map<String, dynamic> row) {
    final DateTime? dt =
        _parseDate(row['departureTime'] ?? row['departureDateTime']);
    final String timeLabel = dt == null
        ? '-'
        : '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';

    final bool isDriverMode = AppStateStore.instance.isDriver;

    final Map<String, dynamic>? driver = row['driver'] is Map<String, dynamic>
        ? row['driver'] as Map<String, dynamic>
        : null;
    final String driverFirstName = driver?['firstName']?.toString() ?? '';
    final String driverLastName = driver?['lastName']?.toString() ?? '';
    final String driverName = ('$driverFirstName $driverLastName').trim();
    final double? driverRating =
        driver != null ? (driver['averageRating'] as num?)?.toDouble() : null;

    return TripData(
      id: row['id']?.toString() ?? '',
      timeLabel: timeLabel,
      departure:
          row['departureLabel']?.toString() ?? row['from']?.toString() ?? '-',
      destination:
          row['arrivalLabel']?.toString() ?? row['to']?.toString() ?? '-',
      status: _parseStatus(row['status']?.toString() ?? ''),
      role: isDriverMode ? TripRole.driver : TripRole.passenger,
      price: (row['pricePerPassenger'] as num?)?.toDouble() ??
          (row['price'] as num?)?.toDouble() ??
          0,
      passengerLabel: isDriverMode
          ? '${row['currentPassengers'] ?? row['availableSeats'] ?? 0}/${row['maxPassengers'] ?? row['totalSeats'] ?? row['seats'] ?? 0} passagers'
          : null,
      driverName:
          isDriverMode ? null : (driverName.isEmpty ? null : driverName),
      driverRating: isDriverMode ? null : driverRating,
      pendingRequests: 0,
    );
  }

  List<TripData> get _filteredItems {
    Iterable<TripData> rows = _items;

    if (_activeFilter == 'completed') {
      rows = rows.where((TripData t) => t.status == TripStatus.completed);
    } else if (_activeFilter == 'cancelled') {
      rows = rows.where((TripData t) => t.status == TripStatus.cancelled);
    }

    if (_searchQuery.isNotEmpty) {
      final String q = _searchQuery.toLowerCase();
      rows = rows.where((TripData t) {
        return t.departure.toLowerCase().contains(q) ||
            t.destination.toLowerCase().contains(q);
      });
    }

    return rows.toList();
  }

  List<FilterOption> get _filters => <FilterOption>[
        FilterOption(
            label: 'Tous', value: 'all', isActive: _activeFilter == 'all'),
        FilterOption(
            label: 'Termines',
            value: 'completed',
            isActive: _activeFilter == 'completed'),
        FilterOption(
            label: 'Annules',
            value: 'cancelled',
            isActive: _activeFilter == 'cancelled'),
      ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF08316E),
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Historique',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 17),
        ),
        leading: const BackButton(color: Colors.white),
      ),
      body: SafeArea(
        top: false,
        child: ItemListView<TripData>(
          items: _items,
          filteredItems: _filteredItems,
          isLoading: _isLoading,
          error: _error,
          searchHint: 'Rechercher un trajet...',
          filterOptions: _filters,
          onSearch: (String q) => setState(() => _searchQuery = q),
          onFilterChanged: (FilterOption f) =>
              setState(() => _activeFilter = f.value),
          onRefresh: _load,
          emptyTitle: 'Aucun trajet dans l\'historique',
          emptySubtitle: 'Vos trajets passes apparaitront ici.',
          itemBuilder: (TripData item) => TripCard(
            data: item,
            onTap: () => context.push('/trip/${item.id}'),
          ),
        ),
      ),
    );
  }
}
