import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/models/trip.dart';
import '../../core/services/trip_service.dart';
import 'trip_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key, required this.tripService, this.initialFrom, this.initialTo});

  final TripService tripService;
  final String? initialFrom;
  final String? initialTo;

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
  List<Trip> _results = [];

  static const _suggestions = [
    'Campus La Cité', 'Place d\'Orléans', 'Barrhaven Town Centre',
    'Arrêt Hurdman', 'Gatineau Centre',
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
    _fromCtrl.dispose(); _toCtrl.dispose();
    _fromFocus.dispose(); _toFocus.dispose();
    super.dispose();
  }

  Future<void> _runSearch() async {
    FocusScope.of(context).unfocus();
    setState(() { _isLoading = true; _error = null; _hasSearched = true; });
    try {
      final results = await widget.tripService.searchTrips(
        from: _fromCtrl.text.trim(), to: _toCtrl.text.trim());
      setState(() => _results = results);
    } catch (_) {
      setState(() => _error = 'Connexion impossible. Vérifiez votre réseau.');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _selectSuggestion(String label) {
    if (_fromFocus.hasFocus) _fromCtrl.text = label;
    else _toCtrl.text = label;
    setState(() {});
    FocusScope.of(context).unfocus();
  }

  void _navigateToDetail(Trip trip) {
    context.push('/trip/${trip.id}', extra: trip);
  }

  @override
  Widget build(BuildContext context) {
    final isFocused = _fromFocus.hasFocus || _toFocus.hasFocus;
    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      body: SafeArea(
        child: Column(
          children: [
            // Input zone
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      children: [
                        _SearchField(ctrl: _fromCtrl, focus: _fromFocus, hint: 'Point de départ',
                            dotColor: const Color(0xFF1A56CC), onChanged: () => setState(() {})),
                        if (!isFocused)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 2),
                            child: Row(children: [
                              const SizedBox(width: 44),
                              Container(width: 1.5, height: 20, color: const Color(0xFFD8DBE5)),
                              const Spacer(),
                              GestureDetector(
                                onTap: () => setState(() {
                                  final tmp = _fromCtrl.text;
                                  _fromCtrl.text = _toCtrl.text;
                                  _toCtrl.text = tmp;
                                }),
                                child: Container(
                                  width: 28, height: 28,
                                  decoration: const BoxDecoration(color: Color(0xFFEEF0F5), shape: BoxShape.circle),
                                  child: const Icon(Icons.swap_vert, size: 16, color: Color(0xFF545D6E)),
                                ),
                              ),
                            ]),
                          ),
                        _SearchField(ctrl: _toCtrl, focus: _toFocus, hint: 'Destination',
                            dotColor: const Color(0xFFE24B4A), onChanged: () => setState(() {})),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  GestureDetector(
                    onTap: () => context.push('/driver-search-map'),
                    child: Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F6E56),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.map_rounded, color: Colors.white, size: 22),
                    ),
                  ),
                  const SizedBox(width: 10),
                  GestureDetector(
                    onTap: isFocused
                        ? () => FocusScope.of(context).unfocus()
                        : (_canSearch ? _runSearch : null),
                    child: Container(
                      width: 52, height: 52,
                      decoration: BoxDecoration(
                        color: isFocused
                            ? const Color(0xFF0F6E56)
                            : (_canSearch ? const Color(0xFF1A56CC) : const Color(0xFFD8DBE5)),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(isFocused ? Icons.check : Icons.search, color: Colors.white, size: 24),
                    ),
                  ),
                ],
              ),
            ),
            // Suggestions or results
            if (isFocused)
              Expanded(
                child: Container(
                  color: Colors.white,
                  child: ListView(
                    padding: EdgeInsets.zero,
                    children: [
                      const Padding(
                        padding: EdgeInsets.fromLTRB(16, 12, 16, 6),
                        child: Text('SUGGESTIONS',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                                color: Color(0xFF7A879A), letterSpacing: 0.8)),
                      ),
                      ..._suggestions.map((s) => ListTile(
                        leading: Container(
                          width: 36, height: 36,
                          decoration: BoxDecoration(color: const Color(0xFFE8F0FE), borderRadius: BorderRadius.circular(10)),
                          child: const Icon(Icons.location_on_outlined, color: Color(0xFF1A56CC), size: 18),
                        ),
                        title: Text(s, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: const Text('Lieu populaire', style: TextStyle(fontSize: 12, color: Color(0xFF7A879A))),
                        onTap: () => _selectSuggestion(s),
                      )),
                    ],
                  ),
                ),
              )
            else
              Expanded(child: _ResultsZone(
                isLoading: _isLoading, hasSearched: _hasSearched,
                error: _error, results: _results,
                onRetry: _runSearch, onTripTap: _navigateToDetail,
              )),
          ],
        ),
      ),
    );
  }
}

class _SearchField extends StatelessWidget {
  const _SearchField({required this.ctrl, required this.focus, required this.hint,
      required this.dotColor, required this.onChanged});
  final TextEditingController ctrl;
  final FocusNode focus;
  final String hint;
  final Color dotColor;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: focus.hasFocus ? const Color(0xFF1A56CC) : const Color(0xFFD8DBE5)),
      ),
      child: Row(
        children: [
          const SizedBox(width: 12),
          Container(width: 10, height: 10, decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle)),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: ctrl, focusNode: focus, onChanged: (_) => onChanged(),
              style: const TextStyle(fontSize: 14, color: Color(0xFF0D1624)),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: const TextStyle(color: Color(0xFF8A95A8), fontSize: 14),
                border: InputBorder.none,
              ),
            ),
          ),
          if (ctrl.text.isNotEmpty)
            GestureDetector(
              onTap: () { ctrl.clear(); onChanged(); },
              child: const Padding(padding: EdgeInsets.only(right: 10),
                  child: Icon(Icons.close, size: 16, color: Color(0xFF8A95A8))),
            ),
        ],
      ),
    );
  }
}

class _ResultsZone extends StatelessWidget {
  const _ResultsZone({required this.isLoading, required this.hasSearched, required this.error,
      required this.results, required this.onRetry, required this.onTripTap});
  final bool isLoading, hasSearched;
  final String? error;
  final List<Trip> results;
  final VoidCallback onRetry;
  final void Function(Trip) onTripTap;

  @override
  Widget build(BuildContext context) {
    if (isLoading) return const Center(child: CircularProgressIndicator(color: Color(0xFF1A56CC)));
    if (error != null) return _EmptyState(icon: Icons.wifi_off, iconColor: const Color(0xFFE24B4A),
        iconBg: const Color(0xFFFCEBEB), title: 'Pas de connexion', subtitle: error!,
        actionLabel: 'Réessayer', onAction: onRetry);
    if (hasSearched && results.isEmpty) return const _EmptyState(icon: Icons.directions_car_outlined,
        iconColor: Color(0xFF8A95A8), iconBg: Color(0xFFEEF0F5),
        title: 'Aucun résultat', subtitle: 'Aucun trajet trouvé. Essayez d\'autres adresses.');
    if (!hasSearched) return const _EmptyState(icon: Icons.search,
        iconColor: Color(0xFF8A95A8), iconBg: Color(0xFFEEF0F5),
        title: 'Trouvez un trajet', subtitle: 'Saisissez un départ et une destination.');
    return ListView.builder(
      padding: const EdgeInsets.only(top: 8, bottom: 24),
      itemCount: results.length,
      itemBuilder: (_, i) => TripCard(trip: results[i], onTap: () => onTripTap(results[i])),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.icon, required this.iconColor, required this.iconBg,
      required this.title, required this.subtitle, this.actionLabel, this.onAction});
  final IconData icon;
  final Color iconColor, iconBg;
  final String title, subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Center(child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 72, height: 72,
            decoration: BoxDecoration(color: iconBg, shape: BoxShape.circle),
            child: Icon(icon, size: 36, color: iconColor)),
        const SizedBox(height: 16),
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Text(subtitle, textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, color: Color(0xFF7A879A))),
        if (actionLabel != null && onAction != null) ...[
          const SizedBox(height: 20),
          ElevatedButton(onPressed: onAction,
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1A56CC), foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
            child: Text(actionLabel!)),
        ],
      ]),
    ));
  }
}
