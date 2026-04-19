import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'models/circuit.dart';

class DriverSearchMapScreen extends StatefulWidget {
  const DriverSearchMapScreen({super.key});

  @override
  State<DriverSearchMapScreen> createState() => _DriverSearchMapScreenState();
}

class _DriverSearchMapScreenState extends State<DriverSearchMapScreen> {
  bool _isLoading = true;
  String? _error;
  List<Circuit> _circuits = const <Circuit>[];
  String? _selectedCircuitId;

  Circuit? get _selected {
    for (final c in _circuits) {
      if (c.id == _selectedCircuitId) return c;
    }
    return null;
  }

  @override
  void initState() {
    super.initState();
    _loadMockCircuits();
  }

  Future<void> _loadMockCircuits() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      // Temporary local fallback while waiting for Claude Web module / map bridge output.
      final circuits = <Circuit>[
        const Circuit(
          id: 'c1',
          departureLabel: 'Campus La Cite',
          arrivalLabel: "Place d'Orleans",
          distanceKm: 12.4,
          durationMin: 24,
          pricePerSeat: 4.5,
          polyline: <List<double>>[
            <double>[45.4215, -75.6972],
            <double>[45.4300, -75.6700],
          ],
        ),
        const Circuit(
          id: 'c2',
          departureLabel: 'Campus La Cite',
          arrivalLabel: 'Barrhaven',
          distanceKm: 22.9,
          durationMin: 39,
          pricePerSeat: 7.0,
          polyline: <List<double>>[
            <double>[45.4215, -75.6972],
            <double>[45.2900, -75.7600],
          ],
        ),
      ];
      if (!mounted) return;
      setState(() {
        _circuits = circuits;
        _selectedCircuitId = circuits.isNotEmpty ? circuits.first.id : null;
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
    final selected = _selected;
    return Scaffold(
      appBar: AppBar(title: const Text('Circuits conducteur')),
      backgroundColor: const Color(0xFFF2F5FA),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Erreur: $_error'),
                      const SizedBox(height: 8),
                      FilledButton(onPressed: _loadMockCircuits, child: const Text('Reessayer')),
                    ],
                  ),
                )
              : Column(
                  children: [
                    Container(
                      margin: const EdgeInsets.fromLTRB(12, 12, 12, 8),
                      height: 220,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFD8DBE5)),
                      ),
                      child: Center(
                        child: Text(
                          selected == null
                              ? 'Carte indisponible'
                              : 'Map placeholder\nPolyline active: ${selected.id}',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Color(0xFF6B7280)),
                        ),
                      ),
                    ),
                    Expanded(
                      child: ListView.builder(
                        itemCount: _circuits.length,
                        padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                        itemBuilder: (_, i) {
                          final c = _circuits[i];
                          final isSelected = c.id == _selectedCircuitId;
                          return Card(
                            color: isSelected ? const Color(0xFFE8F0FE) : Colors.white,
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('${c.departureLabel} -> ${c.arrivalLabel}',
                                      style: const TextStyle(fontWeight: FontWeight.w700)),
                                  const SizedBox(height: 4),
                                  Text('${c.distanceKm.toStringAsFixed(1)} km • ${c.durationMin} min'),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      OutlinedButton(
                                        onPressed: () => setState(() => _selectedCircuitId = c.id),
                                        child: const Text('Afficher ce circuit'),
                                      ),
                                      const SizedBox(width: 8),
                                      FilledButton(
                                        onPressed: () => context.push('/create-trip', extra: c.toCreateTripPrefill()),
                                        child: const Text('Choisir ce circuit'),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
    );
  }
}
