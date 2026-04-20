import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/services/api_service.dart';
import '../../shared/cards/reservation_card.dart';
import '../../shared/widgets/item_list_view.dart';

class HistoriqueScreen extends StatefulWidget {
  const HistoriqueScreen({super.key});

  @override
  State<HistoriqueScreen> createState() => _HistoriqueScreenState();
}

class _HistoriqueScreenState extends State<HistoriqueScreen> {
  bool _isLoading = true;
  String? _error;
  String _activeFilter = 'all';
  String _searchQuery = '';
  List<ReservationData> _items = <ReservationData>[];

  static final Set<String> _historyStatuses = <String>{
    'completed',
    'termine',
    'terminee',
    'cancelled',
    'canceled',
    'annule',
    'annulee',
    'refuse',
    'refusee',
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  List<FilterOption> get _filterOptions => <FilterOption>[
        FilterOption(label: 'Tous', value: 'all', isActive: _activeFilter == 'all'),
        FilterOption(
          label: 'Terminees',
          value: 'completed',
          isActive: _activeFilter == 'completed',
        ),
        FilterOption(
          label: 'Annulees',
          value: 'cancelled',
          isActive: _activeFilter == 'cancelled',
        ),
      ];

  List<ReservationData> get _filtered {
    Iterable<ReservationData> rows = _items;

    if (_activeFilter == 'completed') {
      rows = rows.where((r) => _isCompletedStatus(r.status));
    } else if (_activeFilter == 'cancelled') {
      rows = rows.where((r) => _isCancelledStatus(r.status));
    }

    if (_searchQuery.isNotEmpty) {
      final String q = _searchQuery.toLowerCase();
      rows = rows.where((r) {
        return r.departure.toLowerCase().contains(q) ||
            r.destination.toLowerCase().contains(q) ||
            r.personName?.toLowerCase().contains(q) == true;
      });
    }

    return rows.toList();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final dynamic payload = await ApiService.instance.get('/api/reservations');
      final List<dynamic> rows = _extractRows(payload);
      final List<ReservationData> mapped = rows
          .whereType<Map<String, dynamic>>()
          .where((row) => _historyStatuses.contains(_normalizeStatus(row['status']?.toString() ?? '')))
          .map(_map)
          .toList();

      if (!mounted) return;
      setState(() {
        _items = mapped;
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

  ReservationData _map(Map<String, dynamic> row) {
    final Map<String, dynamic> trip = row['trip'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final Map<String, dynamic> driver =
        row['driver'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final DateTime? dt = _parseDate(
      trip['departureTime'] ?? trip['departureDateTime'] ?? '',
    );

    return ReservationData(
      id: row['id']?.toString() ?? '',
      departure: trip['departureLabel']?.toString() ?? trip['from']?.toString() ?? '-',
      destination: trip['arrivalLabel']?.toString() ?? trip['to']?.toString() ?? '-',
      date: dt != null ? '${dt.day} ${_month(dt.month)}' : '-',
      time: dt != null
          ? '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}'
          : '-',
      status: row['status']?.toString() ?? '',
      role: ReservationRole.passenger,
      personName: '${driver['firstName'] ?? ''} ${driver['lastName'] ?? ''}'.trim(),
      personRating: (driver['rating'] as num?)?.toDouble(),
      price: (trip['price'] as num?)?.toDouble(),
      tripId: trip['id']?.toString(),
    );
  }

  bool _isCompletedStatus(String status) {
    final String s = _normalizeStatus(status);
    return s == 'completed' || s == 'termine' || s == 'terminee';
  }

  bool _isCancelledStatus(String status) {
    final String s = _normalizeStatus(status);
    return s == 'cancelled' ||
        s == 'canceled' ||
        s == 'annule' ||
        s == 'annulee' ||
        s == 'refuse' ||
        s == 'refusee';
  }

  List<dynamic> _extractRows(dynamic payload) {
    if (payload is List<dynamic>) return payload;
    if (payload is Map<String, dynamic>) {
      final dynamic data = payload['data'] ?? payload['items'] ?? payload['results'];
      if (data is List<dynamic>) return data;
    }
    return <dynamic>[];
  }

  String _normalizeStatus(String value) {
    return value
        .toLowerCase()
        .replaceAll('\u00E9', 'e')
        .replaceAll('\u00E8', 'e')
        .replaceAll('\u00EA', 'e')
        .replaceAll('\u00E0', 'a')
        .replaceAll('\u00F9', 'u')
        .trim();
  }

  DateTime? _parseDate(dynamic value) {
    if (value is DateTime) return value;
    if (value == null) return null;
    return DateTime.tryParse(value.toString());
  }

  String _month(int month) {
    const List<String> months = <String>[
      '',
      'jan',
      'fev',
      'mar',
      'avr',
      'mai',
      'jun',
      'jul',
      'aou',
      'sep',
      'oct',
      'nov',
      'dec',
    ];
    if (month < 1 || month > 12) return '';
    return months[month];
  }

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
        child: ItemListView<ReservationData>(
          items: _filtered,
          isLoading: _isLoading,
          error: _error,
          searchHint: 'Rechercher un trajet...',
          filterOptions: _filterOptions,
          onRefresh: _load,
          onSearch: (q) => setState(() => _searchQuery = q),
          onFilterChanged: (v) => setState(() => _activeFilter = v.value),
          emptyTitle: 'Aucun trajet dans l\'historique',
          emptySubtitle: 'Vos trajets termines et annules apparaitront ici.',
          itemBuilder: (item) => ReservationCard(
            data: item,
            onTap: () {
              if (item.tripId != null && item.tripId!.isNotEmpty) {
                context.push('/trip/${item.tripId}');
              }
            },
          ),
        ),
      ),
    );
  }
}
