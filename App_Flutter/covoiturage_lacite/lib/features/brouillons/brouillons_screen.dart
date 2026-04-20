import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/services/api_service.dart';
import '../../core/services/trip_service.dart';
import '../../shared/widgets/item_list_view.dart';

class BrouillonsScreen extends StatefulWidget {
  const BrouillonsScreen({super.key});

  @override
  State<BrouillonsScreen> createState() => _BrouillonsScreenState();
}

class _BrouillonsScreenState extends State<BrouillonsScreen> {
  final TripService _tripService = TripService(ApiService.instance);

  bool _isLoading = true;
  String? _error;
  String _searchQuery = '';
  List<Map<String, dynamic>> _drafts = <Map<String, dynamic>>[];

  @override
  void initState() {
    super.initState();
    _load();
  }

  List<Map<String, dynamic>> get _filteredDrafts {
    Iterable<Map<String, dynamic>> rows = _drafts;
    if (_searchQuery.isNotEmpty) {
      final String q = _searchQuery.toLowerCase();
      rows = rows.where((trip) {
        return (trip['departureLabel']?.toString() ?? trip['from']?.toString() ?? '')
                .toLowerCase()
                .contains(q) ||
            (trip['arrivalLabel']?.toString() ?? trip['to']?.toString() ?? '')
                .toLowerCase()
                .contains(q);
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
      final List<Map<String, dynamic>> trips = await _tripService.getDriverTrips();
      final List<Map<String, dynamic>> drafts = trips.where((trip) {
        final String status = trip['status']?.toString() ?? '';
        return _isDraftStatus(status);
      }).toList();

      if (!mounted) return;
      setState(() {
        _drafts = drafts;
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

  bool _isDraftStatus(String status) {
    final String s = status
        .toLowerCase()
        .replaceAll('\u00E9', 'e')
        .replaceAll('\u00E8', 'e')
        .replaceAll('\u00EA', 'e')
        .replaceAll('\u00E0', 'a')
        .trim();
    return s == 'draft' || s == 'pending' || s == 'brouillon' || s == 'en attente';
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
        child: ItemListView<Map<String, dynamic>>(
          items: _filteredDrafts,
          isLoading: _isLoading,
          error: _error,
          searchHint: 'Rechercher un trajet...',
          onRefresh: _load,
          onSearch: (q) => setState(() => _searchQuery = q),
          emptyTitle: 'Aucun brouillon',
          emptySubtitle: 'Vos trajets non publies apparaitront ici.',
          itemBuilder: (trip) => _BrouillonCard(trip: trip, onPublished: _load),
        ),
      ),
    );
  }
}

class _BrouillonCard extends StatelessWidget {
  const _BrouillonCard({
    required this.trip,
    this.onPublished,
  });

  final Map<String, dynamic> trip;
  final Future<void> Function()? onPublished;

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

  bool get _isDraft {
    final String s = (trip['status']?.toString() ?? '').toLowerCase();
    return s == 'draft' || s == 'brouillon';
  }

  Future<void> _publish(BuildContext context) async {
    final String id = trip['id']?.toString() ?? '';
    if (id.isEmpty) return;

    try {
      await ApiService.instance.post('/api/trips/$id/publish', <String, dynamic>{});
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Trajet publie !')),
      );
      await onPublished?.call();
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Echec : $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final DateTime? dt = _parseDate(trip['departureTime'] ?? trip['departureDateTime']);
    final String departure = trip['departureLabel']?.toString() ?? trip['from']?.toString() ?? '-';
    final String destination = trip['arrivalLabel']?.toString() ?? trip['to']?.toString() ?? '-';
    final String status = trip['status']?.toString() ?? '';
    final int seats = (trip['availableSeats'] as num?)?.toInt() ??
        (trip['seats'] as num?)?.toInt() ??
        0;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFD8DBE5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      departure,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0D1624),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      destination,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF3D4A5C),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      dt == null
                          ? '-'
                          : '${dt.day} ${_month(dt.month)} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}',
                      style: const TextStyle(color: Color(0xFF7A879A)),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$seats places',
                      style: const TextStyle(color: Color(0xFF7A879A)),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _isDraft ? const Color(0xFFEEF0F5) : const Color(0xFFFFF4E5),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  status.isEmpty ? (_isDraft ? 'Draft' : 'Pending') : status,
                  style: TextStyle(
                    color: _isDraft ? const Color(0xFF3D4A5C) : const Color(0xFFD97706),
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: <Widget>[
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    final String id = trip['id']?.toString() ?? '';
                    if (id.isEmpty) return;
                    context.push('/trip/$id', extra: trip);
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF1A56CC)),
                    foregroundColor: const Color(0xFF1A56CC),
                  ),
                  child: const Text('Modifier'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _publish(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F6E56),
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Publier'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
