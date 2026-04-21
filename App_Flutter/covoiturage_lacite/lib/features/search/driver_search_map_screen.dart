import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'driver_circuits_web_api.dart';
import 'models/circuit.dart';

class DriverSearchMapArgs {
  const DriverSearchMapArgs({
    required this.fromText,
    required this.toText,
    this.fromLat,
    this.fromLng,
    this.toLat,
    this.toLng,
    this.date,
    this.seats = 1,
    this.initialCircuits = const <Circuit>[],
    this.mapBundleUrl = '',
  });

  final String fromText;
  final String toText;
  final double? fromLat;
  final double? fromLng;
  final double? toLat;
  final double? toLng;
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
  String? _mapError;

  List<Circuit> _circuits = const <Circuit>[];
  int _activeIndex = 0;

  DriverSearchMapArgs get _args =>
      widget.args ?? const DriverSearchMapArgs(fromText: '', toText: '');

  bool get _hasCoordinates =>
      _args.fromLat != null &&
      _args.fromLng != null &&
      _args.toLat != null &&
      _args.toLng != null;

  @override
  void initState() {
    super.initState();
    _initWebView();
    _loadCircuits();
  }

  Future<void> _initWebView() async {
    _webController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'MapBridge',
        onMessageReceived: _onBridgeMessage,
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) {
            if (!mounted) return;
            setState(() {
              _mapReady = true;
              _mapError = null;
            });
            _pushCircuitsToMap();
          },
          onWebResourceError: (_) {
            if (!mounted) return;
            setState(() {
              _mapReady = false;
              _mapError = 'Carte indisponible. Les circuits restent selectionnables.';
            });
          },
        ),
      );

    await _loadMapBundle();
  }

  Future<void> _loadMapBundle() async {
    final String source = _args.mapBundleUrl.trim();

    try {
      if (source.isEmpty) {
        await _webController.loadFlutterAsset('assets/web/map/index.html');
        return;
      }
      if (source.startsWith('http://') || source.startsWith('https://')) {
        await _webController.loadRequest(Uri.parse(source));
        return;
      }
      final String path = source.startsWith('file://')
          ? Uri.parse(source).toFilePath(windows: true)
          : source;
      await _webController.loadFile(path);
    } catch (_) {
      await _webController.loadFlutterAsset('assets/web/map/index.html');
    }
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
      final List<Circuit> circuits = <Circuit>[
        ..._args.initialCircuits,
      ];

      // Recherche conducteur : appel direct à l'API circuits du site web
      if (_hasCoordinates) {
        final List<Circuit> webCircuits = await fetchDriverCircuitsFromWeb(
          depLng: _args.fromLng!,
          depLat: _args.fromLat!,
          arrLng: _args.toLng!,
          arrLat: _args.toLat!,
          depLabel: _args.fromText,
          arrLabel: _args.toText,
        );
        circuits.addAll(webCircuits);
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
      'circuits': _circuits.map(_toMapCircuit).toList(),
      'activeIndex': _activeIndex,
    };
    _webController.runJavaScript(
      'window.mapBridge && window.mapBridge.send(${jsonEncode(payload)})',
    );
  }

  void _selectCircuit(int index) {
    if (index < 0 || index >= _circuits.length) return;
    setState(() => _activeIndex = index);
    if (_mapReady) {
      final List<Map<String, dynamic>> waypoints = _circuits[index].waypoints;
      _webController.runJavaScript('showRoute(${jsonEncode(waypoints)})');
      final payload = <String, dynamic>{
        'type': 'SELECT_CIRCUIT',
        'index': index,
        'circuit': _toMapCircuit(_circuits[index]),
      };
      _webController.runJavaScript(
        'window.mapBridge && window.mapBridge.send(${jsonEncode(payload)})',
      );
    }
  }

  Map<String, dynamic> _toMapCircuit(Circuit circuit) {
    final Map<String, dynamic> base = circuit.toJson();
    base['polyline'] = circuit.waypoints;
    base['points'] = circuit.waypoints;
    return base;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F5FA),
      body: SafeArea(
        child: Column(
          children: <Widget>[
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(8, 8, 12, 10),
              child: Row(
                children: <Widget>[
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back, color: Color(0xFF08316E)),
                  ),
                  Expanded(
                    child: Text(
                      '${_args.fromText} -> ${_args.toText}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFF0D1624),
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: _loadCircuits,
                    icon: const Icon(Icons.refresh, color: Color(0xFF1A56CC)),
                  ),
                ],
              ),
            ),
            if (_error != null)
              Container(
                width: double.infinity,
                color: const Color(0xFFFAEEDA),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Text(
                  'Erreur: $_error',
                  style: const TextStyle(
                    color: Color(0xFF854F0B),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            _buildMapPanel(),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _circuits.isEmpty
                      ? const Center(
                          child: Text(
                            'Aucun circuit disponible pour cette recherche.',
                            style: TextStyle(color: Color(0xFF6B7280)),
                          ),
                        )
                      : ListView.separated(
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
                                  children: <Widget>[
                                    Row(
                                      children: <Widget>[
                                        Expanded(
                                          child: Text(
                                            c.label,
                                            style: const TextStyle(fontWeight: FontWeight.w700),
                                          ),
                                        ),
                                        if (selected)
                                          const Icon(
                                            Icons.check_circle,
                                            color: Color(0xFF0F6E56),
                                            size: 18,
                                          ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text('${c.departureLabel} -> ${c.arrivalLabel}'),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${c.formattedDistance} | ${c.formattedDuration}',
                                      style: const TextStyle(color: Color(0xFF6B7280)),
                                    ),
                                    const SizedBox(height: 10),
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 8,
                                      children: <Widget>[
                                        OutlinedButton(
                                          onPressed: () => _selectCircuit(i),
                                          child: const Text('Afficher ce circuit'),
                                        ),
                                        FilledButton(
                                          onPressed: () => context.push(
                                            '/create-trip',
                                            extra: c.toCreateTripPrefill(),
                                          ),
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
      ),
    );
  }

  Widget _buildMapPanel() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 12, 12, 8),
      height: 260,
      width: double.infinity,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFD8DBE5)),
      ),
      child: Stack(
        children: <Widget>[
          Positioned.fill(child: WebViewWidget(controller: _webController)),
          if (_mapError != null)
            Positioned.fill(
              child: ColoredBox(
                color: const Color(0xFFF2F5FA),
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      _mapError!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Color(0xFF6B7280),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          if (_mapError == null && !_mapReady)
            const Positioned.fill(
              child: ColoredBox(
                color: Color(0xFFF2F5FA),
                child: Center(child: CircularProgressIndicator()),
              ),
            ),
        ],
      ),
    );
  }
}

