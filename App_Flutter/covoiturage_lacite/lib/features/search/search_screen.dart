import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/models/trip.dart';
import '../../core/services/trip_service.dart';
import 'driver_search_map_screen.dart';
import 'trip_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({
    super.key,
    required this.tripService,
    this.initialFrom,
    this.initialTo,
    this.isDriver = true,
  });

  final TripService tripService;
  final String? initialFrom;
  final String? initialTo;
  final bool isDriver;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _fromCtrl = TextEditingController();
  final _toCtrl = TextEditingController();
  final _fromFocus = FocusNode();
  final _toFocus = FocusNode();

  bool _isLoading = false;
  bool _hasSearched = false;
  String? _error;
  List<Trip> _results = <Trip>[];

  static const List<String> _suggestions = <String>[
    'Campus La Cite',
    'Place d\'Orleans',
    'Barrhaven Town Centre',
    'Arret Hurdman',
    'Gatineau Centre',
  ];

  bool get _canSearch =>
      _fromCtrl.text.trim().isNotEmpty && _toCtrl.text.trim().isNotEmpty;

  @override
  void initState() {
    super.initState();
    if (widget.initialFrom != null) _fromCtrl.text = widget.initialFrom!;
    if (widget.initialTo != null) _toCtrl.text = widget.initialTo!;
  }

  @override
  void dispose() {
    _fromCtrl.dispose();
    _toCtrl.dispose();
    _fromFocus.dispose();
    _toFocus.dispose();
    super.dispose();
  }

  Future<void> _runSearch() async {
    FocusScope.of(context).unfocus();
    setState(() {
      _isLoading = true;
      _error = null;
      _hasSearched = true;
    });
    try {
      final results = await widget.tripService.searchTrips(
        from: _fromCtrl.text.trim(),
        to: _toCtrl.text.trim(),
      );
      setState(() => _results = results);
    } catch (_) {
      setState(() => _error = 'Connexion impossible. Verifiez votre reseau.');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _selectSuggestion(String label) {
    if (_fromFocus.hasFocus) {
      _fromCtrl.text = label;
    } else {
      _toCtrl.text = label;
    }
    setState(() {});
    FocusScope.of(context).unfocus();
  }

  void _navigateToDetail(Trip trip) {
    context.push('/trip/${trip.id}', extra: trip);
  }

  void _openMapAfterSearch() {
    context.push(
      '/driver-search-map',
      extra: DriverSearchMapArgs(
        fromText: _fromCtrl.text.trim(),
        toText: _toCtrl.text.trim(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isFocused = _fromFocus.hasFocus || _toFocus.hasFocus;

    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      body: SafeArea(
        child: Column(
          children: [
            Container(
              color: const Color(0xFF08316E),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      children: [
                        _SearchField(
                          ctrl: _fromCtrl,
                          focus: _fromFocus,
                          hint: 'Point de depart',
                          dotColor: Colors.white,
                          onChanged: () => setState(() {}),
                        ),
                        const SizedBox(height: 8),
                        _SearchField(
                          ctrl: _toCtrl,
                          focus: _toFocus,
                          hint: 'Destination',
                          dotColor: const Color(0xFF1A56CC),
                          onChanged: () => setState(() {}),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  GestureDetector(
                    onTap: _canSearch ? _runSearch : null,
                    child: Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: _canSearch
                            ? const Color(0xFF1A56CC)
                            : const Color(0xFF94A3B8),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.search, color: Colors.white, size: 24),
                    ),
                  ),
                ],
              ),
            ),
            if (!isFocused)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                color: const Color(0xFFF2F5FA),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: _suggestions
                        .map(
                          (s) => Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: InkWell(
                              onTap: () {
                                _toCtrl.text = s;
                                setState(() {});
                              },
                              borderRadius: BorderRadius.circular(999),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEEF0F5),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  s,
                                  style: const TextStyle(
                                    color: Color(0xFF3D4A5C),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                ),
              ),
            Expanded(
              child: isFocused
                  ? _FocusSuggestions(
                      suggestions: _suggestions,
                      onSelect: _selectSuggestion,
                    )
                  : _ResultsZone(
                      isLoading: _isLoading,
                      hasSearched: _hasSearched,
                      error: _error,
                      results: _results,
                      onRetry: _runSearch,
                      onTripTap: _navigateToDetail,
                      showMapAfterSearch: widget.isDriver,
                      onMapTap: _openMapAfterSearch,
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SearchField extends StatelessWidget {
  const _SearchField({
    required this.ctrl,
    required this.focus,
    required this.hint,
    required this.dotColor,
    required this.onChanged,
  });

  final TextEditingController ctrl;
  final FocusNode focus;
  final String hint;
  final Color dotColor;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFD8DBE5)),
      ),
      child: Row(
        children: [
          const SizedBox(width: 12),
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: ctrl,
              focusNode: focus,
              onChanged: (_) => onChanged(),
              decoration: InputDecoration(
                hintText: hint,
                border: InputBorder.none,
                hintStyle: const TextStyle(color: Color(0xFF8A95A8), fontSize: 14),
              ),
              style: const TextStyle(fontSize: 14, color: Color(0xFF0D1624)),
            ),
          ),
          if (ctrl.text.isNotEmpty)
            InkWell(
              onTap: () {
                ctrl.clear();
                onChanged();
              },
              child: const Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(Icons.close, size: 16, color: Color(0xFF8A95A8)),
              ),
            ),
        ],
      ),
    );
  }
}

class _FocusSuggestions extends StatelessWidget {
  const _FocusSuggestions({required this.suggestions, required this.onSelect});

  final List<String> suggestions;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: ListView.separated(
        itemCount: suggestions.length,
        separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0x12000000)),
        itemBuilder: (_, i) => ListTile(
          onTap: () => onSelect(suggestions[i]),
          leading: const Icon(Icons.place_outlined, color: Color(0xFF1A56CC)),
          title: Text(suggestions[i], style: const TextStyle(fontWeight: FontWeight.w600)),
          subtitle: const Text('Lieu suggere', style: TextStyle(color: Color(0xFF7A879A))),
        ),
      ),
    );
  }
}

class _ResultsZone extends StatelessWidget {
  const _ResultsZone({
    required this.isLoading,
    required this.hasSearched,
    required this.error,
    required this.results,
    required this.onRetry,
    required this.onTripTap,
    required this.showMapAfterSearch,
    required this.onMapTap,
  });

  final bool isLoading;
  final bool hasSearched;
  final String? error;
  final List<Trip> results;
  final VoidCallback onRetry;
  final void Function(Trip) onTripTap;
  final bool showMapAfterSearch;
  final VoidCallback onMapTap;

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF1A56CC)));
    }

    if (error != null) {
      return Center(
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
            Text(error!, style: const TextStyle(fontSize: 12, color: Color(0xFF7A879A))),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Reessayer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1A56CC),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      );
    }

    if (!hasSearched) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.route_rounded, size: 72, color: Color(0xFFB6C2D3)),
            SizedBox(height: 12),
            Text(
              'Ou souhaitez-vous aller ?',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF0D1624)),
            ),
          ],
        ),
      );
    }

    if (results.isEmpty) {
      return const Center(
        child: Text(
          'Aucun resultat',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF0D1624)),
        ),
      );
    }

    return Column(
      children: [
        if (showMapAfterSearch)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onMapTap,
                icon: const Icon(Icons.map_rounded),
                label: const Text('Afficher la carte'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F6E56),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 24),
            itemCount: results.length,
            separatorBuilder: (_, __) => const Padding(
              padding: EdgeInsets.symmetric(horizontal: 10),
              child: Divider(height: 14, color: Color(0x1A000000)),
            ),
            itemBuilder: (_, i) => Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x14000000),
                    blurRadius: 10,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              child: TripCard(trip: results[i], onTap: () => onTripTap(results[i])),
            ),
          ),
        ),
      ],
    );
  }
}
