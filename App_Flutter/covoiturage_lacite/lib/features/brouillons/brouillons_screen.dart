import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/services/api_service.dart';
import '../../core/utils/parsing.dart' as parsing;
import '../../shared/cards/trip_card.dart';
import '../../shared/widgets/item_list_view.dart';

class BrouillonsScreen extends StatefulWidget {
  const BrouillonsScreen({super.key});

  @override
  State<BrouillonsScreen> createState() => _BrouillonsScreenState();
}

class _BrouillonsScreenState extends State<BrouillonsScreen> {
  bool _isLoading = true;
  String? _error;
  String _searchQuery = '';
  List<TripData> _drafts = <TripData>[];
  final Map<String, Map<String, dynamic>> _draftPayloadById =
      <String, Map<String, dynamic>>{};

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
      final dynamic payload = await ApiService.instance.get('/api/drafts');
      final List<dynamic> rows = parsing.extractList(payload);
      if (!mounted) return;
      setState(() {
        _draftPayloadById
          ..clear()
          ..addEntries(
            rows
                .whereType<Map<String, dynamic>>()
                .map((Map<String, dynamic> row) => MapEntry<String, Map<String, dynamic>>(
                      row['id']?.toString() ?? '',
                      row,
                    ))
                .where((MapEntry<String, Map<String, dynamic>> e) => e.key.isNotEmpty),
          );
        _drafts = rows.whereType<Map<String, dynamic>>().map(_mapDraft).toList();
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

  TripData _mapDraft(Map<String, dynamic> row) {
    final DateTime? dt = _parseDate(row['departureTime'] ?? row['departureDateTime']);
    final String timeLabel = dt == null
        ? '-'
        : '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';

    return TripData(
      id: row['id']?.toString() ?? '',
      timeLabel: timeLabel,
      departure: row['departureLabel']?.toString() ?? row['from']?.toString() ?? '-',
      destination: row['arrivalLabel']?.toString() ?? row['to']?.toString() ?? '-',
      status: TripStatus.published,
      role: TripRole.driver,
      price: (row['price'] as num?)?.toDouble() ?? 0,
      passengerLabel: '${row['availableSeats'] ?? 0}/${row['totalSeats'] ?? row['seats'] ?? 0} passagers',
      pendingRequests: 0,
    );
  }

  List<TripData> get _filteredDrafts {
    if (_searchQuery.isEmpty) return _drafts;
    final String q = _searchQuery.toLowerCase();
    return _drafts.where((TripData t) {
      return t.departure.toLowerCase().contains(q) || t.destination.toLowerCase().contains(q);
    }).toList();
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
          'Brouillons',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 17),
        ),
        leading: const BackButton(color: Colors.white),
      ),
      body: SafeArea(
        top: false,
        child: ItemListView<TripData>(
          items: _drafts,
          filteredItems: _filteredDrafts,
          isLoading: _isLoading,
          error: _error,
          searchHint: 'Rechercher un brouillon...',
          onRefresh: _load,
          onSearch: (String q) => setState(() => _searchQuery = q),
          emptyTitle: 'Aucun brouillon',
          emptySubtitle: 'Vos trajets non publies apparaitront ici.',
          itemBuilder: (TripData item) => TripCard(
            data: item,
            onTap: () {
              final Map<String, dynamic> prefill =
                  _draftPayloadById[item.id] ?? <String, dynamic>{'id': item.id};
              context.push('/create-trip', extra: prefill);
            },
          ),
        ),
      ),
    );
  }
}
