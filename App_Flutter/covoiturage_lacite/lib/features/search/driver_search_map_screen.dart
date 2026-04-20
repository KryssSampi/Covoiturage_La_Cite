import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../core/services/api_service.dart';
import 'models/circuit.dart';

class DriverSearchMapArgs {
  const DriverSearchMapArgs({
    required this.fromText,
    required this.toText,
    this.date,
    this.seats = 1,
    this.initialCircuits = const <Circuit>[],
    this.mapBundleUrl = 'https://covoiturage-la-cite.vercel.app',
  });

  final String fromText;
  final String toText;
  final DateTime? date;
  final int seats;
  final List<Circuit> initialCircuits;
  final String mapBundleUrl;
}

class DriverSearchMapScreen extends StatefulWidget {
  const DriverSearchMapScreen({super.key, this.args});
  final DriverSearchMapArgs? args;

  @override
  State<DriverSearchMapScreen> createState() => _DriverSearchMapScreenState();
}

class _DriverSearchMapScreenState extends State<DriverSearchMapScreen> {
  late final WebViewController _webController;
  bool _mapReady = false;
  bool _isLoading = true;
  String? _error;

  List<Circuit> _circuits = const <Circuit>[];
  int _activeIndex = 0;

  DriverSearchMapArgs get _args =>
      widget.args ?? const DriverSearchMapArgs(fromText: '', toText: '');

  @override
  void initState() {
    super.initState();
    _initWebView();
    _loadCircuits();
  }

  void _initWebView() {
    _webController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'MapBridge',
        onMessageReceived: _onBridgeMessage,
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) {
            setState(() => _mapReady = true);
            _pushCircuitsToMap();
          },
          onWebResourceError: (_) {
            if (!mounted) return;
            setState(() => _error = 'Carte indisponible');
          },
        ),
      )
      ..loadRequest(Uri.parse(_args.mapBundleUrl));
  }

  void _onBridgeMessage(JavaScriptMessage message) {
    try {
      final dynamic parsed = jsonDecode(message.message);
      if (parsed is! Map<String, dynamic>) return;
      final String? type = parsed['type']?.toString();
      if (type == 'CIRCUIT_SELECTED') {
        final int i = int.tryParse((parsed['index'] ?? 0).toString()) ?? 0;
        if (i >= 0 && i < _circuits.length) {
          setState(() => _activeIndex = i);
        }
      }
    } catch (_) {}
  }

  Future<void> _loadCircuits() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      List<Circuit> circuits = _args.initialCircuits;

      if (circuits.isEmpty) {
        final dynamic data = await ApiService.instance.get(
          '/api/trips/search',
          params: <String, dynamic>{
            'from': _args.fromText,
            'to': _args.toText,
            'seats': _args.seats.toString(),
          },
        );
        final Map<String, dynamic> body =
            data is Map<String, dynamic> ? data : <String, dynamic>{};
        final List<dynamic> items = (body['data']?['items'] ?? body['items'] ?? <dynamic>[]) as List<dynamic>;

        circuits = items.whereType<Map<String, dynamic>>().map((Map<String, dynamic> m) {
          final String departure = (m['departureLabel'] ?? m['from'] ?? '').toString();
          final String arrival = (m['arrivalLabel'] ?? m['to'] ?? '').toString();
          final List<Map<String, dynamic>> points = _mapWaypoints(m['waypoints'] ?? m['route'] ?? m['coordinates']);
          return Circuit(
            id: m['id']?.toString() ?? '',
            label: '$departure -> $arrival',
            waypoints: points,
            tripId: m['id']?.toString(),
            departureLabel: departure,
            arrivalLabel: arrival,
            distanceMeters: _asDouble(m['estimatedDistanceKm']) > 0
                ? _asDouble(m['estimatedDistanceKm']) * 1000
                : _asDouble(m['estimatedDistance']),
            durationSeconds: _asDouble(m['estimatedDurationMin']) > 0
                ? _asDouble(m['estimatedDurationMin']) * 60
                : _asDouble(m['estimatedDuration']),
          );
        }).toList();
      }

      if (!mounted) return;
      setState(() {
        _circuits = circuits;
        _activeIndex = circuits.isEmpty ? 0 : 0;
      });
      _pushCircuitsToMap();
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
    } finally {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  void _pushCircuitsToMap() {
    if (!_mapReady) return;
    final payload = <String, dynamic>{
      'type': 'SET_CIRCUITS',
      'circuits': _circuits.map((e) => e.toJson()).toList(),
      'activeIndex': _activeIndex,
    };
    _webController.runJavaScript(
      'window.mapBridge && window.mapBridge.send(${jsonEncode(payload)})',
    );
  }

  void _selectCircuit(int index) {
    if (index < 0 || index >= _circuits.length) return;
    setState(() => _activeIndex = index);
    if (!_mapReady) return;
    final List<Map<String, dynamic>> waypoints = _circuits[index].waypoints;
    _webController.runJavaScript('showRoute(${jsonEncode(waypoints)})');
    final payload = <String, dynamic>{'type': 'SELECT_CIRCUIT', 'index': index};
    _webController.runJavaScript(
      'window.mapBridge && window.mapBridge.send(${jsonEncode(payload)})',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _args.fromText.isEmpty && _args.toText.isEmpty
              ? 'Circuits conducteur'
              : '${_args.fromText} -> ${_args.toText}',
        ),
      ),
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
                      FilledButton(onPressed: _loadCircuits, child: const Text('Reessayer')),
                    ],
                  ),
                )
              : Column(
                  children: [
                    Container(
                      margin: const EdgeInsets.fromLTRB(12, 12, 12, 8),
                      height: 240,
                      width: double.infinity,
                      clipBehavior: Clip.antiAlias,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFD8DBE5)),
                      ),
                      child: Stack(
                        children: [
                          Positioned.fill(child: WebViewWidget(controller: _webController)),
                          if (!_mapReady)
                            const Positioned.fill(
                              child: ColoredBox(
                                color: Color(0xFFF2F5FA),
                                child: Center(child: CircularProgressIndicator()),
                              ),
                            ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: ListView.separated(
                        padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                        itemCount: _circuits.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (_, i) {
                          final c = _circuits[i];
                          final bool selected = i == _activeIndex;
                          return Card(
                            color: selected ? const Color(0xFFE8F0FE) : Colors.white,
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        c.label,
                                        style: const TextStyle(fontWeight: FontWeight.w700),
                                      ),
                                      const Spacer(),
                                      if (selected)
                                        const Icon(Icons.check_circle, color: Color(0xFF0F6E56), size: 18),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text('${c.departureLabel} -> ${c.arrivalLabel}'),
                                  const SizedBox(height: 2),
                                  Text('${c.formattedDistance} • ${c.formattedDuration}',
                                      style: const TextStyle(color: Color(0xFF6B7280))),
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      OutlinedButton(
                                        onPressed: () => _selectCircuit(i),
                                        child: const Text('Afficher ce circuit'),
                                      ),
                                      const SizedBox(width: 8),
                                      FilledButton(
                                        onPressed: () =>
                                            context.push('/create-trip', extra: c.toCreateTripPrefill()),
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

List<Map<String, dynamic>> _mapWaypoints(dynamic raw) {
  if (raw is List) {
    return raw.map<Map<String, dynamic>>((dynamic row) {
      if (row is Map) {
        final Map<dynamic, dynamic> m = row;
        return <String, dynamic>{
          'lat': _asDouble(m['lat'] ?? m['latitude']),
          'lng': _asDouble(m['lng'] ?? m['lon'] ?? m['longitude']),
        };
      }
      if (row is List && row.length >= 2) {
        return <String, dynamic>{
          'lat': _asDouble(row[0]),
          'lng': _asDouble(row[1]),
        };
      }
      return <String, dynamic>{'lat': 0.0, 'lng': 0.0};
    }).where((Map<String, dynamic> p) => (p['lat'] as double) != 0 || (p['lng'] as double) != 0).toList();
  }
  return <Map<String, dynamic>>[];
}

double _asDouble(dynamic value) {
  if (value is double) return value;
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? 0;
}
